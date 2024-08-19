# -*- coding: utf-8 -*-

import json
from functools import reduce

import requests

from constant import WEEKS, UA, av2bv


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
    if result.get("code") == 0:
        title = result["data"]["title"]
        return {aid: title}
    else:
        lost = json.load(open("LostFile.json", "r", encoding="utf-8"))
        lost["name"].append(f"av{aid}")
        lost["name"].append(f"{av2bv(aid)}")
        lost["name"] = list(set(lost["name"]))
        json.dump(lost, open("LostFile.json", "w", encoding="utf-8"))
        print(f"> av{aid} 啊叻？视频不见了？")
        return {aid: ""}


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
                if VideoTitleDict[rank.get("wid")] != "":
                    rank["name"] = VideoTitleDict[rank.get("wid")]
                else:
                    pass
        json.dump(
            content,
            open(rankfile, "w", encoding="utf-8"),
            # ensure_ascii=True,
            # indent=4,
        )


if __name__ == "__main__":
    main()
