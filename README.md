# BiliBiliRankingScripts

涉及周刊哔哩哔哩排行榜制作相关的脚本

## 工作环境 (Windows 10/11)

- [Adobe After Effects](https://www.adobe.com/products/aftereffects.html)
    > 需要在 AE 首选项中打开`允许脚本写入文件和访问网络`  
- [Adobe Media Encoder](https://www.adobe.com/products/media-encoder.html) / [Voukoder](https://www.voukoder.org/forum/thread/783-downloads-instructions/)
- [aria2c](https://aria2.github.io/) / [FFmpeg](https://ffmpeg.org/)
    > [winget](https://github.com/microsoft/winget-cli) install aria2.aria2 Gyan.FFmpeg  
- [PowerShell](https://docs.microsoft.com/zh-cn/powershell/)
    > Install-Module -Name powershell-yaml  
- [Python](https://www.python.org/)
    > uv sync  

- [json2.js](https://github.com/douglascrockford/JSON-js)

## 获取 Cookie

注意使用 `Netscape HTTP Cookie File` 格式保存为 `cookies.txt`

- Chrome 安装 [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
- Edge 安装 [Export Cookies File](https://microsoftedge.microsoft.com/addons/detail/export-cookies-file/hbglikhfdcfhdfikmocdflffaecbnedo)
- Firefox 安装 [Export Cookies](https://addons.mozilla.org/en-US/firefox/addon/export-cookies-txt/)

## 流程简述

### 周刊

-  由神秘的 bilibiliran 提供周刊所需的数据文件
-  执行 `makeyaml.ps1` 更新标题与封面，生成各分段的 yml 文件
-  执行 `generate.py` 生成周榜中使用到的所有图片素材
-  执行 `download.ps1` 下载周榜中使用到的所有视频素材
-  选取周榜中所展示的视频片段，在 yml 文件中记录素材片段起始时间
-  手动制作 STAFF 列表，开头结尾的 Free Talk，周记等
-  执行 `movefile.ps1` 快速移动文件至工作目录（可选）
-  执行 `normalize.ps1` 裁剪视频，同时标准化音频音量
-  启动 After Effects, 执行脚本 `autobilibilirank.jsx` 自动导入素材生成周刊工程文件
-  执行 `favorite.ps1` 提交播放器分段章节，添加视频到收藏夹

### 历史榜

-  手动汇总往期一位，生成 `ranking/history${HistoryNum}/${HistoryNum}.yml`
-  执行 `history100.py` 生成历史榜使用到的所有图片素材
-  执行 `download.ps1` 下载历史榜中使用到的所有视频素材
-  选取历史榜中所展示的视频片段，在 yml 文件中记录素材片段起始时间
-  执行 `normalize.ps1` 裁剪视频，同时标准化音频音量
-  启动 After Effects, 执行脚本 `history100.jsx` 自动导入素材生成历史榜工程文件
