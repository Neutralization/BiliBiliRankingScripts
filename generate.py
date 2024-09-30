# -*- coding: utf-8 -*-

import csv
import json
import re
from math import log10
from os import remove
from os.path import abspath, exists
from unicodedata import combining, normalize

import arrow
import requests
from PIL import Image, ImageDraw, ImageFont
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from yaml import dump

from constant import (
    BANGUMIRANKIMG,
    C_000000,
    C_6D4B2B,
    C_818181,
    C_AC8164,
    C_BCA798,
    C_CC0000,
    C_EAAA7D,
    C_FFFFFF,
    CONTROL,
    DOWNIMG,
    DRAWIMG,
    FZCUYUAN_M03,
    HANNOTATE_SC,
    HISTORYRANKIMG,
    HISTORYRECORDIMG,
    HYHEIMIJ,
    LONGIMG,
    LONGTIMEIMG,
    MAINRANKIMG,
    MAINTITLEIMG,
    SEGOE_UI_EMOJI,
    STATONEIMG,
    STATTHREEIMG,
    STATTWOIMG,
    STYUAN,
    SUBBANGUMIRANKIMG,
    SUBRANKIMG,
    TOPIMG,
    UPIMG,
    WEEKS,
    YUANTI_SC,
    av2bv,
)

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
browser = Chrome(
    service=ChromeService(ChromeDriverManager().install()), options=browser_options
)
browser_command = f"/session/{browser.session_id}/chromium/send_command_and_get_result"
browser_url = browser.command_executor._url + browser_command
browser_data = json.dumps(
    {
        "cmd": "Emulation.setDefaultBackgroundColorOverride",
        "params": {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
    }
)
browser.command_executor._request("POST", browser_url, browser_data)

MRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": (
            x["bv"].replace("bv", "BV") if "bv1" in x["bv"] else av2bv(int(x["bv"][3:]))
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
            x["bv"].replace("bv", "BV") if "bv1" in x["bv"] else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": min((x["click"] + 1000000) / (x["click"] * 2), 1),
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
            x["bv"].replace("bv", "BV") if "bv1" in x["bv"] else av2bv(int(x["bv"][3:]))
        ),
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": min((x["click"] + 1000000) / (x["click"] * 2), 1),
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
            x["bv"].replace("bv", "BV") if "bv1" in x["bv"] else av2bv(int(x["bv"][3:]))
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


def Resource(bid, link, name):
    ext = link.split(".")[-1]
    if len(link) == 0:
        return "./footage/cover_lost.png"
    if not exists(f"./pic/{bid}_{name}.{ext}"):
        resp = requests.get(link)
        with open(f"./pic/{bid}_{name}.{ext}", "wb") as f:
            f.write(resp.content)
    return f"./pic/{bid}_{name}.{ext}"


def Single(args):
    bid, rtype = args
    Author_F = ImageFont.truetype(HANNOTATE_SC, 32)
    Bid_F = ImageFont.truetype(YUANTI_SC, 42)
    BiDataRank_F = ImageFont.truetype(HANNOTATE_SC, 26)
    Cata_F = ImageFont.truetype(YUANTI_SC, 36)
    DataFix_F = ImageFont.truetype(YUANTI_SC, 32)
    HisRank_F = ImageFont.truetype(YUANTI_SC, 72)
    Invalid_F = ImageFont.truetype(FZCUYUAN_M03, 48)
    LastRank_F = ImageFont.truetype(HANNOTATE_SC, 36)
    Score_F = ImageFont.truetype(YUANTI_SC, 52)
    ScoreRank_F = ImageFont.truetype(HYHEIMIJ, 150)
    Part_F = BiDataRank_F
    Data_F = UpTime_F = Cata_F
    Aid = AllData[bid]["av"]
    Author = AllData[bid]["author"]
    Bid = AllData[bid]["bv"]
    Score = AllData[bid]["score"]
    ScoreRank = AllData[bid]["score_rank"]
    Title = AllData[bid]["title"]
    UpTime = AllData[bid]["cdate"]
    Week = AllData[bid]["weekly_id"]

    ishistory = bool(str(Week) != str(WEEKS))
    RankImg = (
        Image.open(HISTORYRANKIMG)
        if ishistory
        else Image.open(MAINRANKIMG) if rtype else Image.open(BANGUMIRANKIMG)
    )
    RankPaper = ImageDraw.Draw(RankImg)

    if rtype and not ishistory and AllData[bid]["changqi"]:
        LongMark = Image.open(LONGTIMEIMG)
        LongRegion = LongMark.crop((0, 0) + LongMark.size)
        RankImg.paste(LongRegion, (11, 11))
    if not rtype:
        Cover = AllData[bid]["cover"]
        CoverFile = Resource(bid, Cover, "cover")
        IconMark = Image.open(CoverFile)
        IconRegion = IconMark.crop((0, 0) + IconMark.size)
        IconCover = IconRegion.resize((115, 115), Image.Resampling.LANCZOS)
        RankImg.paste(IconCover, (35, 930))

    NFCTitle = normalize("NFC", Title)
    NFCTitle = "".join([c for c in NFCTitle if combining(c) == 0])
    RegexTitle = re.sub(CONTROL, "", NFCTitle)

    TImg_O = 32 if rtype else 192
    TImg = text2img(
        Aid,
        RegexTitle,
        abspath(STYUAN).replace("\\", "/"),
        abspath(SEGOE_UI_EMOJI).replace("\\", "/"),
        C_6D4B2B,
        54,
    )
    TImgRegion = TImg.crop((0, 0) + TImg.size)
    TImgCover = (
        TImgRegion.resize(TImg.size, Image.Resampling.LANCZOS)
        if (TImg_O + TImg.size[0]) <= 1475
        else TImgRegion.resize((1475 - TImg_O, TImg.size[1]), Image.Resampling.LANCZOS)
    )
    RankImg.paste(TImgCover, (TImg_O, 1000 - int(TImg.size[1] / 2)), mask=TImgCover)
    remove(f"./{Aid}.png")

    Author_X = 31 if rtype else 189
    AuthorName = Author if rtype else "投稿"
    RankPaper.text((Author_X, 927), AuthorName, C_6D4B2B, Author_F)
    Bid_X = 195 - Bid_F.getlength(Bid) / 2
    RankPaper.text((Bid_X, 847), Bid, C_FFFFFF, Bid_F)

    if rtype:
        Cata = AllData[bid]["wtype"]
        Cata_X = 580 - Cata_F.getlength(Cata) / 2
        RankPaper.text((Cata_X, 849), Cata, C_6D4B2B, Cata_F)
    UpTime_O = 933 if rtype else 754
    UpTime_X = UpTime_O - UpTime_F.getlength(UpTime) / 2
    RankPaper.text((UpTime_X, 850), UpTime, C_6D4B2B, UpTime_F)
    ScoreRank_X = 1703 - ScoreRank_F.getlength(ScoreRank) / 2
    RankPaper.text((ScoreRank_X, 28), ScoreRank, C_FFFFFF, ScoreRank_F)

    Score_X = 1703 - Score_F.getlength(Score) / 2
    if ishistory:
        RankPaper.text((Score_X, 280), Score, C_FFFFFF, Score_F)
        RankPaper.text((1495, 400), f"#{Week}", C_FFFFFF, HisRank_F)
        if f"av{Aid}" in InvalidList:
            RankPaper.text((980, 749), Invalid[f"av{Aid}"], C_CC0000, Invalid_F)
        if Bid in InvalidList:
            RankPaper.text((980, 749), Invalid[Bid], C_CC0000, Invalid_F)
        RankImg.save(f"./ranking/list1/av{Aid}.png")
        # RankImg.save(f"./ranking/list1/{Bid}.png")
        print(f"./ranking/list1/av{Aid}.png")
        return 0
    RankPaper.text((Score_X, 376), Score, C_FFFFFF, Score_F)

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
    if str(LastRank) == "0":
        LastRank_X = 1703 - LastRank_F.getlength("新上榜") / 2
        RankPaper.text((LastRank_X + 2, 184 + 2), "新上榜", C_000000, LastRank_F)
        RankPaper.text((LastRank_X + 1, 184 + 1), "新上榜", C_818181, LastRank_F)
        RankPaper.text((LastRank_X, 184), "新上榜", C_FFFFFF, LastRank_F)
    else:
        LastRank_X = 1703 - LastRank_F.getlength("上周") / 2
        LastRank_X_ = 1703 + LastRank_F.getlength("上周") / 2
        RankPaper.text((LastRank_X + 2, 184 + 2), "上周", C_000000, LastRank_F)
        RankPaper.text((LastRank_X_ + 2, 184 + 2), LastRank, C_000000, LastRank_F)
        RankPaper.text((LastRank_X + 1, 184 + 1), "上周", C_818181, LastRank_F)
        RankPaper.text((LastRank_X_ + 1, 184 + 1), LastRank, C_818181, LastRank_F)
        RankPaper.text((LastRank_X, 184), "上周", C_FFFFFF, LastRank_F)
        RankPaper.text((LastRank_X_, 184), LastRank, C_FFFFFF, LastRank_F)
        if int(ScoreRank) < int(LastRank):
            StatPin = Image.open(UPIMG)
        elif int(ScoreRank) > int(LastRank):
            StatPin = Image.open(DOWNIMG)
        elif int(ScoreRank) == int(LastRank):
            StatPin = Image.open(DRAWIMG)
        PinRegion = StatPin.crop((0, 0) + StatPin.size)
        PinCover = PinRegion.resize((45, 45), Image.Resampling.BILINEAR)
        Pin_X = 1655 - int(LastRank_F.getlength("上周") / 2)
        RankImg.paste(PinCover, (Pin_X, 190), mask=PinCover)
    RankPaper.text((1535, 545), Click, C_FFFFFF, Data_F)
    RankPaper.text((1535, 689), Comment, C_FFFFFF, Data_F)

    if rtype:
        Part = AllData[bid]["part"]
        if int(Part) > 1:
            Part_X = 1833 - Part_F.getlength(Part) / 2
            RankPaper.text((Part_X, 552), f"{Part}P", C_EAAA7D, Part_F)
        RankPaper.text((1535, 833), Stow, C_FFFFFF, Data_F)
        RankPaper.text((1535, 977), Coin, C_FFFFFF, Data_F)
    else:
        RankPaper.text((1535, 833), Coin, C_FFFFFF, Data_F)
        RankPaper.text((1535, 977), Danmu, C_FFFFFF, Data_F)

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
    RankPaper.text((1710, 551), AFix, C_EAAA7D, DataFix_F)
    RankPaper.text((1710, 695), BFix, C_EAAA7D, DataFix_F)
    RankPaper.text((1710, 839), CFix, C_EAAA7D, DataFix_F)

    if rtype:
        RankPaper.text((1710, 983), BFix_, C_EAAA7D, DataFix_F)
        RankPaper.text((1810, 418), DFix, C_FFFFFF, ImageFont.truetype(YUANTI_SC, 22))
    RankPaper.text((1837, 492), ClickRank, C_EAAA7D, BiDataRank_F)
    RankPaper.text((1837, 635), CommentRank, C_EAAA7D, BiDataRank_F)
    if rtype:
        RankPaper.text((1837, 778), StowRank, C_EAAA7D, BiDataRank_F)
        RankPaper.text((1837, 921), CoinRank, C_EAAA7D, BiDataRank_F)
    else:
        RankPaper.text((1837, 778), CoinRank, C_EAAA7D, BiDataRank_F)
        RankPaper.text((1837, 921), DanmuRank, C_EAAA7D, BiDataRank_F)

    if f"av{Aid}" in InvalidList:
        RankPaper.text((980, 749), Invalid[f"av{Aid}"], C_CC0000, Invalid_F)
    if Bid in InvalidList:
        RankPaper.text((980, 749), Invalid[Bid], C_CC0000, Invalid_F)
    RankImg.save(f"./ranking/list1/av{Aid}.png")
    # RankImg.save(f"./ranking/list1/{Bid}.png")
    print(f"./ranking/list1/av{Aid}.png")


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
        SImg = Image.open(SUBRANKIMG) if rtype <= 2 else Image.open(SUBBANGUMIRANKIMG)
        SPaper = ImageDraw.Draw(SImg)
        for j in range(4):
            SBid_F = ImageFont.truetype(YUANTI_SC, 32)
            SBiDataRank_F = ImageFont.truetype(YUANTI_SC, 32)
            SData_F = ImageFont.truetype(YUANTI_SC, 40)
            SLastRank_F = ImageFont.truetype(YUANTI_SC, 34)
            SScore_F = ImageFont.truetype(YUANTI_SC, 45)
            SScoreRank_F = ImageFont.truetype(HYHEIMIJ, 48)
            SUpTime_F = ImageFont.truetype(YUANTI_SC, 37)
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
            SCoverFile = Resource(SBid, SCover, "pic")
            SCoverMark = Image.open(SCoverFile)
            SCoverRegion = SCoverMark.crop((0, 0) + SCoverMark.size)
            SPic = SCoverRegion.resize((336, 210), Image.Resampling.LANCZOS)
            SImg.paste(SPic, (63, 48 + j * 259))

            SNFCTitle = normalize("NFC", STitle)
            SNFCTitle = "".join([c for c in SNFCTitle if combining(c) == 0])
            SRegexTitle = re.sub(CONTROL, "", SNFCTitle)

            STImg_X = 424
            STImg_Y = 75 + j * 259
            STImg = text2img(
                SBid,
                SRegexTitle,
                abspath(STYUAN).replace("\\", "/"),
                abspath(SEGOE_UI_EMOJI).replace("\\", "/"),
                C_6D4B2B,
                52,
            )
            STImgRegion = STImg.crop((0, 0) + STImg.size)
            STImgCover = (
                STImgRegion.resize(STImg.size, Image.Resampling.LANCZOS)
                if (STImg_X + STImg.size[0]) <= 1885
                else STImgRegion.resize(
                    (1885 - STImg_X, STImg.size[1]), Image.Resampling.LANCZOS
                )
            )
            SImg.paste(
                STImgCover, (STImg_X, STImg_Y - int(STImg.size[1] / 2)), mask=STImgCover
            )
            remove(f"./{SBid}.png")

            SBid_X = 549 - SBid_F.getlength(SBid) / 2
            SPaper.text((SBid_X, 212 + j * 259), SBid, C_FFFFFF, SBid_F)
            SScore_X = 1706 - SScore_F.getlength(SScore)
            SPaper.text((SScore_X, 214 + j * 259), SScore, C_FFFFFF, SScore_F)
            SPaper.text((491, 133 + j * 259), SClick, C_6D4B2B, SData_F)
            SPaper.text((893, 133 + j * 259), SComment, C_6D4B2B, SData_F)
            if rtype > 2:
                SPaper.text((1218, 133 + j * 259), SDanmu, C_6D4B2B, SData_F)
            else:
                SPaper.text((1218, 133 + j * 259), SCoin, C_6D4B2B, SData_F)
                SPaper.text((1574, 133 + j * 259), SStow, C_6D4B2B, SData_F)
                SPaper.text((739, 138 + j * 259), SClickRank, C_BCA798, SBiDataRank_F)
                SPaper.text(
                    (1067, 138 + j * 259), SCommentRank, C_BCA798, SBiDataRank_F
                )
                SPaper.text((1748, 138 + j * 259), SStowRank, C_BCA798, SBiDataRank_F)
                SPaper.text((1390, 138 + j * 259), SCoinRank, C_BCA798, SBiDataRank_F)
            SScoreRank_X = 1856 - SScoreRank_F.getlength(SScoreRank) / 2
            SPaper.text(
                (SScoreRank_X, 214 + j * 259), SScoreRank, C_FFFFFF, SScoreRank_F
            )
            SPaper.text((820, 205 + j * 259), SUpTime, C_BCA798, SUpTime_F)
            SPaper.text((1244, 205 + j * 259), SLastRank, C_BCA798, SLastRank_F)
        if rtype == 1:
            SImg.save(f"./ranking/list2/{i+1:0>3}.png")
            print(f"./ranking/list2/{i+1:0>3}.png")
        elif rtype == 2:
            SImg.save(f"./ranking/list3/tv_{i+1:0>3}.png")
            print(f"./ranking/list3/tv_{i+1:0>3}.png")
        elif rtype == 3:
            SImg.save(f"./ranking/list4/bangumi_{i+1:0>3}.png")
            print(f"./ranking/list4/bangumi_{i+1:0>3}.png")
        elif rtype == 4:
            SImg.save(f"./ranking/list4/bangumi_{i+4:0>3}.png")
            print(f"./ranking/list4/bangumi_{i+4:0>3}.png")


def Stat():
    ACata_F = ImageFont.truetype(FZCUYUAN_M03, 43)
    ALastStat_F = ImageFont.truetype(YUANTI_SC, 31)
    ARank_F = ImageFont.truetype(YUANTI_SC, 35)
    AStat_F = ImageFont.truetype(YUANTI_SC, 38)
    AScore_F = ARank_F
    AImg_1 = Image.open(STATONEIMG)
    AImg_2 = Image.open(STATTWOIMG)
    AImg_3 = Image.open(STATTHREEIMG)
    APaper_1 = ImageDraw.Draw(AImg_1)
    APaper_2 = ImageDraw.Draw(AImg_2)
    APaper_3 = ImageDraw.Draw(AImg_3)
    for i in range(7):
        ACata = SRankData[2][i][0]
        ACata_X = 616 - ACata_F.getlength(ACata) / 2
        APaper_1.text((ACata_X, 221 + i * 120), SRankData[2][i][0], C_6D4B2B, ACata_F)
        AScore = format(SRankData[2][i][1], ",")
        AScore_X = 1046 - AScore_F.getlength(AScore)
        APaper_1.text((AScore_X, 221 + i * 120), AScore, C_6D4B2B, AScore_F)
        ARank = str(SRankData[2][i][2]) if len(SRankData[2][i + 7]) > 2 else "--"
        APaper_1.text((1440, 221 + i * 120), ARank, C_AC8164, ARank_F)
        if not ARank.isdigit():
            AStatPin = Image.open(UPIMG)
        elif int(ARank) > i + 1:
            AStatPin = Image.open(UPIMG)
        elif int(ARank) < i + 1:
            AStatPin = Image.open(DOWNIMG)
        elif int(ARank) == i + 1:
            AStatPin = Image.open(DRAWIMG)

        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.Resampling.LANCZOS)
        AImg_1.paste(APinCover, (1500, 222 + i * 120), mask=APinCover)
    AImg_1.save("./ranking/pic/stat_1.png")
    for i in range(7):
        ACata = SRankData[2][i + 7][0]
        ACata_X = 616 - ACata_F.getlength(ACata) / 2
        APaper_2.text(
            (ACata_X, 221 + i * 120), SRankData[2][i + 7][0], C_6D4B2B, ACata_F
        )
        AScore = format(SRankData[2][i + 7][1], ",")
        AScore_X = 1046 - AScore_F.getlength(AScore)
        APaper_2.text((AScore_X, 221 + i * 120), AScore, C_6D4B2B, AScore_F)
        ARank = str(SRankData[2][i + 7][2]) if len(SRankData[2][i + 7]) > 2 else "--"
        APaper_2.text((1440, 221 + i * 120), ARank, C_AC8164, ARank_F)
        if not ARank.isdigit():
            AStatPin = Image.open(UPIMG)
        elif int(ARank) > i + 8:
            AStatPin = Image.open(UPIMG)
        elif int(ARank) < i + 8:
            AStatPin = Image.open(DOWNIMG)
        elif int(ARank) == i + 8:
            AStatPin = Image.open(DRAWIMG)
        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.Resampling.LANCZOS)
        AImg_2.paste(APinCover, (1500, 222 + i * 120), mask=APinCover)
    AImg_2.save("./ranking/pic/stat_2.png")
    AClick = format(SRankData[3][0]["click"], ",")
    ACoin = format(SRankData[3][0]["yb"], ",")
    AComment = format(SRankData[3][0]["comment"], ",")
    ADanmu = format(SRankData[3][0]["danmu"], ",")
    AStow = format(SRankData[3][0]["stow"], ",")
    APaper_3.text((869 - AStat_F.getlength(AClick), 304), AClick, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getlength(AComment), 438), AComment, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getlength(AStow), 572), AStow, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getlength(ADanmu), 706), ADanmu, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getlength(ACoin), 840), ACoin, C_6D4B2B, AStat_F)
    ALastClick = format(SRankData[3][1]["click"], ",")
    ALastCoin = format(SRankData[3][1]["yb"], ",")
    ALastComment = format(SRankData[3][1]["comment"], ",")
    ALastDanmu = format(SRankData[3][1]["danmu"], ",")
    ALastStow = format(SRankData[3][1]["stow"], ",")
    APaper_3.text((1279, 313), ALastClick, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 447), ALastComment, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 581), ALastStow, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 715), ALastDanmu, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 849), ALastCoin, C_AC8164, ALastStat_F)
    for d in ["click", "comment", "stow", "danmu", "yb"]:
        if int(SRankData[3][0][d]) > int(SRankData[3][1][d]):
            AStatPin = Image.open(UPIMG)
        elif int(SRankData[3][0][d]) < int(SRankData[3][1][d]):
            AStatPin = Image.open(DOWNIMG)
        elif int(SRankData[3][0][d]) == int(SRankData[3][1][d]):
            AStatPin = Image.open(DRAWIMG)
        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.Resampling.LANCZOS)
        a_i = ["click", "comment", "stow", "danmu", "yb"].index(d)
        AImg_3.paste(APinCover, (1503, 309 + a_i * 134), mask=APinCover)
    AImg_3.save("./ranking/pic/stat_3.png")


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
    MTitle_F = ImageFont.truetype(HYHEIMIJ, 52)
    MWeek_F = ImageFont.truetype(HYHEIMIJ, 128)
    MTitle = f"{MRank[0]['name']}"
    MWeek = f"#{MRank[0]['id']}"
    MImg = Image.open(MAINTITLEIMG)
    MPaper = ImageDraw.Draw(MImg)
    MTitle_X = 376 - MTitle_F.getlength(MTitle) / 2
    MWeek_X = 355 - MWeek_F.getlength(MWeek) / 2
    MPaper.text((MTitle_X, 750), MTitle, C_FFFFFF, MTitle_F)
    MPaper.text((MWeek_X, 614), MWeek, C_FFFFFF, MWeek_F)
    MImg.save("./ranking/1_op/title.png")


def LongTerm():
    LTitle_F = ImageFont.truetype(HYHEIMIJ, 216)
    LongTerm_F = ImageFont.truetype(HANNOTATE_SC, 45)
    LastRankNum = int(MRank[0]["rank_from"])
    LTitle = f"{LastRankNum}-21"
    LongTerm_ = (
        f"长期作品：{LastRankNum - 30}个" if LastRankNum - 30 > 0 else "长期作品：没有"
    )
    LImg = Image.open(LONGIMG)
    LPaper = ImageDraw.Draw(LImg)
    LTitle_X = 607 - LTitle_F.getlength(LTitle) / 2
    LongTerm__X = 607 - LongTerm_F.getlength(LongTerm_) / 2
    LPaper.text((LTitle_X, 415), LTitle, C_FFFFFF, LTitle_F)
    LPaper.text((LongTerm__X, 681), LongTerm_, C_FFFFFF, LongTerm_F)
    LImg.save("./ranking/pic/_1.png")


def History():
    HUpTime_F = ImageFont.truetype(HANNOTATE_SC, 44)
    HCount_F = ImageFont.truetype(HANNOTATE_SC, 45)
    HCount = f"该期集计投稿数：{format(HRank[0]['count'], ',')}"
    HUpTime = f"{HRank[0]['name']} (av{HRank[0]['wid']})"
    HImg = Image.open(HISTORYRECORDIMG)
    HPaper = ImageDraw.Draw(HImg)
    HCount_X = 607 - HCount_F.getlength(HCount) / 2
    HUpTime_X = 607 - HUpTime_F.getlength(HUpTime) / 2
    HPaper.text((HCount_X, 811), HCount, C_FFFFFF, HCount_F)
    HPaper.text((HUpTime_X, 529), HUpTime, C_FFFFFF, HUpTime_F)
    HImg.save("./ranking/pic/history.png")


def Top():
    Top_F = ImageFont.truetype(HYHEIMIJ, 390)
    Diff_F = ImageFont.truetype(HANNOTATE_SC, 45)
    TopData = {
        int(v["score_rank"]): (k, v["score"], v["bv"])
        for k, v in MRankData.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= 4
    }
    for t in range(3):
        TImg = Image.open(TOPIMG)
        TPaper = ImageDraw.Draw(TImg)
        Aid = TopData[t + 1][0]
        # Bid = TopData[t + 1][2]
        Diff = int(TopData[t + 1][1].replace(",", "")) - int(
            TopData[t + 2][1].replace(",", "")
        )
        DiffText = f"比第{t+2}名高出{format(Diff, ',')}pts."
        TPaper.text(
            (603 - Top_F.getlength(f"{t+1}") / 2, 318), f"{t+1}", C_FFFFFF, Top_F
        )
        TPaper.text(
            (609 - Diff_F.getlength(DiffText) / 2, 722), DiffText, C_FFFFFF, Diff_F
        )
        TImg.save(f"./ranking/list1/av{Aid}_.png")
        # TImg.save(f"./ranking/list1/{Bid}_.png")


def MakeYaml(file, max, min, part):
    content = json.load(open(f"./{WEEKS}_{file}.json", "r", encoding="utf-8"))
    rankfrom = content[0].get("rank_from")
    yamlcontent = []
    doorcontent = []
    for x in content:
        if x.get("info") is None and x.get("sp_type_id") != 2:
            rank = x["score_rank"] if x.get("score_rank") else x["rank"]
            name = f'av{x["wid"]}'
            # name = f'{x["bv"].replace("bv", "BV")}'
            length = 20
            if part in (7, 11, 15):
                length = 15
            if part == 16:
                length = 30
            if x.get("changqi"):
                length -= 10
            if rankfrom <= max:
                max = rankfrom
            if rank <= max and rank >= min:
                yamlcontent += [
                    {
                        ":rank": rank,
                        ":name": name,
                        ":length": length,
                        ":offset": 0,
                    }
                ]
                doorcontent += [
                    (
                        rank,
                        f'{x["bv"].replace("bv", "BV")}',
                        x["name"],
                    )
                ]

    # print(dump(yamlcontent[::-1], sort_keys=False))
    with open(f"./ranking/list1/{WEEKS}_{part}.yml", "w") as f:
        f.write(f"---\n{dump(yamlcontent[::-1],sort_keys=False)}")

    with open(f"./{WEEKS}_rankdoor.csv", "a", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                {
                    "results": "主榜",
                    "results_history": "历史",
                    "guoman_bangumi": "国创",
                    "results_bangumi": "番剧",
                }.get(file)
            ]
        )
        writer.writerows(sorted(doorcontent, reverse=True))


def text2img(name, text, font, emoji, color, size):
    global browser
    html_content = f"""<html>
        <head>
            <style type="text/css">
                @font-face {{
                    font-family: "Custom";
                    src: url("{font}");
                }}
                @font-face {{
                    font-family: "Emoji";
                    src: url("{emoji}");
                }}
                body {{
                    font-family: Custom, Emoji, Segoe UI, Segoe UI Historic, Segoe UI Emoji, sans-serif;
                    font-size: {size}px;
                    overflow: hidden;
                    line-height: 350px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: left;
                    color: {color};
                    margin: 0px;
                    padding: 10px;
                    display: block;
                }}
            </style>
        </head>
        <body>
            <p>{text}</p>
        </body>
    </html>"""

    with open("TEXT.html", "w", encoding="utf-8-sig") as f:
        f.write(html_content)

    browser.get(f'file://{abspath("TEXT.html")}')
    # print(f"./{name}.png")
    browser.save_screenshot(f"./{name}.png")
    img = Image.open(f"./{name}.png")
    x, y = img.size
    i = 0
    while i <= x:
        if sum([img.getpixel((i, k))[-1] for k in range(y)]) != 0:
            break
        i += 1
    j = x - 1
    while j >= 0:
        if sum([img.getpixel((j, k))[-1] for k in range(y)]) != 0:
            break
        j -= 1
    img = img.crop((i, 0) + (j + 1, y))
    remove(abspath("TEXT.html"))
    return img


def Main():
    MakeYaml("results", 99, 21, 5)
    MakeYaml("results", 20, 11, 9)
    MakeYaml("results", 10, 4, 13)
    MakeYaml("results", 3, 1, 16)
    MakeYaml("results_history", 5, 1, 15)
    MakeYaml("guoman_bangumi", 10, 1, 7)
    MakeYaml("results_bangumi", 10, 1, 11)
    Opening()
    LongTerm()
    History()
    MainRank()
    Stat()
    Top()
    for i in range(4):
        SubRank(i + 1)


if __name__ == "__main__":
    Main()
