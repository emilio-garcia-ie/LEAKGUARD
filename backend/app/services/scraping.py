"""Scraping service: Playwright (JS), BeautifulSoup (static), aiohttp (async HTTP)."""

import asyncio
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


CRACKED_LEAKS_CACHE_KEY = "scrape:cracked:leaks"


async def scrape_cracked_page(
    session: aiohttp.ClientSession,
    page_num: int,
    sem: asyncio.Semaphore,
    headers: dict[str, str]
) -> list[dict[str, Any]]:
    url = f"https://cracked.st/Forum-Other-Leaks?page={page_num}"
    async with sem:
        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
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
    return threads


async def scrape_cracked_leaks() -> list[dict[str, Any]]:
    cached = await cache_get(CRACKED_LEAKS_CACHE_KEY)
    if cached and isinstance(cached, list):
        return cached

    cookie_str = (
        "__ddg1_=60UdzxdpTHMNaDNWinYd; "
        "sid=7363f4a4231ed68bb2a3bdfcb2e66766; "
        "mybb[lastvisit]=1781966302; "
        "mybb[lastactive]=1781981695; "
        "mybbuser=4985126_MYnTyTecC78tzy3B8qwSDMPBQFDRMsCX4rsWXyPPNrM1FJqhWY; "
        "mybb[announcements]=0; "
        "__ddg9_=186.121.254.130; "
        "mybb[forumread]=a%3A1%3A%7Bi%3A314%3Bi%3A1781984437%3B%7D; "
        "__ddg8_=8dksfx5jW5cvZ1l7; "
        "__ddg10_=1781984446"
    )

    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5",
        "Cookie": cookie_str,
        "priority": "u=0, i",
        "referer": "https://cracked.st/Forum-Other-Leaks",
        "sec-ch-ua": '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0"
    }

    sem = asyncio.Semaphore(3)
    
    threads = []
    try:
        async with aiohttp.ClientSession() as session:
            tasks = [scrape_cracked_page(session, page, sem, headers) for page in range(1, 11)]
            results = await asyncio.gather(*tasks)
            for r in results:
                threads.extend(r)
    except Exception:
        pass

    if threads:
        await cache_set(CRACKED_LEAKS_CACHE_KEY, threads, ttl_seconds=600)
    return threads


HACKREAD_NEWS_CACHE_KEY = "scrape:hackread:news"


async def scrape_hackread_page(
    session: aiohttp.ClientSession,
    page_num: int,
    sem: asyncio.Semaphore,
    headers: dict[str, str]
) -> list[dict[str, Any]]:
    url = f"https://hackread.com/wp-json/wp/v2/posts?page={page_num}&per_page=10&_embed=true"
    async with sem:
        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
        except Exception:
            return []

    results = []
    for p in data:
        if not isinstance(p, dict):
            continue

        title = p.get("title", {}).get("rendered", "")
        href = p.get("link", "")
        date_str = p.get("date", "").replace("T", " ")

        author = "Unknown"
        authors_list = p.get("authors")
        if authors_list and isinstance(authors_list, list) and len(authors_list) > 0:
            author = authors_list[0].get("display_name", "Unknown")
        else:
            embedded_author = p.get("_embedded", {}).get("author", [])
            if embedded_author and len(embedded_author) > 0:
                author = embedded_author[0].get("name", "Unknown")

        category = "General"
        wp_terms = p.get("_embedded", {}).get("wp:term", [])
        for term_group in wp_terms:
            for term in term_group:
                if term.get("taxonomy") == "category":
                    category = term.get("name", "General")
                    break

        results.append({
            "title": title,
            "link": href,
            "author": author,
            "date": date_str,
            "category": category
        })

    return results


async def scrape_hackread_news() -> list[dict[str, Any]]:
    cached = await cache_get(HACKREAD_NEWS_CACHE_KEY)
    if cached and isinstance(cached, list):
        return cached

    cookie_str = (
        "_ga=GA1.1.242570283.1781985004; "
        "__gads=ID=ba1b78384cf98e93:T=1781985007:RT=1781985007:S=ALNI_MYucYylljp4xPhsNo5YlrhRzLehAA; "
        "__gpi=UID=0000148731a2b1fe:T=1781985007:RT=1781985007:S=ALNI_MantHIFg-AiExlFGfgQigfqt0WAUQ; "
        "__eoi=ID=18f85a773f5fc1ec:T=1781985007:RT=1781985007:S=AA-AfjY3acprRgGDGp1VqER-L-wW; "
        "sib_cuid=19f9c422-f6ed-4f29-b782-20faf87dd409; "
        "_color_system_schema=default; "
        "FCCDCF=[null,null,null,null,null,null,[[32,\"\\\"60263652-878d-4145-92cb-50ff0231767f\\\",[1781985005,37000000]\"]]]; "
        "_ga_K86RKJVC6L=GS2.1.s1781985003$o1$g1$t1781985008$j55$l0$h0; "
        "FCNEC=[[\"AKsRol_rAMT9PDV-YefXKx8TCglevjyyEaPBovG9sy7zSDcJqVb8kG3_xes4b5zFJSwHW4iMuxgfisfbvY_pSibK-2H8rhO3YwiJedPOTwRMQ22GhsFgyvV1ds8PJ_5Zsp2xuWVcoBwlKejSaEkKlzUgmfesWPfTPQ==\"]]"
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

    sem = asyncio.Semaphore(3)
    articles = []
    try:
        async with aiohttp.ClientSession() as session:
            tasks = [scrape_hackread_page(session, page, sem, headers) for page in range(1, 11)]
            results = await asyncio.gather(*tasks)
            seen_titles = set()
            for r in results:
                for art in r:
                    if art["title"] not in seen_titles:
                        seen_titles.add(art["title"])
                        articles.append(art)
    except Exception:
        pass

    if articles:
        await cache_set(HACKREAD_NEWS_CACHE_KEY, articles, ttl_seconds=600)
    return articles



