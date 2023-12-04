# -*- coding: utf-8 -*-

import json
from functools import reduce

import requests

from constant import WEEKS


def getVideoTitle(bvid):
    params = {
        "bvid": bvid,
    }
    if bvid[0] == "a":
        params = {
            "aid": bvid[3:],
        }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
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
        return {bvid: title}
    else:
        lost = json.load(open("LostFile.json", "r", encoding="utf-8"))
        lost["name"].append(f"av{bv2av(bvid)}")
        lost["name"] = list(set(lost["name"]))
        json.dump(lost, open("LostFile.json", "w", encoding="utf-8"))
        print(f"{bvid}->av{bv2av(bvid)} 404")
        return {bvid: ""}


def bv2av(bvid):
    table = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"
    tr = {}
    for i in range(58):
        tr[table[i]] = i
    s = [11, 10, 3, 8, 4, 6]
    xor = 177451812
    add = 8728348608

    def dec(x):
        r = 0
        for i in range(6):
            r += tr[x[s[i]]] * 58**i
        return (r - add) ^ xor

    return dec(bvid)


def main():
    ranklist = [
        f"./{WEEKS}_results.json",
        f"./{WEEKS}_results_history.json",
        f"./{WEEKS}_guoman_bangumi.json",
        f"./{WEEKS}_results_bangumi.json",
    ]
    for rankfile in ranklist:
        content = json.load(open(rankfile, "r", encoding="utf-8"))
        ranks = [rank["bv"] for rank in content if rank.get("bv")]
        VideoTitleDict = reduce(lambda x, y: {**x, **y}, map(getVideoTitle, ranks))
        for rank in content:
            if rank.get("bv"):
                if VideoTitleDict[rank.get("bv")] != "":
                    rank["name"] = VideoTitleDict[rank.get("bv")]
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
