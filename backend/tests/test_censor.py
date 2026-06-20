from app.services.censor import (
    censor_email,
    censor_generic,
    censor_hash,
    censor_password,
    censor_phone,
    extract_osint_date,
    format_login_display,
    normalize_osint_entry,
    severity_from_record,
)


def test_censor_password_masks_value():
    result = censor_password("abc12345")
    assert result != "abc12345"
    assert "•" in result


def test_censor_password_none():
    assert censor_password(None) == "[oculto]"


def test_censor_password_empty():
    assert censor_password("") == "[oculto]"


def test_censor_password_short():
    assert censor_password("ab") == "••••"


def test_censor_password_bcrypt_uses_hash_style():
    result = censor_password("$2b$12$longhashedvalue")
    assert "•" in result


def test_censor_hash():
    result = censor_hash("5f4dcc3b5aa765d61d8327deb882cf99")
    assert result.startswith("5f4dcc3b")
    assert "•" in result


def test_censor_hash_none():
    assert censor_hash(None) == "[hash oculto]"


def test_censor_email():
    result = censor_email("usuario@empresa.com")
    assert "@empresa.com" in result
    assert "*" in result


def test_censor_email_none():
    assert censor_email(None) == "[oculto]"


def test_censor_phone():
    result = censor_phone("+59171234567")
    assert result.startswith("591")
    assert "•" in result
    assert result.endswith("67")


def test_censor_phone_none():
    assert censor_phone(None) == "[oculto]"


def test_censor_generic():
    result = censor_generic("Juan Perez")
    assert "•" in result


def test_normalize_osint_entry():
    entry = normalize_osint_entry({"Email": "a@b.com", "Password": "pass123"})
    assert entry["email"] == "a@b.com"
    assert entry["password"] == "pass123"


def test_severity_from_record_plaintext():
    normalized = normalize_osint_entry({"Email": "a@b.com", "Password": "pass"})
    assert severity_from_record(normalized) == "Critical"


def test_severity_from_record_hash_only():
    normalized = normalize_osint_entry({"Email": "a@b.com", "Hash": "abc123"})
    assert severity_from_record(normalized) == "High"


def test_severity_from_record_email_only():
    normalized = normalize_osint_entry({"Email": "a@b.com"})
    assert severity_from_record(normalized) == "Medium"


def test_normalize_osint_entry_stealer_nick_field():
    entry = normalize_osint_entry({"Pass": "12345678", "Nick": "user@gmail.com"})
    assert entry["email"] == "user@gmail.com"
    assert entry["password"] == "12345678"


def test_normalize_osint_entry_stealer_log_field():
    entry = normalize_osint_entry({"Pass": "12345678", "Log": "analyst@empresa.com"})
    assert entry["email"] == "analyst@empresa.com"


def test_normalize_osint_entry_stealer_username_field():
    entry = normalize_osint_entry({"Pass": "1020304050/12", "UserName": "demo@corp.com"})
    assert entry["email"] == "demo@corp.com"


def test_normalize_osint_entry_combo_login_password():
    entry = normalize_osint_entry({"Pass": "user@test.com:secret123"})
    assert entry["email"] == "user@test.com"
    assert entry["password"] == "secret123"


def test_normalize_osint_entry_case_insensitive_login():
    entry = normalize_osint_entry({"PASSWORD": "abc", "LOGIN": "Admin@Site.com"})
    assert entry["email"] == "Admin@Site.com"


def test_extract_osint_date_from_entry():
    assert extract_osint_date({"LastActive": "2024-03-15 12:00:00"}) == "2024-03-15"


def test_extract_osint_date_from_source():
    assert extract_osint_date({}, {"LastUpdate": "2023-11-01T08:30:00"}) == "2023-11-01"


def test_format_login_display_email():
    normalized = normalize_osint_entry({"Nick": "usuario@empresa.com", "Pass": "x"})
    assert "@" in format_login_display(normalized)
    assert "*" in format_login_display(normalized) or "•" in format_login_display(normalized)
