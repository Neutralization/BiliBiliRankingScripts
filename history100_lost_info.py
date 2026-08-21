from typing import Final, TypedDict


class VideoInfo(TypedDict):
    aid: str
    bvid: str
    tname: str
    pubdate: int | str
    owner: str
    title: str


LOST_INFO: Final[dict[str, VideoInfo]] = {
    "1906108321": {
        "aid": "1906108321",
        "bvid": "BV1fKCzYWEkU",
        "tname": "短片",
        "pubdate": "2024-07-07 11:47:38",
        "owner": "麦克阿瑟传奇纪录片",
        "title": "大型纪录片《兄弟致富路》",
    },
    "113718872510574": {
        "aid": "113718872510574",
        "bvid": "BV1fKCzYWEkU",
        "tname": "同人·手书",
        "pubdate": "2024-12-26 19:28:38",
        "owner": "刘师兄_liujun",
        "title": "零经费 自拍《三体2：黑暗森林》（自制动画）第05集",
    },
    "1151699647": {
        "aid": "1151699647",
        "bvid": "BV1NZ421h7yv",
        "tname": "娱乐杂谈",
        "pubdate": "2024-03-10 12:00:00",
        "owner": "吃瓜郭昱麟",
        "title": "邪淫，抽卡，小团团被抓，大司马撤编。斗鱼直播帝国因何而崩塌？",
    },
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
    "751261314": {
        "aid": "751261314",
        "bvid": "BV1Xk4y1Q7Wo",
        "tname": "",
        "pubdate": "2024-01-15 18:22:04",
        "owner": "长片短解",
        "title": "只因我成了爸爸，所以再看这部20年前的电影，有了完全不同的感受！",
    },
    "1801791019": {
        "aid": "1801791019",
        "bvid": "BV1kt421V7Zq",
        "tname": "搞笑",
        "pubdate": "2024-03-17 18:00:00",
        "owner": "螃蟹账号",
        "title": "螃蟹账号线下被打？进“莽村”后外访团队首次受伤！已构成故意伤害！",
    },
    "114606202691304": {
        "aid": "114606202691304",
        "bvid": "BV1a473zLExH",
        "tname": "手工",
        "pubdate": "2024-03-17 18:00:00",
        "owner": "纸飞君",
        "title": "简单好玩儿！让同学们欢呼不已的折纸直升机你在学校玩过吗？",
    },
}
