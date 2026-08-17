# -*- coding: utf-8 -*-

import argparse
import re
import time
from pathlib import Path
from typing import Final, TypedDict
from unicodedata import combining, normalize

import requests
from selenium.webdriver import Edge
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from yaml import BaseLoader
from yaml import load as yload

from history100_lost_info import LOST_INFO, VideoInfo

YUME: Final = 1277009809
CONTROL: Final = re.compile(r"[\u0000-\u0019\u007F-\u00A0]")
UA: Final = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
)
RENDER_TEMPLATE: Final = Path("templates/render.html").resolve().as_uri()
PAGE_WIDTH: Final = 1920
PAGE_HEIGHT: Final = 1080
REQUEST_TIMEOUT: Final = 20
SECONDS_PER_DAY: Final = 24 * 3600
SECONDS_PER_WEEK: Final = 7 * SECONDS_PER_DAY


class Top100Payload(TypedDict):
    author: str
    bvid: str
    category: str
    cdate: str
    title: str
    week: int
    rankTime: str
    anniversaryText: str
    anniversary: bool
    spText: str
    top100Text: str


class Top100Labels(TypedDict):
    spText: str
    top100Text: str


class Top100RenderItem(TypedDict):
    name: str
    rank: int
    labels: Top100Labels


HISTORY_NUM_TEXT: Final[dict[int, str]] = dict(
    zip(
        range(100, 2100, 100),
        "一百 二百 三百 四百 五百 六百 七百 八百 九百 一千 一千一百 一千二百 一千三百 一千四百 一千五百 一千六百 一千七百 一千八百 一千九百 两千".split(),
        strict=True,
    )
)


def current_week(timestamp: int | None = None) -> int:
    now = int(time.time()) if timestamp is None else timestamp
    return (now - YUME + 133009) // 3600 // 24 // 7


def default_history_num(timestamp: int | None = None) -> int:
    return current_week(timestamp) // 100 * 100


def top100_labels(history_num: int) -> Top100Labels:
    chinese_text = HISTORY_NUM_TEXT[history_num]
    return {
        "spText": f"{chinese_text}期SP",
        "top100Text": f"{chinese_text}期纪念",
    }


def clean_title(title: str) -> str:
    nfc_title = normalize("NFC", title)
    return CONTROL.sub("", "".join(char for char in nfc_title if combining(char) == 0))


def get_info(name: str) -> VideoInfo | None:
    normalized_name = name.strip()
    parameter = "bvid" if normalized_name.lower().startswith("bv") else "aid"
    value = (
        normalized_name if parameter == "bvid" else normalized_name.removeprefix("av")
    )
    response = requests.get(
        "https://api.bilibili.com/x/web-interface/view",
        params={parameter: value},
        headers={"User-Agent": UA},
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    result = response.json()
    if result["code"] != 0:
        return None
    data = result["data"]
    info: VideoInfo = {
        "aid": str(data["aid"]),
        "bvid": str(data["bvid"]),
        "tname": str(data["tname"]),
        "pubdate": int(data["pubdate"]),
        "owner": str(data["owner"]["name"]),
        "title": str(data["title"]),
    }
    # print(info)
    return info


def fallback_info(name: str) -> VideoInfo:
    aid = name[2:] if name.lower().startswith("av") else name
    if aid in LOST_INFO:
        return LOST_INFO[aid]
    for info in LOST_INFO.values():
        if info["bvid"].lower() == name.lower():
            return info
    raise KeyError(f"No fallback metadata for {name}")


def create_browser() -> Edge:
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--window-size=4096,500")
    options.add_argument("--window-position=-2400,-2400")
    browser = Edge(options=options)
    browser.execute_cdp_cmd(
        "Emulation.setDefaultBackgroundColorOverride",
        {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
    )
    return browser


def render_png(browser: Edge, item: Top100Payload, output: Path) -> None:
    payload = {
        "template": "top100",
        "width": PAGE_WIDTH,
        "height": PAGE_HEIGHT,
        **item,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    browser.set_window_size(PAGE_WIDTH + 120, PAGE_HEIGHT + 120)
    browser.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {
            "width": PAGE_WIDTH,
            "height": PAGE_HEIGHT,
            "deviceScaleFactor": 1,
            "mobile": False,
        },
    )
    browser.get(RENDER_TEMPLATE)
    result = browser.execute_async_script(
        """
        const data = arguments[0];
        const done = arguments[arguments.length - 1];
        window.renderTemplate(data).then(done)
            .catch((error) => done({ok: false, error: String(error)}));
        """,
        payload,
    )
    if isinstance(result, dict) and not result.get("ok", False):
        raise RuntimeError(f"Render failed: {output}: {result.get('error')}")
    browser.find_element(By.ID, "canvas").screenshot(str(output.resolve()))
    print(output)


def render_item(browser: Edge, render_data: Top100RenderItem) -> None:
    name = render_data["name"]
    rank = render_data["rank"]
    info = get_info(name)
    if info is None:
        try:
            info = fallback_info(name)
        except KeyError as error:
            print(f"Skip {name}: {error}")
            return
    published = (
        time.strftime(
            "%Y-%m-%d %H:%M",
            time.localtime(info["pubdate"]),
        )
        if isinstance(info["pubdate"], int)
        else str(info["pubdate"])[:16]
    )
    rank_date = time.gmtime(YUME + rank * SECONDS_PER_WEEK - SECONDS_PER_DAY)
    rank_week_of_month = (rank_date.tm_mday + 6) // 7
    anniversary = rank_date.tm_mon == 6 and rank_week_of_month == 4
    item: Top100Payload = {
        "author": f"{info['owner']}   投稿",
        "bvid": info["bvid"],
        "category": info["tname"],
        "cdate": published,
        "title": clean_title(info["title"]),
        "week": rank,
        "rankTime": f"{rank_date.tm_year}年{rank_date.tm_mon}月第{rank_week_of_month}周",
        "anniversaryText": f"The {rank_date.tm_year - 2009}th year"
        if anniversary
        else "",
        "anniversary": anniversary,
        "spText": render_data["labels"]["spText"],
        "top100Text": render_data["labels"]["top100Text"],
    }
    render_png(browser, item, Path(f"./ranking/list100/{rank}_{name}.png"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "HistoryNum", nargs="?", type=int, default=default_history_num()
    )
    history_num = parser.parse_args().HistoryNum
    labels = top100_labels(history_num)
    yml_path = Path(f"./ranking/list100/{history_num}.yml")
    with yml_path.open("r", encoding="utf-8-sig") as stream:
        items = yload(stream, Loader=BaseLoader) or []
    browser = create_browser()
    try:
        for item in items:
            render_item(
                browser,
                {
                    "name": item[":name"],
                    "rank": int(item[":rank"]),
                    "labels": labels,
                },
            )
    finally:
        browser.quit()


if __name__ == "__main__":
    main()
