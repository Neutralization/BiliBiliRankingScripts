# -*- coding: utf-8 -*-

import asyncio
import json
import os
import re

from functools import reduce

import aiohttp

av2bv = {}


def getVideoDict(file):
    with open(file, 'r') as f:
        aidList = re.findall(r'(av\d+)', f.read())
    part = file[:-4]
    return {part: aidList}


async def getVideoTitle(aid):
    global av2bv
    params = (('aid', aid[2:]), )
    async with aiohttp.ClientSession() as session:
        async with session.get('https://api.bilibili.com/x/web-interface/view',
                               params=params) as resp:
            content = await resp.text()
            result = json.loads(content)
    if result.get('code') == 0:
        title = result['data']['title']
        av2bv[aid] = {'a': aid, 'b': result['data']['bvid']}
        return {aid: title}
    else:
        av2bv[aid] = {'a': aid, 'b': aid}
        return {aid: ''}


def main():
    ymlFiles = [x for x in os.listdir('.') if re.search(r'\.yml', x)]
    list(map(lambda x: os.rename(x, re.sub(r'^\d+_', '', x)), ymlFiles))
    ymlFiles = [re.sub(r'^\d+_', '', x) for x in ymlFiles]

    ymlVideoDict = reduce(lambda x, y: {**x, **y}, map(getVideoDict, ymlFiles))
    ymlVideoIDs = reduce(list.__add__, ymlVideoDict.values())

    Tasks = [asyncio.ensure_future(getVideoTitle(aid)) for aid in ymlVideoIDs]
    loop = asyncio.get_event_loop()
    ymlVideoTitles = loop.run_until_complete(asyncio.gather(*Tasks))

    ymlVideoTitleDict = reduce(lambda x, y: {**x, **y}, ymlVideoTitles)
    csvFile = open('rankdoor.csv', 'w', encoding='utf-8-sig')
    for part in ['3', '5', '9', '13', '16', '15', '7', '11']:
        if part == '3':
            csvFile.write('Pickup\n')
        elif part == '5' or part == '13':
            csvFile.write('主榜\n')
        elif part == '15':
            csvFile.write('历史\n')
        elif part == '7':
            csvFile.write('国创\n')
        elif part == '11':
            csvFile.write('番剧\n')
        for n, video in zip(range(len(ymlVideoDict[part]), 0, -1),
                            ymlVideoDict[part]):
            if part == '3':
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['b'], n, ymlVideoTitleDict[video]))
            elif part == '5':
                n += 20
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['b'], n, ymlVideoTitleDict[video]))
            elif part == '9':
                n += 10
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['b'], n, ymlVideoTitleDict[video]))
            elif part == '13':
                n += 3
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['b'], n, ymlVideoTitleDict[video]))
            elif part == '16' or part == '11' or part == '7':
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['b'], n, ymlVideoTitleDict[video]))
            elif part == '15':
                csvFile.write('{},{}\n{},"{}"\n'.format(
                    n, av2bv[video]['a'], n, ymlVideoTitleDict[video]))


if __name__ == "__main__":
    main()
