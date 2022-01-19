# BiliBiliRankingScripts

涉及周刊哔哩哔哩排行榜制作相关的脚本

## 工作环境

-   [Adobe After Effects](https://www.adobe.com/products/aftereffects.html)  
    Windows 支持 CS6/CC2014/2016/2019/2020/2021/2022 （已测试）  
    macOS 支持 CC2021 （已测试）
-   [Adobe Media Encoder](https://www.adobe.com/products/media-encoder.html)
-   [aria2c](https://aria2.github.io/)
-   [FFmpeg](https://ffmpeg.org/)
-   [chromedriver](https://chromedriver.chromium.org/)
    > Windows 使用 [scoop](https://scoop.sh/) 执行  
    > scoop install aria2 ffmpeg chromedriver  
    > macOS 使用 [brew](https://brew.sh/) 执行  
    > brew install aria2 ffmpeg chromedriver  
    > 其他方式需添加 `aria2c` `ffmpeg` `chromedriver` 路径到系统 `$PATH` 变量
-   [PowerShell](https://docs.microsoft.com/zh-cn/powershell/) 使用 v7.2.0
    > 安装 [powershell-yaml](https://www.powershellgallery.com/packages/powershell-yaml) 模块  
    > Install-Module -Name powershell-yaml
-   [Python](https://www.python.org/) 使用 v3.9.8
    > 安装 [arrow](https://pypi.org/project/arrow/) / [emoji](https://pypi.org/project/emoji/) / [Pillow](https://pypi.org/project/Pillow/) / [PyYAML](https://pypi.org/project/PyYAML/) / [requests](https://pypi.org/project/requests/) / [selenium](https://pypi.org/project/selenium/) 模块  
    > python -m pip install arrow emoji pillow pyyaml requests selenium  
    > 或者 python -m pip install -r requirements.txt

## 准备工作

-   For Chrome

1. 安装插件 [EditThisCookie](https://chrome.google.com/webstore/detail/fngmhnnpilhplaeedifhccceomclgfbg)
2. 工具栏菜单单击 `EditThisCookie`，点击 `Options` 扳手图标
3. 在 `Choose the preferred export format for cookies` 下拉菜单中选择 `Netscape HTTP Cookie File`
4. 登录哔哩哔哩，工具栏菜单单击 `EditThisCookie`，点击 `Export Cookies`
5. 在脚本工作目录下新建 `bilibili.com_cookies.txt` 并打开，粘贴复制的 Cookie 内容，保存文件

-   For Firefox

1. 安装插件 [Export Cookies](https://addons.mozilla.org/en-US/firefox/addon/export-cookies-txt/)
2. 登录哔哩哔哩，工具栏菜单单击 `Export cookies`，选择 `all domains`
3. 将导出的 `cookies.txt` 重命名为 `bilibili.com_cookies.txt` 放在脚本工作目录下

-   For Microsoft Edge

1. 安装插件 [Cookie Editor](https://microsoftedge.microsoft.com/addons/detail/ajfboaconbpkglpfanbmlfgojgndmhmc)
2. 工具栏菜单单击 `Cookie Editor`，点击 `Options` 扳手图标
3. 在 `Choose the preferred export format for cookies` 下拉菜单中选择 `Netscape HTTP Cookie File`
4. 登录哔哩哔哩，工具栏菜单单击 `Cookie Editor`，点击 `Export` 扳手图标
5. 在脚本工作目录下新建 `bilibili.com_cookies.txt` 并打开，粘贴复制的 Cookie 内容，保存文件

## 流程简述

1. 由神秘的 bilibiliran 提供周刊所需数据的 json 格式文件
2. 制作排行版需要的相关图片，包括 STAFF 列表，开头结尾的 Free Talk，ED 使用的 BGM 信息，以及人工指定的 Pickup 栏目等
3. 执行 `movefile.ps1` 快速移动文件至工作目录（可选）
4. 执行 `genyaml.py` 生成周刊各部分的 yaml 文件
5. 执行 `original_title.py` 更新 json 中的视频标题
6. 执行 `generate.py` 生成周榜中使用到的所有图片素材
7. 执行 `pickup.py` 生成 Pickup 视频的图片素材
8. 执行 `download.ps1` 下载周榜中使用到的所有视频素材
9. 选取周榜中所展示的视频片段，在 yaml 文件中记录片段起始时间
10. 执行 `normalize.ps1` 裁剪视频，并标准化音频音量
11. 启动 After Effects, 执行脚本 `autobilibilirank.jsx` 自动导入素材生成周刊工程文件并渲染
12. ~~执行 `rankdoor.ps1` 生成评论区传送门~~
13. 执行 `timestamp.py` 生成播放器分段章节

## Todo

-   [x] ~~使用 PowerShell 重写 `rankdoor.py` 功能~~
-   [x] 自动生成 1080P 视频的图片素材
-   [x] 正确渲染稿件标题中的 emoji 字符
-   [x] Adobe AfterEffects 版本兼容性测试
-   [ ] 正确渲染稿件标题中的 Unicode 字符
-   [ ] ~~视频渲染完成后自动投稿~~
-   [ ] ~~调整 Artificial Idiot 算法自动化视频选段步骤~~

## 学习资料

-   [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
-   [After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/)
-   [After Effects Plugin Match Names List](https://fendrafx.com/utility/after-effects-plugin-match-names-list/)
-   [PowerShell | Microsoft Docs](https://docs.microsoft.com/en-us/powershell/scripting/overview)
-   [Python 3.9 documentation](https://docs.python.org/3.9/)
-   [Chromium WebdriverIO documentation](https://webdriver.io/docs/api/chromium/)
