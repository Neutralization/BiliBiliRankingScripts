# -*- coding: utf-8 -*-

import re
from math import ceil

import arrow
from os import remove
from generate import text2img
from unicodedata import combining, normalize
from os.path import abspath
import requests
from PIL import Image, ImageDraw, ImageFont
from yaml import BaseLoader
from yaml import load as yload

from constant import (
    C_000000,
    C_6D4B2B,
    C_FFFFFF,
    CONTROL,
    HANNOTATESC_W5,
    HUAWENYUANTI_BOLD,
    HYQIHEI_AZEJ,
    REDFM,
    SEGOE_UI_EMOJI,
    STYUANTI_SC_BOLD,
    TOP100IMG,
    YUME,
)

LOST_INFO = {
    "443580160": {
        "aid": "443580160",
        "bvid": "BV1iL411z76f",
        "tname": "音乐现场",
        "pubdate": "2023-05-13 13:56:44",
        "owner": "龚琳娜",
        "title": "龚琳娜美依礼芽日语唱花海 |乘风2023",
    },
    "910787823": {
        "aid": "910787823",
        "bvid": "BV1HM4y1b79Z",
        "tname": "综艺",
        "pubdate": "2023-05-07 15:16:13",
        "owner": "GARNiDELiA",
        "title": "【MARiA】乘风2023初舞台！《极乐净土》，虽迟但到！",
    },
    "227527058": {
        "aid": "227527058",
        "bvid": "BV14h411u752",
        "tname": "绘画",
        "pubdate": "2023-04-16 11:23:46",
        "owner": "龙-凤尘",
        "title": "火柴人教学【基础篇】",
    },
    "606197808": {
        "aid": "606197808",
        "bvid": "BV1e84y1t7G6",
        "tname": "科学科普",
        "pubdate": "2022-12-11 22:01:14",
        "owner": "刘加勇医生",
        "title": "医生阳了，居家用药一次说清楚",
    },
    "256387835": {
        "aid": "256387835",
        "bvid": "BV1VY411c7tK",
        "tname": "日常",
        "pubdate": "2022-05-11 14:56:26",
        "owner": "寂照庵",
        "title": "蓝翔技校三年的课程被他三分钟介绍完了",
    },
}


def GetInfo(aid):
    result = requests.get(
        f"https://api.bilibili.com/x/web-interface/view?aid={aid}"
    ).json()
    if result["code"] != 0:
        return None
    else:
        infodata = {
            "aid": aid,
            "bvid": result["data"]["bvid"],
            "tname": result["data"]["tname"],
            "pubdate": result["data"]["pubdate"],
            "owner": result["data"]["owner"]["name"],
            "title": result["data"]["title"],
        }
        print(infodata)
        return infodata


def Single(Avid, Week):
    Author_F = ImageFont.truetype(HANNOTATESC_W5, 32)
    Bid_F = ImageFont.truetype(STYUANTI_SC_BOLD, 42)
    Cata_F = ImageFont.truetype(STYUANTI_SC_BOLD, 36)
    Week_F = ImageFont.truetype(HYQIHEI_AZEJ, 41)
    YearCount_F = ImageFont.truetype(HYQIHEI_AZEJ, 20)
    RankTime_F = ImageFont.truetype(HUAWENYUANTI_BOLD, 38)
    UpTime_F = Cata_F
    AllData = GetInfo(Avid)
    if AllData is None:
        AllData = LOST_INFO[Avid]
    Aid = AllData["aid"]
    Author = AllData["owner"]
    Bid = AllData["bvid"]
    Cata = AllData["tname"]
    Title = AllData["title"]
    UpTime = arrow.get(AllData["pubdate"]).format("YYYY-MM-DD HH:mm")
    RankDate = arrow.get(Week * 7 * 24 * 3600 + YUME).shift(days=-1)
    RankTime = f"{RankDate.format('YYYY年M月')}第{ceil(int(RankDate.format('D'))/7)}周"
    RankImg = Image.open(TOP100IMG)
    RankPaper = ImageDraw.Draw(RankImg)

    if int(RankDate.format("M")) == 6 and ceil(int(RankDate.format("D")) / 7) == 4:
        FMImg = Image.open(REDFM)
        FMRegion = FMImg.crop((0, 0) + FMImg.size)
        FMCover = FMRegion.resize((326, 203), Image.Resampling.LANCZOS)
        RankImg.paste(FMCover, (1542, 707))
        YearCount = int(RankDate.format("YYYY")) - 2009
        FMImg_X = 1560
        RankPaper.text(
            (FMImg_X + 1, 830 + 1), f"The {YearCount}th year", C_000000, YearCount_F
        )
        RankPaper.text((FMImg_X, 830), f"The {YearCount}th year", C_FFFFFF, YearCount_F)

    NFCTitle = normalize("NFC", Title)
    NFCTitle = "".join([c for c in NFCTitle if combining(c) == 0])
    RegexTitle = re.sub(CONTROL, "", NFCTitle)

    TImg_O = 31
    TImg = text2img(
        Aid,
        RegexTitle,
        abspath(HUAWENYUANTI_BOLD).replace("\\", "/"),
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

    Author_X = 31
    AuthorName = f"{Author}   投稿"
    RankPaper.text((Author_X, 927), AuthorName, C_6D4B2B, Author_F)
    Bid_X = 195 - Bid_F.getlength(Bid) / 2
    RankPaper.text((Bid_X, 847), Bid, C_FFFFFF, Bid_F)
    Cata_X = 580 - Cata_F.getlength(Cata) / 2
    RankPaper.text((Cata_X, 849), Cata, C_6D4B2B, Cata_F)
    UpTime_O = 933
    UpTime_X = UpTime_O - UpTime_F.getlength(UpTime) / 2
    RankPaper.text((UpTime_X, 850), UpTime, C_6D4B2B, UpTime_F)
    Week_X = 1560
    RankPaper.text((Week_X + 1, 782 + 1), f"#{Week}", C_000000, Week_F)
    RankPaper.text((Week_X, 782), f"#{Week}", C_FFFFFF, Week_F)
    RankTime_X = 1705 - RankTime_F.getlength(RankTime) / 2
    RankPaper.text((RankTime_X, 926), RankTime, C_FFFFFF, RankTime_F)
    RankImg.save(f"./ranking/list100/{Week}_av{Aid}.png")


def Main():
    ymlfile = yload(
        open(
            "./ranking/list100/700.yml",
            "r",
            encoding="utf-8-sig",
        ),
        Loader=BaseLoader,
    )
    for x in ymlfile:
        print(x[":name"][2:], int(x[":rank"]))
        Single(x[":name"][2:], int(x[":rank"]))


if __name__ == "__main__":
    Main()
