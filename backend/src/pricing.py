import json
import os
from dataclasses import dataclass
from typing import Any

from .storage import record_llm_call


@dataclass(frozen=True)
class ModelRates:
    input_per_million: float
    output_per_million: float


DEFAULT_RATES: dict[str, ModelRates] = {
    # Configure via PRICING_JSON to override or add models.
    "groq/llama-3.1-8b-instant": ModelRates(0.0, 0.0),
    "groq/qwen/qwen3-32b": ModelRates(0.0, 0.0),
    "groq/llama-3.3-70b-versatile": ModelRates(0.0, 0.0),
    "groq/openai/gpt-oss-120b": ModelRates(0.0, 0.0),
}


def _load_rates_from_env() -> dict[str, ModelRates]:
    raw = os.getenv("PRICING_JSON", "").strip()
    if not raw:
        return {}
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    rates: dict[str, ModelRates] = {}
    for model, value in payload.items():
        if not isinstance(value, dict):
            continue
        input_rate = float(value.get("input_per_million", 0.0))
        output_rate = float(value.get("output_per_million", 0.0))
        rates[str(model)] = ModelRates(input_rate, output_rate)
    return rates


def get_model_rates(model: str) -> ModelRates:
    env_rates = _load_rates_from_env()
    if model in env_rates:
        return env_rates[model]
    return DEFAULT_RATES.get(model, ModelRates(0.0, 0.0))


def compute_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    rates = get_model_rates(model)
    input_cost = (input_tokens / 1_000_000.0) * rates.input_per_million
    output_cost = (output_tokens / 1_000_000.0) * rates.output_per_million
    return round(input_cost + output_cost, 6)


def extract_usage_fields(usage: object) -> dict[str, int]:
    if usage is None:
        return {}
    if isinstance(usage, dict):
        src = usage
    else:
        src = {}
        for key in (
            "total_tokens",
            "prompt_tokens",
            "cached_prompt_tokens",
            "completion_tokens",
            "successful_requests",
        ):
            value = getattr(usage, key, None)
            if value is not None:
                src[key] = value

    prompt_tokens = int(
        src.get("prompt_tokens")
        or src.get("input_tokens")
        or src.get("prompt_token_count")
        or 0
    )
    completion_tokens = int(
        src.get("completion_tokens")
        or src.get("output_tokens")
        or src.get("candidates_token_count")
        or 0
    )
    cached_prompt_tokens = int(
        src.get("cached_prompt_tokens")
        or src.get("cached_tokens")
        or 0
    )
    total_tokens = int(
        src.get("total_tokens")
        or src.get("total_token_count")
        or (prompt_tokens + completion_tokens)
    )
    successful_requests = int(src.get("successful_requests") or 1)
    return {
        "total_tokens": total_tokens,
        "prompt_tokens": prompt_tokens,
        "cached_prompt_tokens": cached_prompt_tokens,
        "completion_tokens": completion_tokens,
        "successful_requests": successful_requests,
    }


def accumulate_usage(
    usage: object,
    debate_token_usage: dict[str, int],
) -> dict[str, int]:
    parsed = extract_usage_fields(usage)
    if not parsed:
        return {}
    for key, value in parsed.items():
        debate_token_usage[key] = debate_token_usage.get(key, 0) + value
    return parsed


def record_call_usage(
    model: str,
    usage: object,
    debate_token_usage: dict[str, int],
    cost_by_model: dict[str, float],
    debate_id: str,
) -> dict[str, int]:
    parsed = accumulate_usage(usage, debate_token_usage)
    if not parsed:
        return {}
    input_tokens = parsed["prompt_tokens"]
    output_tokens = parsed["completion_tokens"]
    cost_usd = compute_cost_usd(model, input_tokens, output_tokens)
    cost_by_model[model] = cost_by_model.get(model, 0.0) + cost_usd
    record_llm_call(
        debate_id=debate_id,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost_usd,
    )
    return parsed


def record_usage_from_response(
    response: object,
    model: str,
    debate_token_usage: dict[str, int],
    cost_by_model: dict[str, float],
    debate_id: str,
) -> None:
    usage = getattr(response, "token_usage", None)
    record_call_usage(
        model=model,
        usage=usage,
        debate_token_usage=debate_token_usage,
        cost_by_model=cost_by_model,
        debate_id=debate_id,
    )


def record_usage_from_llm(
    llm: Any,
    model: str,
    debate_token_usage: dict[str, int],
    cost_by_model: dict[str, float],
    debate_id: str,
) -> None:
    try:
        usage = llm.get_token_usage_summary()
    except Exception:
        # If provider does not expose usage for direct LLM calls, skip.
        return
    record_call_usage(
        model=model,
        usage=usage,
        debate_token_usage=debate_token_usage,
        cost_by_model=cost_by_model,
        debate_id=debate_id,
    )


def debate_usage_as_text(debate_token_usage: dict[str, int]) -> str:
    usage = debate_token_usage
    return (
        f"total_tokens={usage.get('total_tokens', 0)} "
        f"prompt_tokens={usage.get('prompt_tokens', 0)} "
        f"cached_prompt_tokens={usage.get('cached_prompt_tokens', 0)} "
        f"completion_tokens={usage.get('completion_tokens', 0)} "
        f"successful_requests={usage.get('successful_requests', 0)}"
    )
