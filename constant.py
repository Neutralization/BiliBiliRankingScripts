# -*- coding: utf-8 -*-
from math import floor

import arrow

YUME = 1277009809
WEEKS = floor(
    (int(arrow.now("Asia/Shanghai").timestamp()) - YUME + 133009) / 3600 / 24 / 7
)
FZCUYUAN_M03 = "./footage/方正粗圆_GBK_[FZY4K--GBK1-0].ttf"
HANNOTATE_SC = "./footage/手札体-简_[HannotateSC-W5].ttf"
STYUAN = "./footage/华文圆体粗体_[STYuanBold].ttf"
HYHEIMIJ = "./footage/汉仪黑咪体简_[HYm2gj].ttf"
HYQIHEI_105J = "./footage/汉仪旗黑 105简繁_[HYQiHei_105JF].ttf"
SEGOE_UI_EMOJI = "./footage/Segoe UI Emoji_[SegoeUIEmoji].ttf"
YUANTI_SC = "./footage/华文圆体 Bold_[STYuanti-SC-Bold].ttf"
BANGUMIRANKIMG = "./footage/BANGUMIRANKIMG.png"
DOWNIMG = "./footage/DOWNIMG.png"
DRAWIMG = "./footage/DRAWIMG.png"
HISTORYRANKIMG = "./footage/HISTORYRANKIMG.png"
HISTORYRECORDIMG = "./footage/HISTORYRECORDIMG.png"
LONGIMG = "./footage/LONGIMG.png"
LONGTIMEIMG = "./footage/LONGTIMEIMG.png"
MAINRANKIMG = "./footage/MAINRANKIMG.png"
MAINTITLEIMG = "./footage/MAINTITLEIMG.png"
PICKUPIMG = "./footage/PICKUPIMG.png"
REDFM = "./footage/FM.png"
STATONEIMG = "./footage/STATONEIMG.png"
STATTHREEIMG = "./footage/STATTHREEIMG.png"
STATTWOIMG = "./footage/STATTWOIMG.png"
SUBBANGUMIRANKIMG = "./footage/SUBBANGUMIRANKIMG.png"
SUBRANKIMG = "./footage/SUBRANKIMG.png"
TELEVERSIONRANKIMG = "./footage/TELEVERSIONRANKIMG.png"
TOP100IMG = "./footage/TOP100.png"
TOPIMG = "./footage/TOPIMG.png"
UPIMG = "./footage/UPIMG.png"
C_000000 = "#000000"
C_6D4B2B = "#6D4B2B"
C_818181 = "#818181"
C_AC8164 = "#AC8164"
C_BCA798 = "#BCA798"
C_CC0000 = "#CC0000"
C_EAAA7D = "#EAAA7D"
C_F5E5DA = "#F5E5DA"
C_FEE2B8 = "#FEE2B8"
C_FFFFFF = "#FFFFFF"
CONTROL = r"[\u0000-\u0019\u007F-\u00A0]"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
# https://www.zhihu.com/question/381784377/answer/1099438784
# https://github.com/Colerar/abv
XOR_CODE = 23442827791579
MASK_CODE = 2251799813685247
MAX_AID = 1 << 51
BASE = 58
BV_LEN = 12
ALPHABET = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf"

table = {}
for i in range(58):
    table[ALPHABET[i]] = i


def av2bv(avid: int):
    bv_list = list("BV1000000000")
    bv_idx = BV_LEN - 1
    tmp = (MAX_AID | avid) ^ XOR_CODE
    while tmp != 0:
        bv_list[bv_idx] = ALPHABET[tmp % BASE]
        tmp //= BASE
        bv_idx -= 1
    bv_list[3], bv_list[9] = bv_list[9], bv_list[3]
    bv_list[4], bv_list[7] = bv_list[7], bv_list[4]
    return "".join(bv_list)


def bv2av(bvid: str):
    bv_list = list(bvid)
    bv_list[3], bv_list[9] = bv_list[9], bv_list[3]
    bv_list[4], bv_list[7] = bv_list[7], bv_list[4]
    tmp = 0
    for char in bv_list[3:]:
        idx = table[char]
        tmp = tmp * BASE + idx
    avid = (tmp & MASK_CODE) ^ XOR_CODE
    return avid


if __name__ == "__main__":
    print(av2bv(1600688209))
    print(av2bv(1450294115))
    print(bv2av("BV13v4y1o7PJ"))
    print(bv2av("BV1WZ4y1n7z2"))
