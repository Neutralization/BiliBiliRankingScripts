# -*- coding: utf-8 -*-

import json
import re
from math import log10
from os.path import exists
from pathlib import Path
from unicodedata import combining, normalize

import arrow
import requests
from selenium.webdriver import Edge
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from yaml import BaseLoader
from yaml import load as yload
from constant import (
    CONTROL,
    UA,
    WEEKS,
    av2bv,
    bv2av,
)

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

MRank = json.load(open(f"{WEEKS}_results.json", "r", encoding="utf-8"))
BRank = json.load(open(f"{WEEKS}_results_bangumi.json", "r", encoding="utf-8"))
GRank = json.load(open(f"{WEEKS}_guoman_bangumi.json", "r", encoding="utf-8"))
HRank = json.load(open(f"{WEEKS}_results_history.json", "r", encoding="utf-8"))
SRank = json.load(open(f"{WEEKS}_stat.json", "r", encoding="utf-8"))
Invalid = json.load(open("LostFile.json", "r", encoding="utf-8"))
InvalidList = list(Invalid.keys())
browser_options = Options()
browser_options.add_argument("--headless")
browser_options.add_argument("--window-size=4096,500")
browser_options.add_argument("--window-position=-2400,-2400")
browser = Edge(options=browser_options)
browser.execute_cdp_cmd(
    "Emulation.setDefaultBackgroundColorOverride",
    {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
)

MRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": (
            re.sub(r"^bv", "BV", x["bv"])
            if "bv1" in x["bv"]
            else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "changqi": x["changqi"],
        "clicks_rank": format(x["clicks_rank"], ","),
        "clicks": format(x["clicks"], ","),
        "comments_rank": format(x["comments_rank"], ","),
        "comments": format(x["comments"], ","),
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": min((x["clicks"] + 1000000) / (x["clicks"] * 2), 1),
        "fix_b": min(
            (x["stows"] * 20 + x["yb"] * 10)
            / (x["clicks"] + x["yb"] * 10 + x["comments"] * 50),
            1,
        ),
        "fix_b_": int((x["clicks"] * 50) / (x["clicks"] + x["comments"] * 50) * 100)
        / 100,
        "fix_c": min(
            (x["comments"] * 50 + x["danmu"])
            / (x["clicks"] * 2 + x["stows"] * 10 + x["yb"] * 20),
            1,
        ),
        "fix_c_": min((x["yb"] * 2000) / x["clicks"], 50),
        "fix_d": log10(max(x["comments"], 0) + max(x["danmu"], 0) + 10)
        / log10(max(x["clicks"], 0) + max(x["stows"], 0) + max(x["yb"], 0) + 10),
        "fix_p": int(4 / (x["part"] + 3) * 1000) / 1000,
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
    for x in MRank
    if x.get("info") is None
}
BRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": (
            re.sub(r"^bv", "BV", x["bv"])
            if "bv1" in x["bv"]
            else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": min((x["click"] + 200000) / (x["click"] * 2), 1),
        "fix_b": min(
            (x["stow"] * 20 + x["yb"] * 10)
            / (x["click"] + x["yb"] * 10 + x["comm"] * 50),
            1,
        ),
        "fix_b_": int((x["click"] * 50) / (x["click"] + x["comm"] * 50) * 100) / 100,
        "fix_c": min(
            (x["comm"] * 50 + x["danmu"])
            / (x["click"] * 2 + x["stow"] * 10 + x["yb"] * 20),
            1,
        ),
        "fix_c_": min((x["yb"] * 2000) / x["click"], 50),
        "fix_d": log10(max(x["comm"], 0) + max(x["danmu"], 0) + 10)
        / log10(max(x["click"], 0) + max(x["stow"], 0) + max(x["yb"], 0) + 10),
        "fix_p": int(4 / (x["part_count"] + 3) * 1000) / 1000,
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
    for x in BRank
    if x.get("info") is None
}
GRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": (
            re.sub(r"^bv", "BV", x["bv"])
            if "bv1" in x["bv"]
            else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": min((x["click"] + 200000) / (x["click"] * 2), 1),
        "fix_b": (x["stow"] * 20 + x["yb"] * 10)
        / (x["click"] + x["yb"] * 10 + x["comm"] * 50),
        "fix_b_": int((x["click"] * 50) / (x["click"] + x["comm"] * 50) * 100) / 100,
        "fix_c": min(
            (x["comm"] * 50 + x["danmu"])
            / (x["click"] * 2 + x["stow"] * 10 + x["yb"] * 20),
            1,
        ),
        "fix_c_": min((x["yb"] * 2000) / x["click"], 50),
        "fix_d": log10(max(x["comm"], 0) + max(x["danmu"], 0) + 10)
        / log10(max(x["click"], 0) + max(x["stow"], 0) + max(x["yb"], 0) + 10),
        "fix_p": int(4 / (x["part_count"] + 3) * 1000) / 1000,
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
    for x in GRank
    if x.get("info") is None
}
HRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": (
            re.sub(r"^bv", "BV", x["bv"])
            if "bv1" in x["bv"]
            else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "score": format(x["score"], ","),
        "score_rank": str(x["score_rank"]),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "wtype": x["wtype"],
    }
    for x in HRank
    if x.get("info") is None
}
SRankData = {x["type"]: x.get("ranks") for x in SRank}
AllData = {
    **MRankData,
    **BRankData,
    **GRankData,
    **HRankData,
}

RENDER_TEMPLATE = Path("templates/render.html").resolve().as_uri()
PAGE_WIDTH = 1920
PAGE_HEIGHT = 1080


def file_url(path):
    return Path(path).resolve().as_uri()


def render_png(template, payload, output_path):
    global browser
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
        raise RuntimeError(result.get("error", "unknown render error"))
    browser.find_element(By.ID, "canvas").screenshot(str(Path(output_path).resolve()))
    print(output_path)


def clean_title(title):
    nfc_title = normalize("NFC", title)
    nfc_title = "".join([c for c in nfc_title if combining(c) == 0])
    return re.sub(CONTROL, "", nfc_title)


def invalid_text(aid, bid):
    if f"av{aid}" in InvalidList:
        return Invalid[f"av{aid}"]
    if bid in InvalidList:
        return Invalid[bid]
    return ""


def rank_pin(score_rank, last_rank):
    if int(score_rank) < int(last_rank):
        return "up"
    if int(score_rank) > int(last_rank):
        return "down"
    return "draw"


def Resource(bid, link, name):
    ext = link.split(".")[-1]
    if len(link) == 0:
        return "./footage/cover_lost.png"
    if not exists(f"./pic/{bid}_{name}.{ext}"):
        resp = requests.get(link)
        with open(f"./pic/{bid}_{name}.{ext}", "wb") as f:
            f.write(resp.content)
    return f"./pic/{bid}_{name}.{ext}"


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
    ).json()
    if result["code"] != 0:
        return None
    return {
        "aid": str(aid),
        "bvid": result["data"]["bvid"],
        "tname": result["data"]["tname"],
        "pubdate": result["data"]["pubdate"],
        "owner": result["data"]["owner"]["name"],
        "title": result["data"]["title"],
    }


def pickup_aid(name):
    name = name.strip()
    if name.lower().startswith("av") and name[2:].isdigit():
        return name[2:]
    if name.lower().startswith("bv"):
        name = f"BV{name[2:]}"
    return str(bv2av(name))


def PickupSingle(aid, rank):
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
        "rank-card",
        {"card": card},
        f"./ranking/list1/{rank:0>2}_{output_bid}.png",
    )


def Pickup():
    yml_path = Path(f"./ranking/list1/{WEEKS}_3.yml")
    if not yml_path.exists():
        return
    with open(yml_path, "r", encoding="utf-8-sig") as f:
        ymlfile = yload(f, Loader=BaseLoader) or []
    for item in ymlfile:
        aid = pickup_aid(item[":name"])
        PickupSingle(aid, item[":rank"])


def Single(args):
    bid, rtype = args
    Aid = AllData[bid]["av"]
    Author = AllData[bid]["author"]
    Bid = AllData[bid]["bv"]
    Score = AllData[bid]["score"]
    ScoreRank = AllData[bid]["score_rank"]
    Title = AllData[bid]["title"]
    UpTime = AllData[bid]["cdate"]
    Week = AllData[bid]["weekly_id"]

    ishistory = bool(str(Week) != str(WEEKS))

    CoverFile = ""
    if not rtype:
        Cover = AllData[bid]["cover"]
        CoverFile = file_url(Resource(bid, Cover, "cover"))

    AuthorName = Author if rtype else "投稿"
    card = {
        "author": AuthorName,
        "bv": Bid,
        "cdate": UpTime,
        "cover": CoverFile,
        "history": ishistory,
        "invalid": invalid_text(Aid, Bid),
        "longtime": bool(rtype and not ishistory and AllData[bid].get("changqi")),
        "score": Score,
        "scoreRank": ScoreRank,
        "title": clean_title(Title),
        "variant": "history" if ishistory else "main" if rtype else "bangumi",
        "week": Week,
    }
    if rtype:
        card["category"] = AllData[bid].get("wtype", "")
    if ishistory:
        render_png(
            "rank-card",
            {"card": card},
            f"./ranking/list1/{ScoreRank:0>2}_{Bid}.png",
        )
        return 0

    Click = AllData[bid]["clicks"]
    ClickRank = AllData[bid]["clicks_rank"]
    Coin = AllData[bid]["yb"]
    CoinRank = AllData[bid]["yb_rank"]
    Comment = AllData[bid]["comments"]
    CommentRank = AllData[bid]["comments_rank"]
    Danmu = AllData[bid]["danmu"]
    DanmuRank = AllData[bid]["danmu_rank"]
    Stow = AllData[bid]["stows"]
    StowRank = AllData[bid]["stows_rank"]
    LastRank = AllData[bid]["last"]
    card.update({
        "click": Click,
        "clickRank": ClickRank,
        "comment": Comment,
        "commentRank": CommentRank,
        "lastRank": str(LastRank),
        "pin": "" if str(LastRank) == "0" else rank_pin(ScoreRank, LastRank),
    })
    if rtype:
        Part = AllData[bid]["part"]
        card.update({
            "partText": f"{Part}P" if int(Part) > 1 else "",
            "thirdValue": Stow,
            "fourthValue": Coin,
            "thirdRank": StowRank,
            "fourthRank": CoinRank,
        })
    else:
        card.update({
            "thirdValue": Coin,
            "fourthValue": Danmu,
            "thirdRank": CoinRank,
            "fourthRank": DanmuRank,
        })

    FixA = AllData[bid]["fix_a"]
    FixB = AllData[bid]["fix_b"]
    FixB_ = AllData[bid]["fix_b_"]
    FixC = AllData[bid]["fix_c"]
    FixC_ = AllData[bid]["fix_c_"]
    FixP = AllData[bid]["fix_p"]
    FixD = AllData[bid]["fix_d"]
    AFix = f"×{str(round(FixP * FixA, 3))}"
    BFix = f"×{str(round(FixB * 50, 2))}" if rtype else f"×{str(round(FixB_, 2))}"
    BFix_ = f"×{str(round(FixC * 20, 2))}"
    CFix = (
        f"×{str(round(FixC, 2))}"
        if rtype
        else f"×{str(round(FixC_, 2) if FixC_ < 50.00 else 50.00)}"
    )
    DFix = f"/{str(round(FixD, 3))}"
    card.update({"fixA": AFix, "fixB": BFix, "fixC": CFix})
    if rtype:
        card.update({"fixB2": BFix_, "fixD": DFix})
    render_png(
        "rank-card",
        {"card": card},
        f"./ranking/list1/{ScoreRank:0>2}_{Bid}.png",
    )


def SubRank(rtype):
    if rtype == 1:
        LastRankNum = int(MRank[0]["rank_from"])
        SScoreRankData = {
            n + 1: v
            for n, v in enumerate(MRankData.values())
            if v["sp_type_id"] is None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 30
    elif rtype == 2:
        LastRankNum = 0
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in MRankData.values()
            if v["sp_type_id"] is not None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 3:
        LastRankNum = 10
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in BRankData.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 4:
        LastRankNum = 10
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in GRankData.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    for i in range(PageNum):
        rows = []
        for j in range(4):
            k = LastRankNum + 4 * i + j + 1
            if SScoreRankData.get(k) is None:
                continue
            SBid = SScoreRankData[k]["bv"]
            SClick = SScoreRankData[k]["clicks"]
            SClickRank = SScoreRankData[k]["clicks_rank"]
            SCoin = SScoreRankData[k]["yb"]
            SCoinRank = SScoreRankData[k]["yb_rank"]
            SComment = SScoreRankData[k]["comments"]
            SCommentRank = SScoreRankData[k]["comments_rank"]
            SCover = SScoreRankData[k]["pic"]
            SDanmu = SScoreRankData[k]["danmu"]
            SScore = SScoreRankData[k]["score"]
            SScoreRank = SScoreRankData[k]["score_rank"]
            SStow = SScoreRankData[k]["stows"]
            SStowRank = SScoreRankData[k]["stows_rank"]
            STitle = SScoreRankData[k]["title"]
            SUpTime = SScoreRankData[k]["cdate"]
            SLastRank = (
                ""
                if SScoreRankData[k]["last"] == "0"
                else f"上周：{SScoreRankData[k]['last']}"
            )
            row = {
                "bv": SBid,
                "click": SClick,
                "comment": SComment,
                "cover": file_url(Resource(SBid, SCover, "pic")),
                "cdate": SUpTime,
                "lastRank": SLastRank,
                "score": SScore,
                "scoreRank": SScoreRank,
                "title": clean_title(STitle),
            }
            if rtype > 2:
                row.update({"thirdValue": SDanmu})
            else:
                row.update({
                    "clickRank": SClickRank,
                    "commentRank": SCommentRank,
                    "fourthRank": SStowRank,
                    "fourthValue": SStow,
                    "thirdRank": SCoinRank,
                    "thirdValue": SCoin,
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
            "sub-rank",
            {"kind": "main" if rtype <= 2 else "bangumi", "rows": rows},
            output_path,
        )


def Stat():
    rows_1 = []
    for i in range(7):
        AScore = format(SRankData[2][i][1], ",")
        ARank = str(SRankData[2][i][2]) if len(SRankData[2][i + 7]) > 2 else "--"
        if not ARank.isdigit():
            trend = "up"
        elif int(ARank) > i + 1:
            trend = "up"
        elif int(ARank) < i + 1:
            trend = "down"
        else:
            trend = "draw"
        rows_1.append({
            "category": SRankData[2][i][0],
            "rank": ARank,
            "score": AScore,
            "trend": trend,
        })
    render_png("stat", {"kind": 1, "rows": rows_1}, "./ranking/pic/stat_1.png")

    rows_2 = []
    for i in range(7):
        AScore = format(SRankData[2][i + 7][1], ",")
        ARank = str(SRankData[2][i + 7][2]) if len(SRankData[2][i + 7]) > 2 else "--"
        if not ARank.isdigit():
            trend = "up"
        elif int(ARank) > i + 8:
            trend = "up"
        elif int(ARank) < i + 8:
            trend = "down"
        else:
            trend = "draw"
        rows_2.append({
            "category": SRankData[2][i + 7][0],
            "rank": ARank,
            "score": AScore,
            "trend": trend,
        })
    render_png("stat", {"kind": 2, "rows": rows_2}, "./ranking/pic/stat_2.png")

    rows_3 = []
    for d in ["click", "comment", "stow", "danmu", "yb"]:
        if int(SRankData[3][0][d]) > int(SRankData[3][1][d]):
            trend = "up"
        elif int(SRankData[3][0][d]) < int(SRankData[3][1][d]):
            trend = "down"
        else:
            trend = "draw"
        rows_3.append({
            "current": format(SRankData[3][0][d], ","),
            "last": format(SRankData[3][1][d], ","),
            "trend": trend,
        })
    render_png("stat", {"kind": 3, "rows": rows_3}, "./ranking/pic/stat_3.png")


def MainRank():
    LastRankNum = int(MRank[0]["rank_from"])
    RankDataM = [
        (k, True)
        for k, v in MRankData.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= LastRankNum
    ]
    RankDataB = [(k, False) for k, v in BRankData.items() if int(v["score_rank"]) <= 10]
    RankDataG = [(k, False) for k, v in GRankData.items() if int(v["score_rank"]) <= 10]
    RankDataH = [(k, True) for k, v in HRankData.items() if int(v["score_rank"]) <= 5]
    RankData = RankDataM + RankDataB + RankDataG + RankDataH
    list(map(Single, RankData))


def Opening():
    MTitle = f"{MRank[0]['name']}"
    MWeek = f"#{MRank[0]['id']}"
    render_png(
        "simple",
        {"kind": "opening", "title": MTitle, "week": MWeek},
        "./ranking/1_op/title.png",
    )


def LongTerm():
    LastRankNum = int(MRank[0]["rank_from"])
    LTitle = f"{LastRankNum}-21"
    LongTerm_ = (
        f"长期作品：{LastRankNum - 30}个" if LastRankNum - 30 > 0 else "长期作品：没有"
    )
    render_png(
        "simple",
        {"kind": "long-term", "range": LTitle, "description": LongTerm_},
        "./ranking/pic/_1.png",
    )


def History():
    HCount = f"该期集计投稿数：{format(HRank[0]['count'], ',')}"
    HUpTime = f"{HRank[0]['name']} (av{HRank[0]['wid']})"
    render_png(
        "simple",
        {"kind": "history-record", "count": HCount, "title": HUpTime},
        "./ranking/pic/history.png",
    )


def Top():
    TopData = {
        int(v["score_rank"]): (k, v["score"], v["bv"])
        for k, v in MRankData.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= 4
    }
    for t in range(3):
        # Aid = TopData[t + 1][0]
        Bid = TopData[t + 1][2]
        Diff = int(TopData[t + 1][1].replace(",", "")) - int(
            TopData[t + 2][1].replace(",", "")
        )
        DiffText = f"比第{t + 2}名高出{format(Diff, ',')}pts."
        render_png(
            "simple",
            {"kind": "top-diff", "place": f"{t + 1}", "diffText": DiffText},
            f"./ranking/list1/{t + 1:0>2}_{Bid}_.png",
        )


def Main():
    Opening()
    LongTerm()
    History()
    MainRank()
    Pickup()
    Stat()
    Top()
    for i in range(4):
        SubRank(i + 1)


if __name__ == "__main__":
    Main()
