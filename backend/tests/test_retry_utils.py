import pytest

from src.retry_utils import call_with_retry, is_rate_limit_error, is_retriable_error


class HttpError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code


def test_is_rate_limit_error_detects_message() -> None:
    exc = Exception("429 too many requests from upstream")
    assert is_rate_limit_error(exc) is True


def test_is_rate_limit_error_detects_status_code() -> None:
    exc = HttpError("request failed", 429)
    assert is_rate_limit_error(exc) is True


def test_is_retriable_error_detects_timeout() -> None:
    exc = TimeoutError("operation timed out")
    assert is_retriable_error(exc) is True


def test_is_retriable_error_detects_5xx_status_code() -> None:
    exc = HttpError("service unavailable", 503)
    assert is_retriable_error(exc) is True


def test_is_retriable_error_rejects_non_transient() -> None:
    exc = ValueError("invalid user input")
    assert is_retriable_error(exc) is False


def test_call_with_retry_retries_until_success() -> None:
    attempts = {"count": 0}

    def flaky_operation() -> str:
        attempts["count"] += 1
        if attempts["count"] < 3:
            raise Exception("rate limit exceeded")
        return "ok"

    result = call_with_retry(
        operation=flaky_operation,
        operation_name="flaky_operation",
        max_attempts=4,
        initial_wait_seconds=0,
        max_wait_seconds=0,
    )

    assert result == "ok"
    assert attempts["count"] == 3


def test_call_with_retry_stops_on_non_retriable_error() -> None:
    attempts = {"count": 0}

    def bad_operation() -> None:
        attempts["count"] += 1
        raise ValueError("bad payload")

    with pytest.raises(ValueError):
        call_with_retry(
            operation=bad_operation,
            operation_name="bad_operation",
            max_attempts=4,
            initial_wait_seconds=0,
            max_wait_seconds=0,
        )

    assert attempts["count"] == 1
