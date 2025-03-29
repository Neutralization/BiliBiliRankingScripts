# -*- coding: utf-8 -*-

import json
from functools import reduce

import requests

from constant import UA, WEEKS, av2bv


def getVideoTitle(aid):
    params = {
        "aid": aid,
    }
    headers = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
    }
    resp = requests.get(
        "https://api.bilibili.com/x/web-interface/view",
        headers=headers,
        params=params,
    )
    result = json.loads(resp.content)
    errorcode = result.get("code")
    codemsg = {-404: "管理员锁定", 62002: "用户自删除", 62012: "用户仅自见"}
    if errorcode == 0:
        title = result["data"]["title"]
        tname = result["data"]["tname"]
        return {aid: {"title": title, "tname": tname}}
    else:
        lost = json.load(open("LostFile.json", "r", encoding="utf-8"))
        lost[f"av{aid}"] = codemsg.get(errorcode)
        lost[f"{av2bv(aid)}"] = codemsg.get(errorcode)
        json.dump(
            lost,
            open("LostFile.json", "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=4,
        )
        print(f"> Error {errorcode} | av{aid} / {av2bv(aid)} 啊叻？视频不见了？")
        return {aid: {"title": "", "tname": ""}}


def main():
    ranklist = [
        f"./{WEEKS}_results.json",
        f"./{WEEKS}_results_history.json",
        f"./{WEEKS}_guoman_bangumi.json",
        f"./{WEEKS}_results_bangumi.json",
    ]
    for rankfile in ranklist:
        content = json.load(open(rankfile, "r", encoding="utf-8"))
        ranks = [rank["wid"] for rank in content if rank.get("wid")]
        VideoTitleDict = reduce(lambda x, y: {**x, **y}, map(getVideoTitle, ranks))
        for rank in content:
            if rank.get("wid"):
                if VideoTitleDict[rank.get("wid")]["title"] != "":
                    rank["name"] = VideoTitleDict[rank.get("wid")]["title"]
                else:
                    pass
                if VideoTitleDict[rank.get("wid")]["tname"] != "":
                    rank["tname"] = VideoTitleDict[rank.get("wid")]["tname"]
                else:
                    pass
        json.dump(
            content,
            open(rankfile, "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=4,
        )


if __name__ == "__main__":
    main()
