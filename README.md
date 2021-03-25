# BiliBiliRankingScripts

涉及周刊哔哩哔哩排行榜制作相关的脚本

## Requirements

-   [Adobe After Effects](https://www.adobe.com/products/aftereffects.html) 使用 CC2019(v16.1.3) 或 CC2020(v17.7.0)
-   [Adobe Media Encoder](https://www.adobe.com/products/media-encoder.html) 使用 CC2019(v13.1.5) 或 CC2020(v14.9.0)
-   [FFMPEG](https://ffmpeg.org/) 使用 v4.3.2-2021-02-02
    > 添加 `ffmpeg.exe` 路径到系统 `$PATH` 变量
-   [PowerShell](https://github.com/PowerShell/PowerShell) 使用 v7.1.2
    > 安装 [powershell-yaml](https://github.com/cloudbase/powershell-yaml) 模块  
    > Install-Module powershell-yaml

## GetReady

-   For Chrome

1. 安装插件 [Get cookies.txt](https://chrome.google.com/webstore/detail/get-cookiestxt/bgaddhkoddajcdgocldbbfleckgcbcid)
2. 登录哔哩哔哩，页面右键菜单选择 `Get cookies.txt`
3. 将导出的 `bilibili.com_cookies.txt` 放在脚本工作目录下

-   For Firefox

1. 安装插件 [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt)
2. 登录哔哩哔哩，工具栏菜单单击 `Export cookies`，选择 `Current Site`
3. 将导出的 `cookies.txt` 重命名为 `bilibili.com_cookies.txt` 放在脚本工作目录下

-   For Microsoft Edge

1. 安装插件 [Cookie Editor](https://microsoftedge.microsoft.com/addons/detail/cookie-editor/ajfboaconbpkglpfanbmlfgojgndmhmc)
2. 工具栏菜单单击 `Cookie Editor`，点击 `Options` 扳手图标
3. 在 `Choose the preferred export format for cookies` 下拉菜单中选择 `Netscape HTTP Cookie File`
4. 登录哔哩哔哩，工具栏菜单单击 `Cookie Editor`，点击 `Export` 扳手图标
5. 在脚本工作目录下新建 `bilibili.com_cookies.txt` 并打开，粘贴复制的 Cookie 内容，保存文件

## WorkFlow

1. 由神秘的 bilibiliran 提供周刊所需数据的 yaml 格式文件
2. 制作排行版需要的相关图片，包括 STAFF 列表，开头结尾的 Free Talk，ED 使用的 BGM 信息，以及人工指定的 Pickup 栏目等
3. 执行 `download.ps1` 下载周榜中使用到的所有视频原素材
4. 选取周榜中所展示的视频片段，记录片段起始时间
5. 执行 `normalize.ps1` 裁剪视频，并标准化音频音量
6. 启动 After Effects, 执行脚本 `autobilibilirank.jsx` 自动导入素材生成周刊工程文件并渲染
7. 执行 `rankdoor.ps1` 生成评论区传送门

## Todo

-   [x] 使用 PowerShell 重写 `rankdoor.py` 功能
-   [ ] 调整 Artificial Idiot 算法自动化视频选段步骤
-   [ ] 视频渲染完成后自动投稿
