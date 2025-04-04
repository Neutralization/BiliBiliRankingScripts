# BiliBiliRankingScripts

涉及周刊哔哩哔哩排行榜制作相关的脚本

## 工作环境 (Windows 10/11)

- [Adobe After Effects](https://www.adobe.com/products/aftereffects.html)
    > 支持版本 CS6/CC/CC2014/CC2015/CC2015.3/CC2017/CC2018/2019/2020/2021/2022/2023/2024/2025  
    需要在 AE 首选项中打开`允许脚本写入文件和访问网络`
- [Adobe Media Encoder](https://www.adobe.com/products/media-encoder.html) / [Voukoder](https://www.voukoder.org/forum/thread/783-downloads-instructions/)
- [aria2c](https://aria2.github.io/) / [FFmpeg](https://ffmpeg.org/) / [ChromeDriver](https://developer.chrome.com/docs/chromedriver/downloads?hl=zh-cn)
    > [winget](https://github.com/microsoft/winget-cli) install aria2.aria2 Gyan.FFmpeg.Shared Chromium.ChromeDriver  
    > 其他方式需添加 `aria2c` `ffmpeg` `chromedriver` 路径到系统 `$PATH` 变量
- [PowerShell](https://docs.microsoft.com/zh-cn/powershell/)
    > 安装 [powershell-yaml](https://www.powershellgallery.com/packages/powershell-yaml) 模块  
    > Install-Module -Name powershell-yaml
- [Python](https://www.python.org/)
    > 安装 [arrow](https://pypi.org/project/arrow/) / [Pillow](https://pypi.org/project/Pillow/) / [PyYAML](https://pypi.org/project/PyYAML/) / [requests](https://pypi.org/project/requests/) / [selenium](https://pypi.org/project/selenium/) 模块  
    > python -m pip install -r requirements.txt
- [json2.js](https://github.com/douglascrockford/JSON-js)

## 获取 Cookie

注意使用 `Netscape HTTP Cookie File` 格式保存为 `cookies.txt`

- Chrome 安装 [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
- Edge 安装 [Export Cookies File](https://microsoftedge.microsoft.com/addons/detail/export-cookies-file/hbglikhfdcfhdfikmocdflffaecbnedo)
- Firefox 安装 [Export Cookies](https://addons.mozilla.org/en-US/firefox/addon/export-cookies-txt/)

## 流程简述

1. 由神秘的 bilibiliran 提供周刊所需数据的 json 格式文件
2. 手动制作 STAFF 列表，开头结尾的 Free Talk，ED 的 BGM 信息，Pickup 栏目等
3. 执行 `movefile.ps1` 快速移动文件至工作目录（可选）
4. 执行 `original_title.py` 更新 json 中的视频标题
5. 执行 `generate.py` 生成周榜中使用到的所有图片素材
6. 执行 `pickup.py` 生成 Pickup 视频的图片素材
7. 执行 `download.ps1` 下载周榜中使用到的所有视频素材
8. 选取周榜中所展示的视频片段，在 yaml 文件中记录素材片段起始时间
9. 执行 `normalize.ps1` 裁剪视频，同时标准化音频音量
10. 启动 After Effects, 执行脚本 `autobilibilirank.jsx` 自动导入素材生成周刊工程文件
11. 执行 `timestamp.py` 提交播放器分段章节
12. 执行 `favorite.ps1` 添加视频到收藏夹

## Todo

- [x] 自动生成 1080P 视频的图片素材
- [x] 正确渲染稿件标题中的 Unicode 字符
- [ ] 取代 Pillow 改用前端作图

## 学习资料

- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/)
- [After Effects Plugin Match Names List](https://fendrafx.com/utility/after-effects-plugin-match-names-list/)
- [PowerShell | Microsoft Docs](https://docs.microsoft.com/en-us/powershell/scripting/overview)
- [Python 3.10 documentation](https://docs.python.org/3.10/)
- [Chromium WebdriverIO documentation](https://webdriver.io/docs/api/chromium/)
