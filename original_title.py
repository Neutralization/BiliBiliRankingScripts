# -*- coding: utf-8 -*-

import json
from functools import reduce

import requests

from constant import WEEKS


def getVideoTitle(bvid):
    params = {
        "bvid": bvid,
    }
    resp = requests.get(
        "https://api.bilibili.com/x/web-interface/view",
        params=params,
    )
    result = json.loads(resp.content)
    if result.get("code") == 0:
        title = result["data"]["title"]
        return {bvid: title}
    else:
        return {bvid: ""}


def main():
    content = json.load(open(f"./{WEEKS}_results.json", "r", encoding="utf-8"))
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
        open(f"./{WEEKS}_results.json", "w", encoding="utf-8"),
        ensure_ascii=True,
        indent=4,
    )


if __name__ == "__main__":
    main()
