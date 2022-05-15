# -*- coding: utf-8 -*-

import http.cookiejar
import json

import requests
import yaml

from constant import WEEKS

data = {
    3: "Pickup",
    5: "21-30+",
    7: "影视&国创",
    9: "11-20",
    11: "番剧",
    13: "4-10",
    15: "历史",
    16: "1-3",
}
for p in (3, 5, 7, 9, 11, 13, 15, 16):
    yml = yaml.load(open(f".\\ranking\\list1\\{WEEKS}_{p}.yml"), Loader=yaml.FullLoader)
    data[p] = sum([int(x[":length"]) for x in yml]), len(yml), data[p]

offset = 41
print("00:00", "00:41", "OP")
post = [{"from": 0, "to": 41, "content": "OP"}]
for p in (3, 5, 7, 9, 11, 13, 15, 16):
    gap = 0
    if p == 3:
        gap = data[p][1] - 1 + 4
    if p == 5:
        gap = data[p][1] - 1 + 4
    if p == 7:
        gap = data[p][1] - 1 + 49
    if p == 9:
        gap = data[p][1] + 1
    if p == 11:
        gap = data[p][1] + 24
    if p == 13:
        gap = data[p][1] + 4
    if p == 15:
        gap = data[p][1] + 11
    if p == 16:
        gap = data[p][1] - 1
    temp = offset + gap + data[p][0]
    post += [{"from": offset, "to": temp, "content": data[p][2]}]
    print(
        f"{offset//60:0>2}:{offset%60:0>2}", f"{temp//60:0>2}:{temp%60:0>2}", data[p][2]
    )
    offset = temp


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
response = session.get("https://api.bilibili.com/x/web-interface/view", params=params)
result = json.loads(response.content)
aid = result["data"]["aid"]
cid = result["data"]["pages"][0]["cid"]
duration = result["data"]["pages"][0]["duration"]
post += [{"from": offset, "to": duration, "content": "ED"}]
print(
    f"{offset//60:0>2}:{offset%60:0>2}",
    f"{duration//60:0>2}:{duration%60:0>2}",
    "ED",
)
print(session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value)

stampdata = {
    "aid": aid,
    "cid": cid,
    "type": "2",
    "cards": json.dumps(post),
    "csrf": session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value,
}
response = session.post("https://member.bilibili.com/x/web/card/submit", data=stampdata)
print(json.loads(response.content))

topdata = {
    "aid": aid,
    "reason": "",
    "jsonp": "jsonp",
    "csrf": session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value,
}
response = session.post("https://api.bilibili.com/x/space/top/arc/set", data=topdata)
print(json.loads(response.content))

response = session.get(
    "https://api.bilibili.com/x/space/masterpiece?vmid=398300398&jsonp=jsonp"
)
result = json.loads(response.content)
masterpiece = [x["aid"] for x in result["data"] if "周刊哔哩哔哩排行榜" in x["title"]]
print(masterpiece)
canceldata = {
    "aid": masterpiece[0],
    "jsonp": "jsonp",
    "csrf": session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value,
}
response = session.post(
    "https://api.bilibili.com/x/space/masterpiece/cancel", data=canceldata
)
print(json.loads(response.content))
adddata = {
    "aid": aid,
    "reason": "",
    "jsonp": "jsonp",
    "csrf": session.cookies._cookies[".bilibili.com"]["/"]["bili_jct"].value,
}
response = session.post(
    "https://api.bilibili.com/x/space/masterpiece/add", data=adddata
)
print(json.loads(response.content))
