# -*- coding: utf-8 -*-

import json

from yaml import dump

from constant import WEEKS


def MakeYaml(file, max, min, part):
    content = json.load(open(f"./{WEEKS}_{file}.json", "r", encoding="utf-8"))
    rankfrom = content[0].get("rank_from")
    yamlcontent = []
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
    # print(dump(yamlcontent[::-1], sort_keys=False))
    with open(f"./ranking/list1/{WEEKS}_{part}.yml", "w") as f:
        f.write(f"---\n{dump(yamlcontent[::-1],sort_keys=False)}")


def main():
    MakeYaml("results", 99, 21, 5)
    MakeYaml("results", 20, 11, 9)
    MakeYaml("results", 10, 4, 13)
    MakeYaml("results", 3, 1, 16)
    MakeYaml("guoman_bangumi", 3, 1, 7)
    MakeYaml("results_bangumi", 10, 1, 11)
    MakeYaml("results_history", 5, 1, 15)


if __name__ == "__main__":
    main()
