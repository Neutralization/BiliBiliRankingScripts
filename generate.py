# -*- coding: utf-8 -*-

import argparse
import json
import re
from dataclasses import dataclass
from math import floor, log10
from pathlib import Path
from typing import Any
from unicodedata import combining, normalize
from urllib.parse import urlparse

import arrow
import requests
from selenium.webdriver import Edge
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from yaml import BaseLoader
from yaml import load as yload

YUME = 1277009809
WEEKS = floor(
    (int(arrow.now("Asia/Shanghai").timestamp()) - YUME + 133009) / 3600 / 24 / 7
)
CONTROL = r"[\u0000-\u0019\u007F-\u00A0]"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"

# https://www.zhihu.com/question/381784377/answer/1099438784
# https://github.com/Colerar/abv
XOR_CODE = 23442827791579
MASK_CODE = 2251799813685247
MAX_AID = 1 << 51
BASE = 58
BV_LEN = 12
ALPHABET = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf"
TABLE = {char: index for index, char in enumerate(ALPHABET)}


def av2bv(avid: int):
    bv_list = list("BV1000000000")
    bv_idx = BV_LEN - 1
    tmp = (MAX_AID | avid) ^ XOR_CODE
    while tmp != 0:
        bv_list[bv_idx] = ALPHABET[tmp % BASE]
        tmp //= BASE
        bv_idx -= 1
    bv_list[3], bv_list[9] = bv_list[9], bv_list[3]
    bv_list[4], bv_list[7] = bv_list[7], bv_list[4]
    return "".join(bv_list)


def bv2av(bvid: str):
    bv_list = list(bvid)
    bv_list[3], bv_list[9] = bv_list[9], bv_list[3]
    bv_list[4], bv_list[7] = bv_list[7], bv_list[4]
    tmp = 0
    for char in bv_list[3:]:
        idx = TABLE[char]
        tmp = tmp * BASE + idx
    avid = (tmp & MASK_CODE) ^ XOR_CODE
    return avid


LOST_INFO = {
    "42": {
        "aid": "42",
        "bvid": "42",
        "tname": "42",
        "pubdate": 42,
        "owner": "42",
        "title": "42",
    },
}

RENDER_TEMPLATE = Path("templates/render.html").resolve().as_uri()
PAGE_WIDTH = 1920
PAGE_HEIGHT = 1080
REQUEST_TIMEOUT = 20
COVER_LOST = "./footage/cover_lost.png"


@dataclass
class GenerateContext:
    week: int
    m_rank: list[dict[str, Any]]
    b_rank: list[dict[str, Any]]
    g_rank: list[dict[str, Any]]
    h_rank: list[dict[str, Any]]
    s_rank_data: dict[int, Any]
    invalid: dict[str, str]
    m_rank_data: dict[Any, dict[str, Any]]
    b_rank_data: dict[Any, dict[str, Any]]
    g_rank_data: dict[Any, dict[str, Any]]
    h_rank_data: dict[Any, dict[str, Any]]
    all_data: dict[Any, dict[str, Any]]


def file_url(path):
    return Path(path).resolve().as_uri()


def load_json_file(path: str | Path):
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Missing input file: {file_path}")
    try:
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as error:
        raise ValueError(f"Invalid JSON in {file_path}: {error}") from error


def require_non_empty_list(name: str, value):
    if not isinstance(value, list) or not value:
        raise ValueError(f"{name} must be a non-empty list")


def require_item_keys(name: str, item: dict[str, Any], keys: set[str]):
    missing = sorted(keys - set(item))
    if missing:
        raise ValueError(f"{name} item is missing keys: {', '.join(missing)}")


def validate_rank(name: str, data: list[dict[str, Any]], keys: set[str]):
    require_non_empty_list(name, data)
    items = [x for x in data if isinstance(x, dict) and x.get("info") is None]
    if not items:
        raise ValueError(f"{name} has no rank items")
    require_item_keys(name, items[0], keys)


def validate_stat(data: list[dict[str, Any]]):
    require_non_empty_list("stat", data)
    stat_data = {x.get("type"): x.get("ranks") for x in data if isinstance(x, dict)}
    if 2 not in stat_data or 3 not in stat_data:
        raise ValueError("stat is missing type 2 or type 3 ranks")


def normalize_bvid(value):
    raw = str(value).strip()
    if raw.lower().startswith("bv"):
        return f"BV{raw[2:]}"
    if raw.lower().startswith("av") and raw[2:].isdigit():
        return av2bv(int(raw[2:]))
    if raw.isdigit():
        return av2bv(int(raw))
    raise ValueError(f"Invalid BV/AV value: {value!r}")


def safe_div(numerator, denominator, fallback=0):
    if denominator == 0:
        return fallback
    return numerator / denominator


def main_fix_values(click, comment, danmu, stow, yb, part, fix_a_base, cap_fix_b=True):
    fix_b = safe_div(
        stow * 20 + yb * 10,
        click + yb * 10 + comment * 50,
    )
    if cap_fix_b:
        fix_b = min(fix_b, 1)
    return {
        "fix_a": min(safe_div(click + fix_a_base, click * 2, 1), 1),
        "fix_b": fix_b,
        "fix_b_": int(safe_div(click * 50, click + comment * 50) * 100) / 100,
        "fix_c": min(
            safe_div(comment * 50 + danmu, click * 2 + stow * 10 + yb * 20),
            1,
        ),
        "fix_c_": min(safe_div(yb * 2000, click, 50), 50),
        "fix_d": safe_div(
            log10(max(comment, 0) + max(danmu, 0) + 10),
            log10(max(click, 0) + max(stow, 0) + max(yb, 0) + 10),
        ),
        "fix_p": int(safe_div(4, part + 3) * 1000) / 1000,
    }


def convert_main_item(x: dict[str, Any]):
    data = {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": normalize_bvid(x["bv"]),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "changqi": x["changqi"],
        "clicks_rank": format(x["clicks_rank"], ","),
        "clicks": format(x["clicks"], ","),
        "comments_rank": format(x["comments_rank"], ","),
        "comments": format(x["comments"], ","),
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "last": str(x["last"]),
        "part": str(x["part"]),
        "pic": x["pic"],
        "score": format(x["score"], ","),
        "score_rank": str(x["score_rank"]),
        "sp_type_id": x["sp_type_id"],
        "stows_rank": format(x["stows_rank"], ","),
        "stows": format(x["stows"], ","),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "wtype": x["wtype"],
        "yb_rank": format(x["yb_rank"], ","),
        "yb": format(x["yb"], ","),
    }
    data.update(
        main_fix_values(
            x["clicks"],
            x["comments"],
            x["danmu"],
            x["stows"],
            x["yb"],
            x["part"],
            1000000,
        )
    )
    return data


def convert_bangumi_item(x: dict[str, Any], cap_fix_b=True):
    data = {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": normalize_bvid(x["bv"]),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "last": str(x.get("last") if x.get("last") else 0),
        "part": str(x["part_count"]),
        "pic": x["pic"],
        "score": format(x["score"], ","),
        "score_rank": str(x["rank"]),
        "stows_rank": format(x["stow_rank"], ","),
        "stows": format(x["stow"], ","),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "yb_rank": format(x["yb_rank"], ","),
        "yb": format(x["yb"], ","),
    }
    data.update(
        main_fix_values(
            x["click"],
            x["comm"],
            x["danmu"],
            x["stow"],
            x["yb"],
            x["part_count"],
            200000,
            cap_fix_b=cap_fix_b,
        )
    )
    return data


def convert_history_item(x: dict[str, Any]):
    return {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": normalize_bvid(x["bv"]),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "score": format(x["score"], ","),
        "score_rank": str(x["score_rank"]),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "wtype": x["wtype"],
    }


def build_context(week: int):
    m_rank = load_json_file(f"{week}_results.json")
    b_rank = load_json_file(f"{week}_results_bangumi.json")
    g_rank = load_json_file(f"{week}_guoman_bangumi.json")
    h_rank = load_json_file(f"{week}_results_history.json")
    s_rank = load_json_file(f"{week}_stat.json")
    invalid = load_json_file("LostFile.json")

    validate_rank(
        "main rank",
        m_rank,
        {
            "author",
            "bv",
            "cdate",
            "clicks",
            "comments",
            "danmu",
            "part",
            "score",
            "score_rank",
            "wid",
        },
    )
    validate_rank(
        "bangumi rank",
        b_rank,
        {
            "author",
            "bv",
            "cdate",
            "click",
            "comm",
            "danmu",
            "part_count",
            "rank",
            "wid",
        },
    )
    validate_rank(
        "guoman rank",
        g_rank,
        {
            "author",
            "bv",
            "cdate",
            "click",
            "comm",
            "danmu",
            "part_count",
            "rank",
            "wid",
        },
    )
    validate_rank(
        "history rank",
        h_rank,
        {"author", "bv", "cdate", "score", "score_rank", "weekly_id", "wid", "wtype"},
    )
    validate_stat(s_rank)

    m_rank_data = {
        x["wid"]: convert_main_item(x) for x in m_rank if x.get("info") is None
    }
    b_rank_data = {
        x["wid"]: convert_bangumi_item(x) for x in b_rank if x.get("info") is None
    }
    g_rank_data = {
        x["wid"]: convert_bangumi_item(x, cap_fix_b=False)
        for x in g_rank
        if x.get("info") is None
    }
    h_rank_data = {
        x["wid"]: convert_history_item(x) for x in h_rank if x.get("info") is None
    }
    return GenerateContext(
        week=week,
        m_rank=m_rank,
        b_rank=b_rank,
        g_rank=g_rank,
        h_rank=h_rank,
        s_rank_data={x["type"]: x.get("ranks") for x in s_rank},
        invalid=invalid,
        m_rank_data=m_rank_data,
        b_rank_data=b_rank_data,
        g_rank_data=g_rank_data,
        h_rank_data=h_rank_data,
        all_data={**m_rank_data, **b_rank_data, **g_rank_data, **h_rank_data},
    )


def create_browser():
    browser_options = Options()
    browser_options.add_argument("--headless")
    browser_options.add_argument("--window-size=4096,500")
    browser_options.add_argument("--window-position=-2400,-2400")
    browser = Edge(options=browser_options)
    browser.execute_cdp_cmd(
        "Emulation.setDefaultBackgroundColorOverride",
        {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
    )
    return browser


def render_png(browser, template, payload, output_path):
    data = {
        "template": template,
        "width": PAGE_WIDTH,
        "height": PAGE_HEIGHT,
        **payload,
    }
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
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
        window.renderTemplate(data)
            .then(done)
            .catch((error) => done({ ok: false, error: String(error) }));
        """,
        data,
    )
    if isinstance(result, dict) and not result.get("ok", False):
        error = result.get("error", "unknown render error")
        raise RuntimeError(f"Render failed: {template} -> {output_path}: {error}")
    browser.find_element(By.ID, "canvas").screenshot(str(Path(output_path).resolve()))
    print(output_path)


def clean_title(title):
    nfc_title = normalize("NFC", title)
    nfc_title = "".join([c for c in nfc_title if combining(c) == 0])
    return re.sub(CONTROL, "", nfc_title)


def invalid_text(ctx: GenerateContext, aid, bid):
    if f"av{aid}" in ctx.invalid:
        return ctx.invalid[f"av{aid}"]
    if bid in ctx.invalid:
        return ctx.invalid[bid]
    return ""


def rank_pin(score_rank, last_rank):
    if int(score_rank) < int(last_rank):
        return "up"
    if int(score_rank) > int(last_rank):
        return "down"
    return "draw"


def resource_ext(link):
    suffix = Path(urlparse(link).path).suffix.lower()
    return suffix[1:] if suffix else "jpg"


def Resource(bid, link, name):
    if not link:
        return COVER_LOST
    ext = resource_ext(link)
    output_path = Path(f"./pic/{bid}_{name}.{ext}")
    if not output_path.exists():
        try:
            resp = requests.get(
                link,
                headers={"User-Agent": UA},
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
        except requests.RequestException as error:
            print(f"Failed to download resource {link}: {error}; using {COVER_LOST}")
            return COVER_LOST
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("wb") as f:
            f.write(resp.content)
    return str(output_path).replace("\\", "/")


def get_pickup_info(aid):
    result = requests.get(
        f"https://api.bilibili.com/x/web-interface/view?aid={aid}",
        headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
        },
        timeout=REQUEST_TIMEOUT,
    )
    result.raise_for_status()
    data = result.json()
    if data["code"] != 0:
        return None
    return {
        "aid": str(aid),
        "bvid": data["data"]["bvid"],
        "tname": data["data"]["tname"],
        "pubdate": data["data"]["pubdate"],
        "owner": data["data"]["owner"]["name"],
        "title": data["data"]["title"],
    }


def pickup_aid(name):
    raw = str(name).strip()
    if raw.lower().startswith("av") and raw[2:].isdigit():
        return raw[2:]
    if raw.lower().startswith("bv"):
        return str(bv2av(normalize_bvid(raw)))
    raise ValueError(f"Invalid pickup id: {name!r}")


def PickupSingle(ctx: GenerateContext, browser, aid, rank):
    info = get_pickup_info(aid)
    if info is None:
        info = LOST_INFO[str(aid)]
    bid = info["bvid"]
    output_bid = av2bv(int(info["aid"]))
    card = {
        "author": f"{info['owner']}   投稿",
        "bv": bid,
        "category": info["tname"],
        "cdate": arrow.get(info["pubdate"]).to("local").format("YYYY-MM-DD HH:mm"),
        "title": clean_title(info["title"]),
        "variant": "pickup",
    }
    render_png(
        browser,
        "rank-card",
        {"card": card},
        f"./ranking/list1/{rank:0>2}_{output_bid}.png",
    )


def Pickup(ctx: GenerateContext, browser):
    yml_path = Path(f"./ranking/list1/{ctx.week}_3.yml")
    if not yml_path.exists():
        return
    with yml_path.open("r", encoding="utf-8-sig") as f:
        ymlfile = yload(f, Loader=BaseLoader) or []
    for item in ymlfile:
        aid = pickup_aid(item[":name"])
        PickupSingle(ctx, browser, aid, item[":rank"])


def Single(ctx: GenerateContext, browser, args):
    bid, rtype = args
    item = ctx.all_data[bid]
    Aid = item["av"]
    Author = item["author"]
    Bid = item["bv"]
    Score = item["score"]
    ScoreRank = item["score_rank"]
    Title = item["title"]
    UpTime = item["cdate"]
    Week = item["weekly_id"]

    ishistory = bool(str(Week) != str(ctx.week))

    CoverFile = ""
    if not rtype:
        CoverFile = file_url(Resource(bid, item["cover"], "cover"))

    AuthorName = Author if rtype else "投稿"
    card = {
        "author": AuthorName,
        "bv": Bid,
        "cdate": UpTime,
        "cover": CoverFile,
        "history": ishistory,
        "invalid": invalid_text(ctx, Aid, Bid),
        "longtime": bool(rtype and not ishistory and item.get("changqi")),
        "score": Score,
        "scoreRank": ScoreRank,
        "title": clean_title(Title),
        "variant": "history" if ishistory else "main" if rtype else "bangumi",
        "week": Week,
    }
    if rtype:
        card["category"] = item.get("wtype", "")
    if ishistory:
        render_png(
            browser,
            "rank-card",
            {"card": card},
            f"./ranking/list1/{ScoreRank:0>2}_{Bid}.png",
        )
        return 0

    card.update({
        "click": item["clicks"],
        "clickRank": item["clicks_rank"],
        "comment": item["comments"],
        "commentRank": item["comments_rank"],
        "lastRank": str(item["last"]),
        "pin": "" if str(item["last"]) == "0" else rank_pin(ScoreRank, item["last"]),
    })
    if rtype:
        Part = item["part"]
        card.update({
            "partText": f"{Part}P" if int(Part) > 1 else "",
            "thirdValue": item["stows"],
            "fourthValue": item["yb"],
            "thirdRank": item["stows_rank"],
            "fourthRank": item["yb_rank"],
        })
    else:
        card.update({
            "thirdValue": item["yb"],
            "fourthValue": item["danmu"],
            "thirdRank": item["yb_rank"],
            "fourthRank": item["danmu_rank"],
        })

    AFix = f"×{round(item['fix_p'] * item['fix_a'], 3)}"
    BFix = (
        f"×{round(item['fix_b'] * 50, 2)}" if rtype else f"×{round(item['fix_b_'], 2)}"
    )
    BFix_ = f"×{round(item['fix_c'] * 20, 2)}"
    CFix = (
        f"×{round(item['fix_c'], 2)}"
        if rtype
        else f"×{round(item['fix_c_'], 2) if item['fix_c_'] < 50.00 else 50.00}"
    )
    DFix = f"/{round(item['fix_d'], 3)}"
    card.update({"fixA": AFix, "fixB": BFix, "fixC": CFix})
    if rtype:
        card.update({"fixB2": BFix_, "fixD": DFix})
    render_png(
        browser,
        "rank-card",
        {"card": card},
        f"./ranking/list1/{ScoreRank:0>2}_{Bid}.png",
    )


def SubRank(ctx: GenerateContext, browser, rtype):
    if rtype == 1:
        LastRankNum = int(ctx.m_rank[0]["rank_from"])
        SScoreRankData = {
            n + 1: v
            for n, v in enumerate(ctx.m_rank_data.values())
            if v["sp_type_id"] is None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 30
    elif rtype == 2:
        LastRankNum = 0
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in ctx.m_rank_data.values()
            if v["sp_type_id"] is not None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 3:
        LastRankNum = 10
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in ctx.b_rank_data.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 4:
        LastRankNum = 10
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in ctx.g_rank_data.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3

    for i in range(PageNum):
        rows = []
        for j in range(4):
            k = LastRankNum + 4 * i + j + 1
            if SScoreRankData.get(k) is None:
                continue
            item = SScoreRankData[k]
            row = {
                "bv": item["bv"],
                "click": item["clicks"],
                "comment": item["comments"],
                "cover": file_url(Resource(item["bv"], item["pic"], "pic")),
                "cdate": item["cdate"],
                "lastRank": "" if item["last"] == "0" else f"上周：{item['last']}",
                "score": item["score"],
                "scoreRank": item["score_rank"],
                "title": clean_title(item["title"]),
            }
            if rtype > 2:
                row.update({"thirdValue": item["danmu"]})
            else:
                row.update({
                    "clickRank": item["clicks_rank"],
                    "commentRank": item["comments_rank"],
                    "fourthRank": item["stows_rank"],
                    "fourthValue": item["stows"],
                    "thirdRank": item["yb_rank"],
                    "thirdValue": item["yb"],
                })
            rows.append(row)
        if rtype == 1:
            output_path = f"./ranking/list2/{i + 1:0>3}.png"
        elif rtype == 2:
            output_path = f"./ranking/list3/tv_{i + 1:0>3}.png"
        elif rtype == 3:
            output_path = f"./ranking/list4/bangumi_{i + 1:0>3}.png"
        elif rtype == 4:
            output_path = f"./ranking/list4/bangumi_{i + 4:0>3}.png"
        render_png(
            browser,
            "sub-rank",
            {"kind": "main" if rtype <= 2 else "bangumi", "rows": rows},
            output_path,
        )


def Stat(ctx: GenerateContext, browser):
    rows_1 = []
    for i in range(7):
        AScore = format(ctx.s_rank_data[2][i][1], ",")
        ARank = (
            str(ctx.s_rank_data[2][i][2])
            if len(ctx.s_rank_data[2][i + 7]) > 2
            else "--"
        )
        if not ARank.isdigit():
            trend = "up"
        elif int(ARank) > i + 1:
            trend = "up"
        elif int(ARank) < i + 1:
            trend = "down"
        else:
            trend = "draw"
        rows_1.append({
            "category": ctx.s_rank_data[2][i][0],
            "rank": ARank,
            "score": AScore,
            "trend": trend,
        })
    render_png(browser, "stat", {"kind": 1, "rows": rows_1}, "./ranking/pic/stat_1.png")

    rows_2 = []
    for i in range(7):
        AScore = format(ctx.s_rank_data[2][i + 7][1], ",")
        ARank = (
            str(ctx.s_rank_data[2][i + 7][2])
            if len(ctx.s_rank_data[2][i + 7]) > 2
            else "--"
        )
        if not ARank.isdigit():
            trend = "up"
        elif int(ARank) > i + 8:
            trend = "up"
        elif int(ARank) < i + 8:
            trend = "down"
        else:
            trend = "draw"
        rows_2.append({
            "category": ctx.s_rank_data[2][i + 7][0],
            "rank": ARank,
            "score": AScore,
            "trend": trend,
        })
    render_png(browser, "stat", {"kind": 2, "rows": rows_2}, "./ranking/pic/stat_2.png")

    rows_3 = []
    for d in ["click", "comment", "stow", "danmu", "yb"]:
        if int(ctx.s_rank_data[3][0][d]) > int(ctx.s_rank_data[3][1][d]):
            trend = "up"
        elif int(ctx.s_rank_data[3][0][d]) < int(ctx.s_rank_data[3][1][d]):
            trend = "down"
        else:
            trend = "draw"
        rows_3.append({
            "current": format(ctx.s_rank_data[3][0][d], ","),
            "last": format(ctx.s_rank_data[3][1][d], ","),
            "trend": trend,
        })
    render_png(browser, "stat", {"kind": 3, "rows": rows_3}, "./ranking/pic/stat_3.png")


def MainRank(ctx: GenerateContext, browser):
    LastRankNum = int(ctx.m_rank[0]["rank_from"])
    RankDataM = [
        (k, True)
        for k, v in ctx.m_rank_data.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= LastRankNum
    ]
    RankDataB = [
        (k, False) for k, v in ctx.b_rank_data.items() if int(v["score_rank"]) <= 10
    ]
    RankDataG = [
        (k, False) for k, v in ctx.g_rank_data.items() if int(v["score_rank"]) <= 10
    ]
    RankDataH = [
        (k, True) for k, v in ctx.h_rank_data.items() if int(v["score_rank"]) <= 5
    ]
    for item in RankDataM + RankDataB + RankDataG + RankDataH:
        Single(ctx, browser, item)


def Opening(ctx: GenerateContext, browser):
    MTitle = f"{ctx.m_rank[0]['name']}"
    MWeek = f"#{ctx.m_rank[0]['id']}"
    render_png(
        browser,
        "simple",
        {"kind": "opening", "title": MTitle, "week": MWeek},
        "./ranking/1_op/title.png",
    )


def LongTerm(ctx: GenerateContext, browser):
    LastRankNum = int(ctx.m_rank[0]["rank_from"])
    LTitle = f"{LastRankNum}-21"
    LongTerm_ = (
        f"长期作品：{LastRankNum - 30}个" if LastRankNum - 30 > 0 else "长期作品：没有"
    )
    render_png(
        browser,
        "simple",
        {"kind": "long-term", "range": LTitle, "description": LongTerm_},
        "./ranking/pic/_1.png",
    )


def History(ctx: GenerateContext, browser):
    HCount = f"该期集计投稿数：{format(ctx.h_rank[0]['count'], ',')}"
    HUpTime = f"{ctx.h_rank[0]['name']} (av{ctx.h_rank[0]['wid']})"
    render_png(
        browser,
        "simple",
        {"kind": "history-record", "count": HCount, "title": HUpTime},
        "./ranking/pic/history.png",
    )


def Top(ctx: GenerateContext, browser):
    TopData = {
        int(v["score_rank"]): (k, v["score"], v["bv"])
        for k, v in ctx.m_rank_data.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= 4
    }
    for t in range(3):
        Bid = TopData[t + 1][2]
        Diff = int(TopData[t + 1][1].replace(",", "")) - int(
            TopData[t + 2][1].replace(",", "")
        )
        DiffText = f"比第{t + 2}名高出{format(Diff, ',')}pts."
        render_png(
            browser,
            "simple",
            {"kind": "top-diff", "place": f"{t + 1}", "diffText": DiffText},
            f"./ranking/list1/{t + 1:0>2}_{Bid}_.png",
        )


def Main(ctx: GenerateContext, browser):
    Opening(ctx, browser)
    LongTerm(ctx, browser)
    History(ctx, browser)
    MainRank(ctx, browser)
    Pickup(ctx, browser)
    Stat(ctx, browser)
    Top(ctx, browser)
    for i in range(4):
        SubRank(ctx, browser, i + 1)


def run_generate(week: int):
    ctx = build_context(week)
    browser = create_browser()
    try:
        Main(ctx, browser)
    finally:
        browser.quit()


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--week", type=int, default=WEEKS, help="ranking week number")
    return parser.parse_args()


def main():
    args = parse_args()
    run_generate(args.week)


if __name__ == "__main__":
    main()
