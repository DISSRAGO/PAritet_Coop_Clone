import time
from typing import Any


class TTLCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float | None]] = {}

    def exists(self, key: str) -> bool:
        if key not in self._store:
            return False

        _, expires_at = self._store[key]

        if expires_at is not None and time.time() > expires_at:
            self.delete(key)
            return False

        return True

    def get(self, key: str, default: Any = None) -> Any:
        if not self.exists(key):
            return default
        return self._store[key][0]

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        expires_at = None if ttl is None else time.time() + ttl
        self._store[key] = (value, expires_at)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)


cache = TTLCache()