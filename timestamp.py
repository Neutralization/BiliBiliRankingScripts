# -*- coding: utf-8 -*-

import http.cookiejar
import json
import sys

import requests
from constant import UA


def main(bvid):
    stamp = json.dumps(json.load(open("stamp.json", "r", encoding="gb2312")))

    session = requests.session()
    jar = http.cookiejar.MozillaCookieJar("./cookies.txt")
    jar.load(ignore_discard=True, ignore_expires=True)
    session.cookies = jar

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
    params = (("bvid", bvid),)
    response = session.get(
        "https://api.bilibili.com/x/web-interface/view", headers=headers, params=params
    )
    result = json.loads(response.content)
    aid = result["data"]["aid"]
    cid = result["data"]["pages"][0]["cid"]

    stampdata = {
        "aid": aid,
        "cid": cid,
        "type": "2",
        "cards": stamp,
        "permanent": "false",
        "csrf": session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value,
    }
    response = session.post(
        "https://member.bilibili.com/x/web/card/submit", data=stampdata
    )
    print(json.loads(response.content))


if __name__ == "__main__":
    main(sys.argv[1])
