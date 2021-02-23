# BiliBiliRankingScripts
涉及周刊哔哩哔哩排行榜制作相关的脚本

## Requirements
- [Adobe After Effects](https://www.adobe.com/products/aftereffects.html) Tested with CC2019(v16.1.3) & CC2020(v17.7.0)
- [Adobe Media Encoder](https://www.adobe.com/products/media-encoder.html) Tested with CC2019(v13.1.5) & CC2020(v14.9.0)
- [FFMPEG](https://ffmpeg.org/) Using v4.3.2-2021-02-02
	> Add `ffmpeg.exe` into `$PATH`
- [PowerShell](https://github.com/PowerShell/PowerShell) Using v7.1.2
	> [powershell-yaml](https://github.com/cloudbase/powershell-yaml)  
	> Install-Module powershell-yaml

## GetReady
- For Chrome
1. Install [Get cookies.txt](https://chrome.google.com/webstore/detail/get-cookiestxt/bgaddhkoddajcdgocldbbfleckgcbcid)
2. Login BiliBili and get cookies
3. Place `bilibili.com_cookies.txt` in working directory

- For Firefox
1. Install [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2. Login BiliBili and get cookies
3. Rename `cookies.txt` to `bilibili.com_cookies.txt` and place in working directory

## WorkFlow
1. Get yaml files ready, which contains video rank and index number
2. Get image files ready, like free talk and staff list
3. Run `download.ps1` to download all related videos
4. Select video range, modify the offset value in yaml file
5. Run `normalize.ps1` to cut videos and normalize the audio volume
6. Start After Effects, run `autobilibilirank.jsx` generate the last rank video
7. Run `rankdoor.py` to generate stickie comment

## Todo
- [ ] Rewrite `rankdoor.ps1` with PowerShell
- [ ] Artificial Idiot video range select
