# -*- coding: utf-8 -*-

import http.cookiejar
import json

import requests

from constant import WEEKS


def main():
    stamp = json.dumps(json.load(open("stamp.json", "r")))

    session = requests.session()
    jar = http.cookiejar.MozillaCookieJar("./cookies.txt")
    jar.load(ignore_discard=True, ignore_expires=True)
    session.cookies = jar

    params = (
        ("mid", "398300398"),
        ("ps", "30"),
        ("tid", "0"),
        ("pn", "1"),
        ("keyword", WEEKS),
        ("order", "pubdate"),
        ("jsonp", "jsonp"),
    )
    response = session.get("https://api.bilibili.com/x/space/arc/search", params=params)
    result = json.loads(response.content)
    bvid = result["data"]["list"]["vlist"][0]["bvid"]

    params = (("bvid", bvid),)
    response = session.get(
        "https://api.bilibili.com/x/web-interface/view", params=params
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
    main()
