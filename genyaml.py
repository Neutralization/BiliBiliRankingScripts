# -*- coding: utf-8 -*-

import csv
import json

from yaml import dump

from constant import WEEKS


def MakeYaml(file, max, min, part):
    content = json.load(open(f"./{WEEKS}_{file}.json", "r", encoding="utf-8"))
    rankfrom = content[0].get("rank_from")
    yamlcontent = []
    doorcontent = []
    for x in content:
        if x.get("info") is None and x.get("sp_type_id") != 2:
            rank = x["score_rank"] if x.get("score_rank") else x["rank"]
            name = f'av{x["wid"]}'
            length = 20
            if part in (7, 11, 15):
                length = 15
            if part == 16:
                length = 30
            if x.get("changqi"):
                length -= 10
            if rankfrom <= max:
                max = rankfrom
            if rank <= max and rank >= min:
                yamlcontent += [
                    {
                        ":rank": rank,
                        ":name": name,
                        ":length": length,
                        ":offset": 0,
                    }
                ]
                doorcontent += [
                    (
                        rank,
                        f'BV{x["bv"][2:]}',
                        x["name"],
                    )
                ]

    # print(dump(yamlcontent[::-1], sort_keys=False))
    with open(f"./ranking/list1/{WEEKS}_{part}.yml", "w") as f:
        f.write(f"---\n{dump(yamlcontent[::-1],sort_keys=False)}")

    with open(f"./{WEEKS}_rankdoor.csv", "a", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                {
                    "results": "主榜",
                    "results_history": "历史",
                    "guoman_bangumi": "国创",
                    "results_bangumi": "番剧",
                }.get(file)
            ]
        )
        writer.writerows(sorted(doorcontent, reverse=True))


def main():
    MakeYaml("results", 99, 21, 5)
    MakeYaml("results", 20, 11, 9)
    MakeYaml("results", 10, 4, 13)
    MakeYaml("results", 3, 1, 16)
    MakeYaml("results_history", 5, 1, 15)
    MakeYaml("guoman_bangumi", 3, 1, 7)
    MakeYaml("results_bangumi", 10, 1, 11)


if __name__ == "__main__":
    main()
