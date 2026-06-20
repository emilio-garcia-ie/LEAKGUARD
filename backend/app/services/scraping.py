"""Scraping service: Playwright (JS), BeautifulSoup (static), aiohttp (async HTTP)."""

import hashlib
from typing import Any

import aiohttp
from bs4 import BeautifulSoup

from app.core.redis_client import cache_get, cache_set


async def scrape_static(url: str) -> dict[str, Any]:
    cache_key = f"scrape:static:{hashlib.sha256(url.encode()).hexdigest()[:16]}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            html = await resp.text()
            status = resp.status

    soup = BeautifulSoup(html, "lxml")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    links = [a.get("href") for a in soup.find_all("a", href=True)][:50]
    text_preview = soup.get_text(separator=" ", strip=True)[:2000]

    result = {
        "url": url,
        "method": "beautifulsoup+aiohttp",
        "status": status,
        "title": title,
        "linkCount": len(links),
        "textPreview": text_preview,
    }
    await cache_set(cache_key, result, ttl_seconds=1800)
    return result


async def scrape_dynamic(url: str) -> dict[str, Any]:
    """Playwright scrape — requires `playwright install chromium` on the host."""
    cache_key = f"scrape:dynamic:{hashlib.sha256(url.encode()).hexdigest()[:16]}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        return {"url": url, "method": "playwright", "error": "Playwright no instalado"}

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=45000)
            title = await page.title()
            content = await page.content()
            await browser.close()

        soup = BeautifulSoup(content, "lxml")
        result = {
            "url": url,
            "method": "playwright",
            "title": title,
            "textPreview": soup.get_text(separator=" ", strip=True)[:2000],
        }
        await cache_set(cache_key, result, ttl_seconds=1800)
        return result
    except Exception as exc:
        return {"url": url, "method": "playwright", "error": str(exc)}


RANSOMWARE_FEED_URL = "https://api.ransomware.live/recentvictims"
RANSOMWARE_CACHE_KEY = "scrape:ransomware:recent"


def parse_ransomware_victims(data: object) -> list[dict[str, Any]]:
    if not isinstance(data, list):
        return []
    victims: list[dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        victims.append(
            {
                "actor": item.get("group_name") or item.get("group") or "Unknown",
                "victim": item.get("post_title") or item.get("victim") or "Unknown",
                "date": item.get("discovered") or item.get("date") or "",
                "url": item.get("post_url") or item.get("url") or "",
                "country": item.get("country") or "Unknown",
            }
        )
    return victims[:50]


async def scrape_ransomware_feed() -> list[dict[str, Any]]:
    cached = await cache_get(RANSOMWARE_CACHE_KEY)
    if cached and isinstance(cached, list):
        return cached

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(RANSOMWARE_FEED_URL, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
    except Exception:
        return []

    victims = parse_ransomware_victims(data)
    if victims:
        await cache_set(RANSOMWARE_CACHE_KEY, victims, ttl_seconds=900)
    return victims


CRACKED_LEAKS_URL = "https://cracked.st/Forum-Other-Leaks"
CRACKED_LEAKS_CACHE_KEY = "scrape:cracked:leaks"


async def scrape_cracked_leaks() -> list[dict[str, Any]]:
    cached = await cache_get(CRACKED_LEAKS_CACHE_KEY)
    if cached and isinstance(cached, list):
        return cached

    cookie_str = (
        "__ddg1_=60UdzxdpTHMNaDNWinYd; "
        "sid=7363f4a4231ed68bb2a3bdfcb2e66766; "
        "__ddg9_=189.28.78.212; "
        "mybb[lastvisit]=1781966302; "
        "mybb[lastactive]=1781981695; "
        "mybbuser=4985126_MYnTyTecC78tzy3B8qwSDMPBQFDRMsCX4rsWXyPPNrM1FJqhWY; "
        "mybb[announcements]=0; "
        "mybb[forumread]=a%3A1%3A%7Bi%3A314%3Bi%3A1781982288%3B%7D; "
        "__ddg8_=rWbCXRWr8eLaoLZU; "
        "__ddg10_=1781982303"
    )

    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5",
        "Cookie": cookie_str,
        "priority": "u=0, i",
        "sec-ch-ua": '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0"
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(CRACKED_LEAKS_URL, headers=headers, timeout=aiohttp.ClientTimeout(total=20)) as resp:
                if resp.status != 200:
                    return []
                html = await resp.text()
    except Exception:
        return []

    soup = BeautifulSoup(html, "html.parser")
    subject_spans = soup.find_all("span", class_=lambda c: c and ("subject_" in c or "subject_new" in c or "subject_old" in c))

    threads = []
    for span in subject_spans:
        tr = span.find_parent("tr")
        if not tr:
            continue
        tds = tr.find_all("td")
        if len(tds) < 5:
            continue

        a = span.find("a")
        if not a:
            continue

        title = a.get_text(strip=True)
        href = a.get("href") or ""
        link = f"https://cracked.st/{href}" if href else ""

        # Parse Author & Date
        author = "Unknown"
        date_str = ""
        author_div = tr.find(class_=lambda c: c and ("author" in c or "thread_author" in c))
        if author_div:
            author_a = author_div.find("a")
            if author_a:
                author = author_a.get_text(strip=True)
            else:
                author = author_div.get_text(strip=True)
            
            date_span = author_div.find(class_=lambda c: c and "date" in c)
            if date_span:
                date_str = date_span.get_text(strip=True)
            else:
                # Remove author name from div text to get date
                full_text = author_div.get_text(strip=True)
                date_str = full_text.replace(author, "").strip()

        # Parse Replies & Views
        replies = tds[2].get_text(strip=True).replace("Replies", "").strip()
        views = tds[3].get_text(strip=True).replace("Views", "").strip()

        threads.append({
            "title": title,
            "link": link,
            "author": author,
            "date": date_str or "Unknown",
            "replies": replies,
            "views": views
        })

    if threads:
        await cache_set(CRACKED_LEAKS_CACHE_KEY, threads, ttl_seconds=600)
    return threads

