import json
import os
from dataclasses import dataclass


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
