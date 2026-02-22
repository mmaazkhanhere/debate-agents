import time
import uuid
from pathlib import Path
import pytest
import redis as redis_lib
from fastapi.testclient import TestClient

import api as api_module
import src.storage as storage
import src.utils as utils


@pytest.fixture()
def test_db_path(monkeypatch):
    db_root = Path("data") / "test-dbs"
    db_root.mkdir(parents=True, exist_ok=True)
    db_path = db_root / f"debate-{uuid.uuid4().hex}.db"
    monkeypatch.setattr(storage, "DB_PATH", db_path)
    storage.init_db()
    return db_path


@pytest.fixture()
def redis_client(monkeypatch):
    client = redis_lib.Redis(
        host=utils.REDIS_HOST,
        port=utils.REDIS_PORT,
        db=15,
        decode_responses=True,
    )
    try:
        client.ping()
    except Exception:
        pytest.skip("redis not available")
    client.flushdb()
    monkeypatch.setattr(utils, "redis_client", client)
    monkeypatch.setattr(api_module, "redis_client", client)
    return client


@pytest.fixture()
def no_flow(monkeypatch):
    tasks = []

    async def _noop(*_args, **_kwargs):
        return None

    def _fake_create_task(coro):
        tasks.append(coro)
        try:
            coro.close()
        except Exception:
            pass
        return None

    monkeypatch.setattr(api_module, "run_debate_flow", _noop)
    monkeypatch.setattr(api_module.asyncio, "create_task", _fake_create_task)
    return tasks


@pytest.fixture()
def client(test_db_path, redis_client, monkeypatch):
    monkeypatch.setattr(api_module, "DEBATE_CACHE_ENABLED", True)
    monkeypatch.setattr(api_module, "DEBATE_LOCK_TTL_SECONDS", 2)
    monkeypatch.setattr(utils, "DEBATE_CACHE_TTL_SECONDS", 2)
    return TestClient(api_module.app)


def _post_debate(client, topic, d1, d2, session_id, user_id=None):
    payload = {
        "topic": topic,
        "debater_1": d1,
        "debater_2": d2,
        "session_id": session_id,
    }
    if user_id is not None:
        payload["user_id"] = user_id
    return client.post("/debate", json=payload)


def _count_debates():
    with storage.get_db() as conn:
        row = conn.execute("SELECT COUNT(*) AS c FROM debates").fetchone()
        return int(row["c"])


@pytest.mark.usefixtures("no_flow")
def test_missing_session_id_returns_400(client):
    resp = _post_debate(client, "Topic", "A", "B", "")
    assert resp.status_code == 400


@pytest.mark.usefixtures("no_flow")
def test_cache_hit_returns_cached_and_no_new_debate(client):
    base_count = _count_debates()
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    utils.set_cached_debate_id(cache_key, "debate-111", ttl_seconds=60)

    resp = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["debate_id"] == "debate-111"
    assert data["cached"] is True
    assert _count_debates() == base_count


@pytest.mark.usefixtures("no_flow")
def test_cache_miss_creates_debate_and_sets_inflight(client, redis_client):
    base_count = _count_debates()
    resp = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cached"] is False
    assert _count_debates() == base_count + 1

    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    inflight_key = utils.build_inflight_key(cache_key)
    assert utils.get_inflight_debate_id(inflight_key) == data["debate_id"]


@pytest.mark.usefixtures("no_flow")
def test_lock_busy_with_inflight_returns_inflight(client, redis_client):
    base_count = _count_debates()
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    lock_key = utils.build_lock_key(cache_key)
    inflight_key = utils.build_inflight_key(cache_key)

    redis_client.set(lock_key, "token", ex=30)
    redis_client.set(inflight_key, "debate-222", ex=30)

    resp = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["debate_id"] == "debate-222"
    assert data["cached"] is False
    assert data["inflight"] is True
    assert _count_debates() == base_count


@pytest.mark.usefixtures("no_flow")
def test_lock_busy_without_inflight_returns_409(client, redis_client):
    base_count = _count_debates()
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    lock_key = utils.build_lock_key(cache_key)
    redis_client.set(lock_key, "token", ex=30)

    resp = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp.status_code == 409
    assert _count_debates() == base_count


@pytest.mark.usefixtures("no_flow")
def test_cache_scope_isolated_by_user(client):
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    utils.set_cached_debate_id(cache_key, "debate-333", ttl_seconds=60)

    resp = _post_debate(client, "Topic", "A", "B", "s1", "u2")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cached"] is False
    assert data["debate_id"] != "debate-333"


@pytest.mark.usefixtures("no_flow")
def test_cache_scope_isolated_by_session_when_no_user(client):
    cache_key = utils.build_cache_key("Topic", "A", "B", None, "s1")
    utils.set_cached_debate_id(cache_key, "debate-444", ttl_seconds=60)

    resp = _post_debate(client, "Topic", "A", "B", "s2", None)
    assert resp.status_code == 200
    data = resp.json()
    assert data["cached"] is False
    assert data["debate_id"] != "debate-444"


@pytest.mark.usefixtures("no_flow")
def test_normalization_hits_cache(client):
    cache_key = utils.build_cache_key("  Foo  ", "Elon  Musk", "Greta  ", "u1", "s1")
    utils.set_cached_debate_id(cache_key, "debate-555", ttl_seconds=60)

    resp = _post_debate(client, "foo", "elon musk", "  greta", "s1", "u1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cached"] is True
    assert data["debate_id"] == "debate-555"


@pytest.mark.usefixtures("no_flow")
def test_debater_order_matters(client):
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    utils.set_cached_debate_id(cache_key, "debate-666", ttl_seconds=60)

    resp = _post_debate(client, "Topic", "B", "A", "s1", "u1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cached"] is False
    assert data["debate_id"] != "debate-666"


@pytest.mark.usefixtures("no_flow")
def test_cache_disabled_always_new(test_db_path, redis_client, monkeypatch):
    monkeypatch.setattr(api_module, "DEBATE_CACHE_ENABLED", False)
    client = TestClient(api_module.app)

    resp1 = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    resp2 = _post_debate(client, "Topic", "A", "B", "s1", "u1")

    assert resp1.status_code == 200
    assert resp2.status_code == 200
    assert resp1.json()["debate_id"] != resp2.json()["debate_id"]


@pytest.mark.usefixtures("no_flow")
def test_cache_ttl_expires(client):
    cache_key = utils.build_cache_key("Topic", "A", "B", "u1", "s1")
    utils.set_cached_debate_id(cache_key, "debate-777", ttl_seconds=1)

    resp1 = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp1.status_code == 200
    assert resp1.json()["debate_id"] == "debate-777"

    time.sleep(2)
    resp2 = _post_debate(client, "Topic", "A", "B", "s1", "u1")
    assert resp2.status_code == 200
    assert resp2.json()["debate_id"] != "debate-777"
