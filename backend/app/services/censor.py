import re
from typing import Any


OSINT_FIELD_MAP = {
    "email": ["Email", "email", "Mail", "mail", "E-mail", "Correo", "correo", "Login", "login", "Username", "username", "User", "user"],
    "password": ["Password", "password", "Pass", "pass", "Passwd", "pwd", "Contraseña", "contraseña", "ContraseñaHash"],
    "hash": ["Hash", "hash", "PasswordHash", "password_hash", "PassHash"],
    "phone": ["Phone", "phone", "Tel", "tel", "Telefono", "telefono", "Mobile", "mobile"],
    "name": ["Name", "name", "Nombre", "nombre", "FullName", "full_name"],
}


def censor_password(value: str | None) -> str:
    if not value or not isinstance(value, str):
        return "[oculto]"
    v = value.strip()
    if not v:
        return "[oculto]"
    if v.startswith("$2") or v.startswith("$6") or re.match(r"^sha\d", v, re.I) or len(v) > 48:
        return censor_hash(v)
    if len(v) <= 3:
        return "••••"
    hidden = max(4, len(v) - 4)
    return f"{v[:2]}{'•' * hidden}{v[-2:]}"


def censor_hash(value: str | None) -> str:
    if not value:
        return "[hash oculto]"
    v = str(value).strip()
    if len(v) <= 10:
        return f"{v[:3]}••••"
    return f"{v[:8]}••••••"


def censor_email(value: str | None) -> str:
    if not value or not isinstance(value, str) or "@" not in value:
        return value or "[oculto]"
    user, domain = value.split("@", 1)
    if not user:
        return f"***@{domain}"
    visible = user[: min(3, len(user))]
    masked = "*" * max(2, len(user) - len(visible))
    return f"{visible}{masked}@{domain}"


def censor_phone(value: str | None) -> str:
    if not value:
        return "[oculto]"
    digits = re.sub(r"\D", "", str(value))
    if len(digits) < 6:
        return "••••••"
    return f"{digits[:3]}••••{digits[-2:]}"


def censor_generic(value: str | None) -> str:
    if not value or not isinstance(value, str):
        return "[oculto]"
    v = value.strip()
    if len(v) <= 4:
        return "••••"
    return f"{v[:2]}{'•' * max(3, len(v) - 4)}{v[-2:]}"


def pick_field(entry: dict[str, Any], keys: list[str]) -> str | None:
    for key in keys:
        val = entry.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return None


def normalize_osint_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "email": pick_field(entry, OSINT_FIELD_MAP["email"]),
        "password": pick_field(entry, OSINT_FIELD_MAP["password"]),
        "hash": pick_field(entry, OSINT_FIELD_MAP["hash"]),
        "phone": pick_field(entry, OSINT_FIELD_MAP["phone"]),
        "name": pick_field(entry, OSINT_FIELD_MAP["name"]),
        "raw": entry,
    }


def severity_from_record(normalized: dict[str, Any]) -> str:
    if normalized.get("password") and not normalized.get("hash"):
        return "Critical"
    if normalized.get("hash") or normalized.get("password"):
        return "High"
    if normalized.get("email") or normalized.get("phone"):
        return "Medium"
    return "Low"
