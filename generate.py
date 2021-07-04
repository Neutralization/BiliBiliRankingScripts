# -*- coding: utf-8 -*-

import json
import os
import re

import arrow
import emoji
import requests
from PIL import Image, ImageDraw, ImageFont

YUME = 1277009809
WEEKS = round((int(arrow.now("Asia/Shanghai").timestamp()) - YUME) / 3600 / 24 / 7)
EMOJIONE = "./footage/EmojiOneColor.OTF"
HYM2GJ = "./footage/汉仪黑咪体简_[HYm2gj].TTF"
HUAWENYUANTI_BOLD = "./footage/华文圆体粗体_[STYuanBold].TTF"
FZY4K_GBK1_0 = "./footage/方正粗圆_GBK_[FZY4K_GBK1_0].TTF"
HANNOTATESC_W5 = "./footage/华康手札体简W5_[HannotateSC-W5].TTF"
STYUANTI_SC_BOLD = "./footage/华文圆体_Bold_[STYuanti_SC_Bold].TTF"
MAINTITLEIMG = "./footage/MAINTITLEIMG.png"
LONGIMG = "./footage/LONGIMG.png"
HISTORYRECORDIMG = "./footage/HISTORYRECORDIMG.png"
BANGUMIRANKIMG = "./footage/BANGUMIRANKIMG.png"
HISTORYRANKIMG = "./footage/HISTORYRANKIMG.png"
MAINRANKIMG = "./footage/MAINRANKIMG.png"
SUBRANKIMG = "./footage/SUBRANKIMG.png"
SUBBANGUMIRANKIMG = "./footage/SUBBANGUMIRANKIMG.png"
TELEVERSIONRANKIMG = "./footage/TELEVERSIONRANKIMG.png"
TOPIMG = "./footage/TOPIMG.png"
STATONEIMG = "./footage/STATONEIMG.png"
STATTWOIMG = "./footage/STATTWOIMG.png"
STATTHREEIMG = "./footage/STATTHREEIMG.png"
LONGTIMEIMG = "./footage/LONGTIMEIMG.png"
DOWNIMG = "./footage/DOWNIMG.png"
DRAWIMG = "./footage/DRAWIMG.png"
UPIMG = "./footage/UPIMG.png"
C_6D4B2B = "#6D4B2B"
C_FFFFFF = "#FFFFFF"
C_EAAA7D = "#EAAA7D"
C_FEE2B8 = "#FEE2B8"
C_F5E5DA = "#F5E5DA"
C_BCA798 = "#BCA798"
C_AC8164 = "#AC8164"

MRank = json.load(open(f"{WEEKS}_results.json", "r", encoding="utf-8"))
BRank = json.load(open(f"{WEEKS}_results_bangumi.json", "r", encoding="utf-8"))
GRank = json.load(open(f"{WEEKS}_guoman_bangumi.json", "r", encoding="utf-8"))
HRank = json.load(open(f"{WEEKS}_results_history.json", "r", encoding="utf-8"))
SRank = json.load(open(f"{WEEKS}_stat.json", "r", encoding="utf-8"))

MRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": x["bv"],
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "changqi": x["changqi"],
        "clicks_rank": format(x["clicks_rank"], ","),
        "clicks": format(x["clicks"], ","),
        "comments_rank": format(x["comments_rank"], ","),
        "comments": format(x["comments"], ","),
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": (x["clicks"] + 200000) / (x["clicks"] * 2),
        "fix_b": (x["stows"] * 20 + x["yb"] * 10)
        / (x["clicks"] + x["yb"] * 10 + x["comments"] * 50),
        "fix_b_": (x["clicks"] * 50) / (x["clicks"] + x["comments"] * 50),
        "fix_c": (x["yb"] * 2000) / x["clicks"],
        "fix_p": 4 / (x["part"] + 3),
        "last": str(x["last"]),
        "part": str(x["part"]),
        "pic": x["pic"],
        "score": format(x["score"], ","),
        "score_rank": str(x["score_rank"]),
        "sp_type_id": x["sp_type_id"],
        "stows_rank": format(x["stows_rank"], ","),
        "stows": format(x["stows"], ","),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "wtype": x["wtype"],
        "yb_rank": format(x["yb_rank"], ","),
        "yb": format(x["yb"], ","),
    }
    for x in MRank
    if x["wid"] is not None
}
BRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": x["bv"],
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": (x["click"] + 200000) / (x["click"] * 2),
        "fix_b": (x["stow"] * 20 + x["yb"] * 10)
        / (x["click"] + x["yb"] * 10 + x["comm"] * 50),
        "fix_b_": (x["click"] * 50) / (x["click"] + x["comm"] * 50),
        "fix_c": (x["yb"] * 2000) / x["click"],
        "fix_p": 4 / (x["part_count"] + 3),
        "last": str(x.get("last") if x.get("last") else 0),
        "part": str(x["part_count"]),
        "pic": x["pic"],
        "score": format(x["score"], ","),
        "score_rank": str(x["rank"]),
        "stows_rank": format(x["stow_rank"], ","),
        "stows": format(x["stow"], ","),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "yb_rank": format(x["yb_rank"], ","),
        "yb": format(x["yb"], ","),
    }
    for x in BRank
    if x["wid"] is not None
}
GRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": x["bv"],
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "clicks_rank": format(x["click_rank"], ","),
        "clicks": format(x["click"], ","),
        "comments_rank": format(x["comm_rank"], ","),
        "comments": format(x["comm"], ","),
        "cover": x["cover"],
        "danmu_rank": format(x["danmu_rank"], ","),
        "danmu": format(x["danmu"], ","),
        "fix_a": (x["click"] + 200000) / (x["click"] * 2),
        "fix_b": (x["stow"] * 20 + x["yb"] * 10)
        / (x["click"] + x["yb"] * 10 + x["comm"] * 50),
        "fix_b_": (x["click"] * 50) / (x["click"] + x["comm"] * 50),
        "fix_c": (x["yb"] * 2000) / x["click"],
        "fix_p": 4 / (x["part_count"] + 3),
        "last": str(x.get("last") if x.get("last") else 0),
        "part": str(x["part_count"]),
        "pic": x["pic"],
        "score": format(x["score"], ","),
        "score_rank": str(x["rank"]),
        "stows_rank": format(x["stow_rank"], ","),
        "stows": format(x["stow"], ","),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "yb_rank": format(x["yb_rank"], ","),
        "yb": format(x["yb"], ","),
    }
    for x in GRank
    if x["wid"] is not None
}
HRankData = {
    x["wid"]: {
        "author": f"{x['author']}   投稿",
        "av": x["wid"],
        "bv": x["bv"],
        "cdate": arrow.get(x["cdate"]).format("YYYY-MM-DD HH:mm"),
        "score": format(x["score"], ","),
        "score_rank": str(x["score_rank"]),
        "title": str(x["name"]),
        "weekly_id": x["weekly_id"],
        "wtype": x["wtype"],
    }
    for x in HRank
    if x.get("info") is None
}
SRankData = {x["type"]: x.get("ranks") for x in SRank}
AllData = {
    **MRankData,
    **BRankData,
    **GRankData,
    **HRankData,
}


def Resource(bid, link, name):
    ext = link.split(".")[-1]
    resp = requests.get(link)
    if not os.path.exists(f"./pic/{bid}_{name}.{ext}"):
        with open(f"./pic/{bid}_{name}.{ext}", "wb") as f:
            f.write(resp.content)
    return f"./pic/{bid}_{name}.{ext}"


def Single(args):
    bid, rtype = args
    Author_F = ImageFont.truetype(HANNOTATESC_W5, 32)
    Bid_F = ImageFont.truetype(STYUANTI_SC_BOLD, 42)
    BiDataRank_F = ImageFont.truetype(HANNOTATESC_W5, 26)
    Cata_F = ImageFont.truetype(STYUANTI_SC_BOLD, 36)
    DataFix_F = ImageFont.truetype(STYUANTI_SC_BOLD, 32)
    Emoji_F = ImageFont.truetype(EMOJIONE, 54)
    HisRank_F = ImageFont.truetype(STYUANTI_SC_BOLD, 72)
    LastRank_F = ImageFont.truetype(HANNOTATESC_W5, 36)
    Score_F = ImageFont.truetype(STYUANTI_SC_BOLD, 52)
    ScoreRank_F = ImageFont.truetype(HYM2GJ, 150)
    Title_F = ImageFont.truetype(HUAWENYUANTI_BOLD, 54)
    Part_F = BiDataRank_F
    Data_F = UpTime_F = Cata_F
    Aid = AllData[bid]["av"]
    Author = AllData[bid]["author"]
    Bid = AllData[bid]["bv"]
    Score = AllData[bid]["score"]
    ScoreRank = AllData[bid]["score_rank"]
    Title = AllData[bid]["title"]
    UpTime = AllData[bid]["cdate"]
    Week = AllData[bid]["weekly_id"]

    ishistory = bool(str(Week) != str(WEEKS))
    RankImg = (
        Image.open(HISTORYRANKIMG)
        if ishistory
        else Image.open(MAINRANKIMG)
        if rtype
        else Image.open(BANGUMIRANKIMG)
    )
    RankPaper = ImageDraw.Draw(RankImg)

    if rtype and not ishistory and AllData[bid]["changqi"]:
        LongMark = Image.open(LONGTIMEIMG)
        LongRegion = LongMark.crop((0, 0) + LongMark.size)
        RankImg.paste(LongRegion, (11, 11))
    if not rtype:
        Cover = AllData[bid]["cover"]
        CoverFile = Resource(bid, Cover, "cover")
        IconMark = Image.open(CoverFile)
        IconRegion = IconMark.crop((0, 0) + IconMark.size)
        IconCover = IconRegion.resize((115, 115), Image.ANTIALIAS)
        RankImg.paste(IconCover, (19, 929))

    ShinkSize = 0
    Title_O = 31 if rtype else 167
    RegexTitle = re.sub(chr(65039), "", Title)
    while (Title_F.getsize(RegexTitle)[0] + Title_O) > 1510:
        ShinkSize += 1
        Title_F = ImageFont.truetype(HUAWENYUANTI_BOLD, 54 - ShinkSize)
        Emoji_F = ImageFont.truetype(EMOJIONE, 54 - ShinkSize)
    RankPaper.text((Title_O, 979), RegexTitle, C_6D4B2B, Title_F)

    for i in range(len(RegexTitle)):
        if RegexTitle[i] in emoji.UNICODE_EMOJI["en"]:
            Square = Image.new("RGB", (54 - ShinkSize, 54 - ShinkSize), C_F5E5DA)
            Title_X = Title_O + Title_F.getsize(RegexTitle[:i])[0]
            RankImg.paste(Square, (Title_X, 979))
            RankPaper.text((Title_X, 979), RegexTitle[i], C_6D4B2B, Emoji_F)

    Author_X = 31 if rtype else 189
    AuthorName = Author if rtype else "投稿"
    RankPaper.text((Author_X, 927), AuthorName, C_6D4B2B, Author_F)
    Bid_X = 195 - Bid_F.getsize(Bid)[0] / 2
    RankPaper.text((Bid_X, 847), Bid, C_FFFFFF, Bid_F)

    if rtype:
        Cata = AllData[bid]["wtype"]
        Cata_X = 580 - Cata_F.getsize(Cata)[0] / 2
        RankPaper.text((Cata_X, 849), Cata, C_6D4B2B, Cata_F)
    UpTime_O = 933 if rtype else 754
    UpTime_X = UpTime_O - UpTime_F.getsize(UpTime)[0] / 2
    RankPaper.text((UpTime_X, 850), UpTime, C_6D4B2B, UpTime_F)
    ScoreRank_X = 1703 - ScoreRank_F.getsize(ScoreRank)[0] / 2
    RankPaper.text((ScoreRank_X, 28), ScoreRank, C_FFFFFF, ScoreRank_F)

    Score_X = 1703 - Score_F.getsize(Score)[0] / 2
    if ishistory:
        RankPaper.text((Score_X, 280), Score, C_FFFFFF, Score_F)
        RankPaper.text((1495, 400), f"#{Week}", C_FFFFFF, HisRank_F)
        RankImg.save(f"./ranking/list1/av{Aid}.png")
        return 0
    RankPaper.text((Score_X, 376), Score, C_FFFFFF, Score_F)

    Click = AllData[bid]["clicks"]
    ClickRank = AllData[bid]["clicks_rank"]
    Coin = AllData[bid]["yb"]
    CoinRank = AllData[bid]["yb_rank"]
    Comment = AllData[bid]["comments"]
    CommentRank = AllData[bid]["comments_rank"]
    Danmu = AllData[bid]["danmu"]
    DanmuRank = AllData[bid]["danmu_rank"]
    Stow = AllData[bid]["stows"]
    StowRank = AllData[bid]["stows_rank"]
    LastRank = AllData[bid]["last"]
    if str(LastRank) == "0":
        LastRank_X = 1703 - LastRank_F.getsize("新上榜")[0] / 2
        RankPaper.text((LastRank_X, 184), "新上榜", C_FEE2B8, LastRank_F)
    else:
        LastRank_X = 1703 - LastRank_F.getsize("上周")[0] / 2
        LastRank_X_ = 1703 + LastRank_F.getsize("上周")[0] / 2
        RankPaper.text((LastRank_X, 184), "上周", C_FEE2B8, LastRank_F)
        RankPaper.text((LastRank_X_, 184), LastRank, C_FEE2B8, LastRank_F)
        if int(ScoreRank) < int(LastRank):
            StatPin = Image.open(UPIMG)
        elif int(ScoreRank) > int(LastRank):
            StatPin = Image.open(DOWNIMG)
        elif int(ScoreRank) == int(LastRank):
            StatPin = Image.open(DRAWIMG)
        PinRegion = StatPin.crop((0, 0) + StatPin.size)
        PinCover = PinRegion.resize((45, 45), Image.BILINEAR)
        Pin_X = 1655 - int(LastRank_F.getsize("上周")[0] / 2)
        RankImg.paste(PinCover, (Pin_X, 190), mask=PinCover)
    RankPaper.text((1535, 545), Click, C_FFFFFF, Data_F)
    RankPaper.text((1535, 689), Comment, C_FFFFFF, Data_F)

    if rtype:
        Part = AllData[bid]["part"]
        if int(Part) > 1:
            Part_X = 1833 - Part_F.getsize(Part)[0] / 2
            RankPaper.text((Part_X, 552), f"{Part}P", C_EAAA7D, Part_F)
        RankPaper.text((1535, 833), Stow, C_FFFFFF, Data_F)
        RankPaper.text((1535, 977), Coin, C_FFFFFF, Data_F)
    else:
        RankPaper.text((1535, 833), Coin, C_FFFFFF, Data_F)
        RankPaper.text((1535, 977), Danmu, C_FFFFFF, Data_F)

    FixA = AllData[bid]["fix_a"]
    FixB = AllData[bid]["fix_b"]
    FixB_ = AllData[bid]["fix_b_"]
    FixC = AllData[bid]["fix_c"]
    FixP = AllData[bid]["fix_p"]
    AFix = f"×{str(round(FixP * FixA, 3))}"
    BFix = f"×{str(round(FixB * 50, 1))}" if rtype else f"×{str(round(FixB_, 1))}"
    BFix_ = f"×{str(round(FixB * 10, 2))}"
    CFix = "×20" if rtype else f"×{str(round(FixC, 2) if FixC < 50.00 else 50.00)}"
    RankPaper.text((1710, 551), AFix, C_EAAA7D, DataFix_F)
    RankPaper.text((1710, 695), BFix, C_EAAA7D, DataFix_F)
    RankPaper.text((1710, 839), CFix, C_EAAA7D, DataFix_F)

    if rtype:
        RankPaper.text((1710, 983), BFix_, C_EAAA7D, DataFix_F)
    RankPaper.text((1837, 492), ClickRank, C_EAAA7D, BiDataRank_F)
    RankPaper.text((1837, 635), CommentRank, C_EAAA7D, BiDataRank_F)
    if rtype:
        RankPaper.text((1837, 778), StowRank, C_EAAA7D, BiDataRank_F)
        RankPaper.text((1837, 921), CoinRank, C_EAAA7D, BiDataRank_F)
    else:
        RankPaper.text((1837, 778), CoinRank, C_EAAA7D, BiDataRank_F)
        RankPaper.text((1837, 921), DanmuRank, C_EAAA7D, BiDataRank_F)
    RankImg.save(f"./ranking/list1/av{Aid}.png")


def SubRank(rtype):
    if rtype == 1:
        LastRankNum = int(MRank[0]["rank_from"])
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in MRankData.values()
            if v["sp_type_id"] is None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 30
    elif rtype == 2:
        LastRankNum = 0
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in MRankData.values()
            if v["sp_type_id"] is not None and int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 3:
        LastRankNum = 10
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in BRankData.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 3
    elif rtype == 4:
        LastRankNum = 3
        SScoreRankData = {
            int(v["score_rank"]): v
            for v in GRankData.values()
            if int(v["score_rank"]) > LastRankNum
        }
        PageNum = 2
    for i in range(PageNum):
        SImg = Image.open(SUBRANKIMG) if rtype <= 2 else Image.open(SUBBANGUMIRANKIMG)
        SPaper = ImageDraw.Draw(SImg)
        for j in range(4):
            SBid_F = ImageFont.truetype(STYUANTI_SC_BOLD, 32)
            SBiDataRank_F = ImageFont.truetype(STYUANTI_SC_BOLD, 32)
            SData_F = ImageFont.truetype(STYUANTI_SC_BOLD, 40)
            SEmoji_F = ImageFont.truetype(EMOJIONE, 52)
            SLastRank_F = ImageFont.truetype(STYUANTI_SC_BOLD, 34)
            SScore_F = ImageFont.truetype(STYUANTI_SC_BOLD, 45)
            SScoreRank_F = ImageFont.truetype(HYM2GJ, 48)
            STitle_F = ImageFont.truetype(HUAWENYUANTI_BOLD, 52)
            SUpTime_F = ImageFont.truetype(STYUANTI_SC_BOLD, 37)
            k = LastRankNum + 4 * i + j + 1
            # SDanmuRank = SScoreRankData[k]["danmu_rank"]
            SBid = SScoreRankData[k]["bv"]
            SClick = SScoreRankData[k]["clicks"]
            SClickRank = SScoreRankData[k]["clicks_rank"]
            SCoin = SScoreRankData[k]["yb"]
            SCoinRank = SScoreRankData[k]["yb_rank"]
            SComment = SScoreRankData[k]["comments"]
            SCommentRank = SScoreRankData[k]["comments_rank"]
            SCover = SScoreRankData[k]["pic"]
            SDanmu = SScoreRankData[k]["danmu"]
            SScore = SScoreRankData[k]["score"]
            SScoreRank = SScoreRankData[k]["score_rank"]
            SStow = SScoreRankData[k]["stows"]
            SStowRank = SScoreRankData[k]["stows_rank"]
            STitle = SScoreRankData[k]["title"]
            SUpTime = SScoreRankData[k]["cdate"]
            SLastRank = (
                ""
                if SScoreRankData[k]["last"] == "0"
                else f"上周：{SScoreRankData[k]['last']}"
            )
            SCoverFile = Resource(SBid, SCover, "pic")
            SCoverMark = Image.open(SCoverFile)
            SCoverRegion = SCoverMark.crop((0, 0) + SCoverMark.size)
            SPic = SCoverRegion.resize((336, 210), Image.ANTIALIAS)
            SImg.paste(SPic, (63, 48 + j * 259))

            SRegexTitle = re.sub(chr(65039), "", STitle)
            SShinkSize = 0
            while (STitle_F.getsize(SRegexTitle)[0] + 443) > 1890:
                SShinkSize += 1
                STitle_F = ImageFont.truetype(HUAWENYUANTI_BOLD, 52 - SShinkSize)
                SEmoji_F = ImageFont.truetype(EMOJIONE, 52 - SShinkSize)
            STitle_X = 52 + j * 259
            SPaper.text((443, STitle_X), SRegexTitle, C_6D4B2B, STitle_F)
            for e in range(len(SRegexTitle)):
                if SRegexTitle[e] in emoji.UNICODE_EMOJI["en"]:
                    Square = Image.new(
                        "RGB", (52 - SShinkSize, 52 - SShinkSize), C_F5E5DA
                    )
                    SEmoji_X = 443 + STitle_F.getsize(SRegexTitle[:e])[0]
                    SImg.paste(Square, (SEmoji_X, STitle_X))
                    SPaper.text(
                        (SEmoji_X, STitle_X), SRegexTitle[e], C_6D4B2B, SEmoji_F
                    )
            SBid_X = 549 - SBid_F.getsize(SBid)[0] / 2
            SPaper.text((SBid_X, 212 + j * 259), SBid, C_FFFFFF, SBid_F)
            SScore_X = 1706 - SScore_F.getsize(SScore)[0]
            SPaper.text((SScore_X, 214 + j * 259), SScore, C_FFFFFF, SScore_F)
            SPaper.text((491, 133 + j * 259), SClick, C_6D4B2B, SData_F)
            SPaper.text((893, 133 + j * 259), SComment, C_6D4B2B, SData_F)
            if rtype > 2:
                SPaper.text((1218, 133 + j * 259), SDanmu, C_6D4B2B, SData_F)
            else:
                SPaper.text((1218, 133 + j * 259), SCoin, C_6D4B2B, SData_F)
                SPaper.text((1574, 133 + j * 259), SStow, C_6D4B2B, SData_F)
                SPaper.text((739, 138 + j * 259), SClickRank, C_BCA798, SBiDataRank_F)
                SPaper.text(
                    (1067, 138 + j * 259), SCommentRank, C_BCA798, SBiDataRank_F
                )
                SPaper.text((1748, 138 + j * 259), SStowRank, C_BCA798, SBiDataRank_F)
                SPaper.text((1390, 138 + j * 259), SCoinRank, C_BCA798, SBiDataRank_F)
            # SPaper.text(
            #     (1390, 138 + j * 259), SDanmuRank, C_BCA798, SBiDataRank_F
            # )
            SScoreRank_X = 1856 - SScoreRank_F.getsize(SScoreRank)[0] / 2
            SPaper.text(
                (SScoreRank_X, 214 + j * 259), SScoreRank, C_FFFFFF, SScoreRank_F
            )
            SPaper.text((820, 205 + j * 259), SUpTime, C_BCA798, SUpTime_F)
            SPaper.text((1244, 205 + j * 259), SLastRank, C_BCA798, SLastRank_F)
        if rtype == 1:
            SImg.save(f"./ranking/list2/{i+1:0>3}.png")
        elif rtype == 2:
            SImg.save(f"./ranking/list3/tv_{i+1:0>3}.png")
        elif rtype == 3:
            SImg.save(f"./ranking/list4/bangumi_{i+1:0>3}.png")
        elif rtype == 4:
            SImg.save(f"./ranking/list4/bangumi_{i+4:0>3}.png")


def Stat():
    ACata_F = ImageFont.truetype(FZY4K_GBK1_0, 43)
    ALastStat_F = ImageFont.truetype(STYUANTI_SC_BOLD, 31)
    ARank_F = ImageFont.truetype(STYUANTI_SC_BOLD, 35)
    AStat_F = ImageFont.truetype(STYUANTI_SC_BOLD, 38)
    AScore_F = ARank_F
    AImg_1 = Image.open(STATONEIMG)
    AImg_2 = Image.open(STATTWOIMG)
    AImg_3 = Image.open(STATTHREEIMG)
    APaper_1 = ImageDraw.Draw(AImg_1)
    APaper_2 = ImageDraw.Draw(AImg_2)
    APaper_3 = ImageDraw.Draw(AImg_3)
    for i in range(7):
        ACata = SRankData[2][i][0]
        ACata_X = 616 - ACata_F.getsize(ACata)[0] / 2
        APaper_1.text((ACata_X, 221 + i * 120), SRankData[2][i][0], C_6D4B2B, ACata_F)
        AScore = format(SRankData[2][i][1], ",")
        AScore_X = 1046 - AScore_F.getsize(AScore)[0]
        APaper_1.text((AScore_X, 221 + i * 120), AScore, C_6D4B2B, AScore_F)
        ARank = str(SRankData[2][i][2])
        APaper_1.text((1440, 221 + i * 120), ARank, C_AC8164, ARank_F)
        if int(ARank) > i + 1:
            AStatPin = Image.open(UPIMG)
        elif int(ARank) < i + 1:
            AStatPin = Image.open(DOWNIMG)
        elif int(ARank) == i + 1:
            AStatPin = Image.open(DRAWIMG)

        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.ANTIALIAS)
        AImg_1.paste(APinCover, (1500, 222 + i * 120), mask=APinCover)
    AImg_1.save("./ranking/pic/stat_1.png")
    for i in range(7):
        ACata = SRankData[2][i + 7][0]
        ACata_X = 616 - ACata_F.getsize(ACata)[0] / 2
        APaper_2.text(
            (ACata_X, 221 + i * 120), SRankData[2][i + 7][0], C_6D4B2B, ACata_F
        )
        AScore = format(SRankData[2][i + 7][1], ",")
        AScore_X = 1046 - AScore_F.getsize(AScore)[0]
        APaper_2.text((AScore_X, 221 + i * 120), AScore, C_6D4B2B, AScore_F)
        ARank = str(SRankData[2][i + 7][2])
        APaper_2.text((1440, 221 + i * 120), ARank, C_AC8164, ARank_F)
        if int(ARank) > i + 8:
            AStatPin = Image.open(UPIMG)
        elif int(ARank) < i + 8:
            AStatPin = Image.open(DOWNIMG)
        elif int(ARank) == i + 8:
            AStatPin = Image.open(DRAWIMG)
        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.ANTIALIAS)
        AImg_2.paste(APinCover, (1500, 222 + i * 120), mask=APinCover)
    AImg_2.save("./ranking/pic/stat_2.png")
    AClick = format(SRankData[3][0]["click"], ",")
    ACoin = format(SRankData[3][0]["yb"], ",")
    AComment = format(SRankData[3][0]["comment"], ",")
    ADanmu = format(SRankData[3][0]["danmu"], ",")
    AStow = format(SRankData[3][0]["stow"], ",")
    APaper_3.text((869 - AStat_F.getsize(AClick)[0], 304), AClick, C_6D4B2B, AStat_F)
    APaper_3.text(
        (869 - AStat_F.getsize(AComment)[0], 438), AComment, C_6D4B2B, AStat_F
    )
    APaper_3.text((869 - AStat_F.getsize(AStow)[0], 572), AStow, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getsize(ADanmu)[0], 706), ADanmu, C_6D4B2B, AStat_F)
    APaper_3.text((869 - AStat_F.getsize(ACoin)[0], 840), ACoin, C_6D4B2B, AStat_F)
    ALastClick = format(SRankData[3][1]["click"], ",")
    ALastCoin = format(SRankData[3][1]["yb"], ",")
    ALastComment = format(SRankData[3][1]["comment"], ",")
    ALastDanmu = format(SRankData[3][1]["danmu"], ",")
    ALastStow = format(SRankData[3][1]["stow"], ",")
    APaper_3.text((1279, 313), ALastClick, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 447), ALastComment, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 581), ALastStow, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 715), ALastDanmu, C_AC8164, ALastStat_F)
    APaper_3.text((1279, 849), ALastCoin, C_AC8164, ALastStat_F)
    for d in ["click", "comment", "stow", "danmu", "yb"]:
        if int(SRankData[3][0][d]) > int(SRankData[3][1][d]):
            AStatPin = Image.open(UPIMG)
        elif int(SRankData[3][0][d]) < int(SRankData[3][1][d]):
            AStatPin = Image.open(DOWNIMG)
        elif int(SRankData[3][0][d]) == int(SRankData[3][1][d]):
            AStatPin = Image.open(DRAWIMG)
        APinRegion = AStatPin.crop((0, 0) + AStatPin.size)
        APinCover = APinRegion.resize((45, 45), Image.ANTIALIAS)
        a_i = ["click", "comment", "stow", "danmu", "yb"].index(d)
        AImg_3.paste(APinCover, (1503, 309 + a_i * 134), mask=APinCover)
    AImg_3.save("./ranking/pic/stat_3.png")


def MainRank():
    LastRankNum = int(MRank[0]["rank_from"])
    RankDataM = [
        (k, True)
        for k, v in MRankData.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= LastRankNum
    ]
    RankDataB = [(k, False) for k, v in BRankData.items() if int(v["score_rank"]) <= 10]
    RankDataG = [(k, False) for k, v in GRankData.items() if int(v["score_rank"]) <= 3]
    RankDataH = [(k, True) for k, v in HRankData.items() if int(v["score_rank"]) <= 5]
    RankData = RankDataM + RankDataB + RankDataG + RankDataH
    list(map(Single, RankData))


def Opening():
    MTitle_F = ImageFont.truetype(HYM2GJ, 52)
    MWeek_F = ImageFont.truetype(HYM2GJ, 128)
    MTitle = f"{MRank[0]['name']}"
    MWeek = f"#{MRank[0]['id']}"
    MImg = Image.open(MAINTITLEIMG)
    MPaper = ImageDraw.Draw(MImg)
    MTitle_X = 376 - MTitle_F.getsize(MTitle)[0] / 2
    MWeek_X = 355 - MWeek_F.getsize(MWeek)[0] / 2
    MPaper.text((MTitle_X, 750), MTitle, C_FFFFFF, MTitle_F)
    MPaper.text((MWeek_X, 614), MWeek, C_FFFFFF, MWeek_F)
    MImg.save("./ranking/1_op/title.png")


def LongTerm():
    LTitle_F = ImageFont.truetype(HYM2GJ, 216)
    LongTerm_F = ImageFont.truetype(HANNOTATESC_W5, 45)
    LastRankNum = int(MRank[0]["rank_from"])
    LTitle = f"{LastRankNum}-21"
    LongTerm_ = f"长期作品：{LastRankNum - 30}个" if LastRankNum - 30 > 0 else "长期作品：没有"
    LImg = Image.open(LONGIMG)
    LPaper = ImageDraw.Draw(LImg)
    LTitle_X = 607 - LTitle_F.getsize(LTitle)[0] / 2
    LongTerm__X = 607 - LongTerm_F.getsize(LongTerm_)[0] / 2
    LPaper.text((LTitle_X, 415), LTitle, C_FFFFFF, LTitle_F)
    LPaper.text((LongTerm__X, 681), LongTerm_, C_FFFFFF, LongTerm_F)
    LImg.save("./ranking/pic/_1.png")


def History():
    HUpTime_F = ImageFont.truetype(HANNOTATESC_W5, 44)
    HCount_F = ImageFont.truetype(HANNOTATESC_W5, 45)
    HCount = f"该期集计投稿数：{format(HRank[0]['count'], ',')}"
    HUpTime = f"{HRank[0]['name']} (av{HRank[0]['wid']})"
    HImg = Image.open(HISTORYRECORDIMG)
    HPaper = ImageDraw.Draw(HImg)
    HCount_X = 607 - HCount_F.getsize(HCount)[0] / 2
    HUpTime_X = 607 - HUpTime_F.getsize(HUpTime)[0] / 2
    HPaper.text((HCount_X, 811), HCount, C_FFFFFF, HCount_F)
    HPaper.text((HUpTime_X, 529), HUpTime, C_FFFFFF, HUpTime_F)
    HImg.save("./ranking/pic/history.png")


def Top():
    Top_F = ImageFont.truetype(HYM2GJ, 390)
    Diff_F = ImageFont.truetype(HANNOTATESC_W5, 45)
    TopData = {
        int(v["score_rank"]): (k, v["score"])
        for k, v in MRankData.items()
        if v["sp_type_id"] is None and int(v["score_rank"]) <= 4
    }
    for t in range(3):
        TImg = Image.open(TOPIMG)
        TPaper = ImageDraw.Draw(TImg)
        Bid = TopData[t + 1][0]
        Diff = int(TopData[t + 1][1].replace(",", "")) - int(
            TopData[t + 2][1].replace(",", "")
        )
        DiffText = f"比第{t+2}名高出{format(Diff, ',')}pts."
        TPaper.text(
            (603 - Top_F.getsize(f"{t+1}")[0] / 2, 318), f"{t+1}", C_FFFFFF, Top_F
        )
        TPaper.text(
            (609 - Diff_F.getsize(DiffText)[0] / 2, 722), DiffText, C_FFFFFF, Diff_F
        )
        TImg.save(f"./ranking/list1/av{Bid}_.png")


def Main():
    Opening()
    LongTerm()
    History()
    MainRank()
    for i in range(4):
        SubRank(i + 1)
    Stat()
    Top()


if __name__ == "__main__":
    Main()
