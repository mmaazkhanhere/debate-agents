from __future__ import annotations

from collections.abc import Callable
from typing import Any, TypeVar

from tenacity import Retrying, retry_if_exception, stop_after_attempt, wait_exponential_jitter

from app.core.logger import logger

T = TypeVar("T")


RATE_LIMIT_MARKERS = (
    "rate limit",
    "rate_limit",
    "too many requests",
    "429",
    "resource has been exhausted",
)

TRANSIENT_ERROR_MARKERS = (
    "timed out",
    "timeout",
    "temporarily unavailable",
    "service unavailable",
    "server overloaded",
    "connection reset",
    "connection aborted",
    "connection refused",
    "bad gateway",
    "gateway timeout",
    "try again",
    "503",
    "504",
    "502",
)

TRANSIENT_CLASS_MARKERS = (
    "timeout",
    "connection",
    "ratelimit",
    "temporary",
)


def _message(exception: BaseException) -> str:
    return str(exception).strip().lower()


def _status_code(exception: BaseException) -> int | None:
    code = getattr(exception, "status_code", None)
    if isinstance(code, int):
        return code
    response = getattr(exception, "response", None)
    response_code = getattr(response, "status_code", None)
    if isinstance(response_code, int):
        return response_code
    return None


def is_rate_limit_error(exception: BaseException) -> bool:
    status_code = _status_code(exception)
    if status_code == 429:
        return True
    message = _message(exception)
    return any(marker in message for marker in RATE_LIMIT_MARKERS)


def is_retriable_error(exception: BaseException) -> bool:
    if is_rate_limit_error(exception):
        return True

    status_code = _status_code(exception)
    if status_code is not None and 500 <= status_code < 600:
        return True

    if isinstance(exception, (TimeoutError, ConnectionError)):
        return True

    class_name = exception.__class__.__name__.lower()
    if any(marker in class_name for marker in TRANSIENT_CLASS_MARKERS):
        return True

    message = _message(exception)
    return any(marker in message for marker in TRANSIENT_ERROR_MARKERS)


def call_with_retry(
    operation: Callable[[], T],
    operation_name: str,
    max_attempts: int,
    initial_wait_seconds: float,
    max_wait_seconds: float,
) -> T:
    if max_attempts <= 1:
        return operation()

    retryer = Retrying(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential_jitter(
            initial=initial_wait_seconds,
            max=max_wait_seconds,
        ),
        retry=retry_if_exception(is_retriable_error),
        reraise=True,
    )

    for attempt in retryer:
        with attempt:
            try:
                return operation()
            except Exception as exc:
                if not is_retriable_error(exc):
                    raise
                attempt_number = attempt.retry_state.attempt_number
                if attempt_number < max_attempts:
                    logger.warning(
                        "retrying_operation name=%s attempt=%s/%s error=%s",
                        operation_name,
                        attempt_number,
                        max_attempts,
                        exc,
                    )
                raise

    # StopIteration should never happen because tenacity either returns or raises.
    raise RuntimeError(f"Retry loop exhausted unexpectedly for {operation_name}")
