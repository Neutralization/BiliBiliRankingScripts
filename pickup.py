# -*- coding: utf-8 -*-

import json
import re
from os import remove
from os.path import abspath
from unicodedata import combining, normalize

import arrow
import requests
from PIL import Image, ImageDraw, ImageFont
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from yaml import BaseLoader
from yaml import load as yload

from constant import (
    C_6D4B2B,
    C_FFFFFF,
    CONTROL,
    HANNOTATESC_W5,
    HUAWENYUANTI_BOLD,
    PICKUPIMG,
    SEGOE_UI_EMOJI,
    STYUANTI_SC_BOLD,
    WEEKS,
    UA,
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

browser_options = Options()
browser_options.add_argument("--headless")
browser_options.add_argument("--window-size=4096,500")
browser_options.add_argument("--window-position=-2400,-2400")
browser = Chrome(options=browser_options)
browser_command = f"/session/{browser.session_id}/chromium/send_command_and_get_result"
browser_url = browser.command_executor._url + browser_command
browser_data = json.dumps(
    {
        "cmd": "Emulation.setDefaultBackgroundColorOverride",
        "params": {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
    }
)
browser.command_executor._request("POST", browser_url, browser_data)


def GetInfo(aid):
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


def Single(Avid):
    Author_F = ImageFont.truetype(HANNOTATESC_W5, 32)
    Bid_F = ImageFont.truetype(STYUANTI_SC_BOLD, 42)
    Cata_F = ImageFont.truetype(STYUANTI_SC_BOLD, 36)
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
    RankImg = Image.open(PICKUPIMG)
    RankPaper = ImageDraw.Draw(RankImg)

    NFCTitle = normalize("NFC", Title)
    NFCTitle = "".join([c for c in NFCTitle if combining(c) == 0])
    RegexTitle = re.sub(CONTROL, "", NFCTitle)

    TImg_O = 32
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
    RankImg.save(f"./ranking/list1/av{Aid}.png")
    RankImg.save(f"./ranking/list1/{av2bv(int(Aid))}.png")


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
                    padding: 0px 20px 0px 20px;
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
    print(f"./{name}.png")
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
    print(WEEKS)
    ymlfile = yload(
        open(
            f"./ranking/list1/{WEEKS}_3.yml",
            "r",
            encoding="utf-8-sig",
        ),
        Loader=BaseLoader,
    )
    for x in ymlfile:
        avid = x[":name"][2:] if x[":name"][2:].isdigit() else bv2av(x[":name"])
        print(avid)
        Single(avid)


if __name__ == "__main__":
    Main()
