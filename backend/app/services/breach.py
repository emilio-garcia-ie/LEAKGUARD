import httpx


async def check_email_breach(email: str) -> dict:
    from urllib.parse import quote

    encoded = quote(email.strip())

    async with httpx.AsyncClient(timeout=30.0) as client:
        check_res, analytics_res = await asyncio_gather(
            client.get(f"https://api.xposedornot.com/v1/check-email/{encoded}?details=true"),
            client.get(f"https://api.xposedornot.com/v1/breach-analytics?email={encoded}"),
        )

    check_data = None
    analytics_data = None

    if check_res.status_code == 200:
        check_data = check_res.json()
    elif check_res.status_code == 404:
        check_data = {"Error": "Not found", "email": email.strip()}

    if analytics_res.status_code == 200:
        analytics_data = analytics_res.json()

    return {"source": "xposedornot", "check": check_data, "analytics": analytics_data}


async def fetch_recent_breaches() -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get("https://api.xposedornot.com/v1/breaches")
        response.raise_for_status()
        return {"source": "xposedornot", "breaches": response.json()}


async def asyncio_gather(*coros):
    import asyncio

    return await asyncio.gather(*coros)


def parse_breach_check(data: dict | None) -> dict:
    result = {
        "exposed": False,
        "breachCount": 0,
        "breaches": [],
        "riskScore": None,
        "email": None,
        "source": "xposedornot",
    }
    if not data or not data.get("check"):
        return result

    check = data["check"]
    if check.get("Error") == "Not found" or not check.get("breaches"):
        result["email"] = check.get("email")
        return result

    flat = check["breaches"][0] if isinstance(check["breaches"][0], list) else [b for sub in check["breaches"] for b in (sub if isinstance(sub, list) else [sub])]
    result["breaches"] = [b for b in flat if b]
    result["breachCount"] = len(result["breaches"])
    result["exposed"] = result["breachCount"] > 0
    result["email"] = check.get("email")

    analytics = data.get("analytics") or {}
    metrics = analytics.get("BreachMetrics") or {}
    if metrics.get("risk_score") is not None:
        result["riskScore"] = metrics["risk_score"]
    elif metrics.get("risk") and len(metrics["risk"]) > 0:
        result["riskScore"] = metrics["risk"][0]

    most_recent = None
    if isinstance(metrics, dict):
        breaches_details = metrics.get("breaches_details")
        if isinstance(breaches_details, list):
            dates = []
            for b in breaches_details:
                if isinstance(b, dict) and b.get("breached_date"):
                    dates.append(str(b["breached_date"]))
            if dates:
                most_recent = max(dates)
    result["mostRecent"] = most_recent

    return result


def merge_xon_records(records: list[dict], stats: dict, xon: dict, email: str) -> tuple[list[dict], dict]:
    from app.services.censor import censor_email

    if not xon.get("exposed"):
        return records, stats

    existing = {r.get("title", "").lower() for r in records}
    added = 0

    for breach_name in xon.get("breaches", []):
        title = f"{breach_name} [OSINT Gratuito]"
        if title.lower() in existing or breach_name.lower() in existing:
            continue
        records.append(
            {
                "date": "—",
                "title": title,
                "sourceName": breach_name,
                "login": censor_email(email),
                "credential": "Índice XposedOrNot",
                "severity": "High",
                "source": "xposedornot",
            }
        )
        added += 1

    if added > 0:
        stats["databasesWithHits"] = (stats.get("databasesWithHits") or 0) + added
        stats["apiTotalResults"] = (stats.get("apiTotalResults") or len(records) - added) + added
        stats["totalLogins"] = (stats.get("totalLogins") or 0) + added
        stats["xonBreaches"] = xon.get("breachCount")

    return records, stats
