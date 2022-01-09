# -*- coding: utf-8 -*-

import asyncio
import json
from functools import reduce

import aiohttp

from constant import WEEKS


async def getVideoTitle(bvid):
    params = (("bvid", bvid),)
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.bilibili.com/x/web-interface/view", params=params
        ) as resp:
            content = await resp.text()
            result = json.loads(content)
    if result.get("code") == 0:
        title = result["data"]["title"]
        return {bvid: title}
    else:
        return {bvid: ""}


def main():
    content = json.load(open(f"./{WEEKS}_results.json", "r", encoding="utf-8"))
    ranks = [rank["bv"] for rank in content if rank.get("bv")]
    tasks = [asyncio.ensure_future(getVideoTitle(bvid)) for bvid in ranks]
    loop = asyncio.get_event_loop()
    VideoTitles = loop.run_until_complete(asyncio.gather(*tasks))
    VideoTitleDict = reduce(lambda x, y: {**x, **y}, VideoTitles)
    for rank in content:
        if rank.get("bv"):
            if VideoTitleDict[rank.get("bv")] != "":
                rank["name"] = VideoTitleDict[rank.get("bv")]
            else:
                pass
    json.dump(
        content,
        open(f"./{WEEKS}_results.json", "w", encoding="utf-8"),
        # ensure_ascii=False,
        indent=4,
    )


if __name__ == "__main__":
    main()
