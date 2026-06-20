import re
from typing import Any

OSINT_FIELD_MAP = {
    "email": [
        "Email",
        "email",
        "Mail",
        "mail",
        "E-mail",
        "E-Mail",
        "Correo",
        "correo",
        "Login",
        "login",
        "Username",
        "username",
        "UserName",
        "userName",
        "User",
        "user",
        "Nick",
        "nick",
        "Nickname",
        "nickname",
        "Account",
        "account",
        "Log",
        "log",
        "Identity",
        "identity",
        "Address",
        "address",
        "EMail",
        "E_Mail",
        "e_mail",
        "LoginName",
        "login_name",
        "MailLogin",
        "mail_login",
        "Логин",
        "Почта",
        "Пользователь",
    ],
    "password": [
        "Password",
        "password",
        "Pass",
        "pass",
        "Passwd",
        "pwd",
        "Contraseña",
        "contraseña",
        "ContraseñaHash",
        "Пароль",
    ],
    "hash": ["Hash", "hash", "PasswordHash", "password_hash", "PassHash"],
    "phone": ["Phone", "phone", "Tel", "tel", "Telefono", "telefono", "Mobile", "mobile"],
    "name": ["Name", "name", "Nombre", "nombre", "FullName", "full_name"],
    "date": [
        "LastActive",
        "Date",
        "date",
        "Created",
        "created",
        "Time",
        "Timestamp",
        "RegDate",
        "RegistrationDate",
        "Added",
        "LastSeen",
        "Year",
        "Дата",
    ],
}

SOURCE_DATE_KEYS = ["LastUpdate", "Date", "date", "Added", "Time", "Timestamp"]
PASSWORD_KEY_HINTS = {k.lower() for k in OSINT_FIELD_MAP["password"] + OSINT_FIELD_MAP["hash"]}
URL_KEY_HINTS = {"url", "link", "site", "domain", "host", "soft", "application", "app", "program"}
LOGIN_KEY_HINTS = {k.lower() for k in OSINT_FIELD_MAP["email"] + OSINT_FIELD_MAP["name"]}
EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w.-]+\.\w+")


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

    lower_map = {str(k).lower(): k for k in entry.keys()}
    for key in keys:
        actual = lower_map.get(key.lower())
        if actual is None:
            continue
        val = entry.get(actual)
        if val is not None and str(val).strip():
            return str(val).strip()
    return None


def _split_combo_login_password(value: str | None) -> tuple[str | None, str | None]:
    if not value or not isinstance(value, str):
        return None, value
    v = value.strip()
    if ":" not in v or v.startswith("$"):
        return None, v
    login_part, pass_part = v.split(":", 1)
    login_part = login_part.strip()
    pass_part = pass_part.strip()
    if login_part and pass_part and ("@" in login_part or len(login_part) >= 3):
        return login_part, pass_part
    return None, v


def infer_login_from_entry(entry: dict[str, Any], normalized: dict[str, Any]) -> str | None:
    if normalized.get("email") or normalized.get("phone") or normalized.get("name"):
        return None

    for key, val in entry.items():
        if val is None or not isinstance(val, str):
            continue
        text = val.strip()
        if not text:
            continue
        key_lower = str(key).lower()
        if key_lower in PASSWORD_KEY_HINTS or key_lower in URL_KEY_HINTS:
            continue
        match = EMAIL_PATTERN.search(text)
        if match:
            return match.group(0)
        if key_lower in LOGIN_KEY_HINTS and len(text) >= 3:
            return text
    return None


def extract_osint_date(entry: dict[str, Any], source_data: dict[str, Any] | None = None) -> str:
    raw = pick_field(entry, OSINT_FIELD_MAP["date"])
    if not raw and source_data:
        raw = pick_field(source_data, SOURCE_DATE_KEYS)
    if not raw:
        return "—"
    if isinstance(raw, (int, float)):
        text = str(int(raw))
        if len(text) == 4:
            return text
        return "—"
    text = str(raw).strip()
    if not text:
        return "—"
    if len(text) >= 10 and (" " in text or "T" in text):
        return text.split("T")[0].split(" ")[0]
    if re.match(r"^\d{4}-\d{2}-\d{2}", text):
        return text[:10]
    if re.match(r"^\d{4}$", text):
        return text
    return text


def format_login_display(normalized: dict[str, Any]) -> str:
    if normalized.get("email"):
        return censor_email(normalized["email"])
    if normalized.get("phone"):
        return censor_phone(normalized["phone"])
    if normalized.get("name"):
        return censor_generic(normalized["name"])
    return "—"


def normalize_osint_entry(entry: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "email": pick_field(entry, OSINT_FIELD_MAP["email"]),
        "password": pick_field(entry, OSINT_FIELD_MAP["password"]),
        "hash": pick_field(entry, OSINT_FIELD_MAP["hash"]),
        "phone": pick_field(entry, OSINT_FIELD_MAP["phone"]),
        "name": pick_field(entry, OSINT_FIELD_MAP["name"]),
        "raw": entry,
    }

    combo_login, combo_password = _split_combo_login_password(normalized.get("password"))
    if combo_login:
        normalized["email"] = combo_login
        normalized["password"] = combo_password

    inferred = infer_login_from_entry(entry, normalized)
    if inferred:
        if "@" in inferred:
            normalized["email"] = inferred
        else:
            normalized["name"] = inferred

    return normalized


def severity_from_record(normalized: dict[str, Any]) -> str:
    if normalized.get("password") and not normalized.get("hash"):
        return "Critical"
    if normalized.get("hash") or normalized.get("password"):
        return "High"
    if normalized.get("email") or normalized.get("phone"):
        return "Medium"
    return "Low"
