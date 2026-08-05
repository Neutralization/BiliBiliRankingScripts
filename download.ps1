param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = $null
)
$ProgressPreference = 'Continue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "${TruePath}/ranking/list0"
$FootageFolder = "${TruePath}/ranking/list1"
$CookieFile = "${TruePath}/bilibili.com_cookies.txt"
$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
$CookieHeader = ''
$WbiMixinKey = ''
$TaskIndex = 0
$TaskCount = 0

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Session.UserAgent = $UserAgent
if (Test-Path $CookieFile) {
    $Cookies = Get-Content -Path $CookieFile
    $CookiePairs = @()
    $Cookies | ForEach-Object {
        $Line = $_
        if ($Line.StartsWith('#HttpOnly_')) {
            $Line = $Line.Substring('#HttpOnly_'.Length)
        }
        if (!$Line.StartsWith('#') -and ($Line -match '(^|\t)\.?bilibili\.com\t')) {
            $Cookie = $Line.Split("`t")
            if ($Cookie.Count -lt 7) {
                return
            }
            $Name = $Cookie[5]
            $Value = $Cookie[6]
            $Path = $Cookie[2]
            $Domain = $Cookie[0]
            $Session.Cookies.Add((New-Object System.Net.Cookie($Name, $Value, $Path, $Domain)))
            $CookiePairs += "${Name}=${Value}"
        }
    }
    $CookieHeader = $CookiePairs -join '; '
}
$Headers = @{
    'User-Agent' = $UserAgent
}
if ($CookieHeader) {
    $Headers.Cookie = $CookieHeader
}

function Get-MD5Hash {
    param (
        [string]$Text
    )

    $md5 = [System.Security.Cryptography.MD5]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return (($md5.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '')
    } finally {
        $md5.Dispose()
    }
}

function Get-WbiImageKeyPart {
    param (
        [string]$Url
    )

    $fileName = ($Url -split '[/?#]') | Where-Object { $_ } | Select-Object -Last 1
    return [System.IO.Path]::GetFileNameWithoutExtension($fileName)
}

function Get-MixinKey {
    param (
        [string]$Origin
    )

    $mixinKeyEncTab = @(
        46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
        27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13
    )
    $chars = $Origin.ToCharArray()
    return -join ($mixinKeyEncTab | ForEach-Object { $chars[$_] })
}

function ConvertTo-QueryValue {
    param (
        [object]$Value
    )

    $text = [string]$Value
    $text = $text -replace "[!'()*]", ''
    return [System.Uri]::EscapeDataString($text)
}

function New-WbiQuery {
    param (
        [hashtable]$Params,
        [string]$MixinKey
    )

    $Params.wts = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $query = (($Params.Keys | Sort-Object | ForEach-Object {
                "$_=$(ConvertTo-QueryValue $Params[$_])"
            }) -join '&')
    $wRid = Get-MD5Hash "${query}${MixinKey}"
    return "${query}&w_rid=${wRid}"
}

function New-WbiPlayUrl {
    param (
        [string]$AID,
        [string]$BID,
        [string]$CID,
        [string]$MixinKey
    )

    $query = New-WbiQuery @{
        support_multi_audio = 'true'
        from_client         = 'BROWSER'
        avid                = $AID
        bvid                = $BID
        cid                 = $CID
        qn                  = '120'
        fnver               = '0'
        fnval               = '4048'
        fourk               = '1'
        otype               = 'json'
    } $MixinKey
    return "https://api.bilibili.com/x/player/wbi/playurl?${query}"
}

function Initialize-BiliCredential {
    $navUrl = 'https://api.bilibili.com/x/web-interface/nav'
    $nav = Invoke-WebRequest -UseBasicParsing -Uri $navUrl -WebSession $Session -Headers $Headers |
        Select-Object -ExpandProperty 'Content' |
        ConvertFrom-Json

    if ($true -ne $nav.data.isLogin) {
        throw 'bilibili.com_cookies.txt 已过期或未登录，请重新导出 bilibili.com_cookies.txt。'
    }

    $imgKey = Get-WbiImageKeyPart $nav.data.wbi_img.img_url
    $subKey = Get-WbiImageKeyPart $nav.data.wbi_img.sub_url
    if (!$imgKey -or !$subKey) {
        throw '获取 WBI key 失败，无法签名播放接口。'
    }

    return Get-MixinKey "${imgKey}${subKey}"
}

function Write-RunLog {
    param (
        [string]$Message,
        [string]$Color = 'Gray'
    )

    $taskProgress = "[ $script:TaskIndex / $script:TaskCount ]"
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - ${taskProgress} ${Message}" -ForegroundColor $Color
}

function Format-ByteSize {
    param (
        [long]$Bytes
    )

    if ($Bytes -ge 1GB) { return ('{0:N1} GB' -f ($Bytes / 1GB)) }
    if ($Bytes -ge 1MB) { return ('{0:N1} MB' -f ($Bytes / 1MB)) }
    if ($Bytes -ge 1KB) { return ('{0:N1} KB' -f ($Bytes / 1KB)) }
    return "${Bytes} B"
}

function Get-RemoteContentLength {
    param (
        [string]$Url,
        [string]$Referer
    )

    $requestHeaders = @{
        'User-Agent' = $UserAgent
        'Referer'    = $Referer
    }
    if ($CookieHeader) {
        $requestHeaders.Cookie = $CookieHeader
    }

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Method Head -Uri $Url -Headers $requestHeaders -ErrorAction Stop
        [long]$contentLength = 0
        if ([long]::TryParse($response.Headers['Content-Length'], [ref]$contentLength) -and $contentLength -gt 0) {
            return $contentLength
        }
    } catch {
        # Some video CDNs do not support HEAD requests or omit Content-Length.
    }

    return $null
}

function Invoke-Aria2Download {
    param (
        [string[]]$Aria2cArgs,
        [string]$Url,
        [string]$OutputPath,
        [string]$Activity,
        [string]$Referer
    )

    $totalBytes = Get-RemoteContentLength $Url $Referer
    $job = Start-Job -ScriptBlock {
        param ([string[]]$Arguments)
        & aria2c.exe @Arguments *> $null
        return $LASTEXITCODE
    } -ArgumentList (, $Aria2cArgs)

    try {
        while ($job.State -notin @('Completed', 'Failed', 'Stopped')) {
            [long]$downloadedBytes = if (Test-Path -LiteralPath $OutputPath) { (Get-Item -LiteralPath $OutputPath).Length } else { 0 }
            if ($null -ne $totalBytes) {
                $percent = [Math]::Min(100, [Math]::Floor(($downloadedBytes / $totalBytes) * 100))
                $status = "$(Format-ByteSize $downloadedBytes) / $(Format-ByteSize $totalBytes)"
                Write-Progress -Activity $Activity -Status $status -PercentComplete $percent
            } else {
                Write-Progress -Activity $Activity -Status "$(Format-ByteSize $downloadedBytes)"
            }
            Start-Sleep -Milliseconds 250
            $job = Get-Job -Id $job.Id
        }

        $exitCode = Receive-Job -Job $job -ErrorAction SilentlyContinue | Select-Object -Last 1
        if ($job.State -ne 'Completed' -or $exitCode -ne 0) {
            throw "aria2c download failed with exit code ${exitCode}"
        }
    } finally {
        Write-Progress -Activity $Activity -Completed
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
}

function ConvertTo-AID {
    param (
        [string]$Source,
        [bool]$Reverse = $false
    )
    # https://github.com/Colerar/abv
    $ALPHABET = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf'.ToCharArray()
    $table = @{}
    0..57 | ForEach-Object { $table[$ALPHABET[$_]] = $_ }

    $XOR_CODE = 23442827791579
    $MASK_CODE = 2251799813685247
    $MAX_AID = [Int64]1 -shl 51
    $BASE = 58
    $BV_LEN = 12

    function bv2av {
        param ([string]$Bvid)
        $bvList = $Bvid.ToCharArray()
        $bvList[3], $bvList[9] = $bvList[9], $bvList[3]
        $bvList[4], $bvList[7] = $bvList[7], $bvList[4]
        $tmp = [int64]0
        foreach ($char in $bvList[3..($BV_LEN - 1)]) {
            $idx = $table[$char]
            $tmp = $tmp * $BASE + $idx
        }
        return ($tmp -band $MASK_CODE) -bxor $XOR_CODE
    }

    function av2bv {
        param ([int64]$Avid)
        $bvList = 'BV1000000000'.ToCharArray()
        $bvIdx = $BV_LEN - 1
        $tmp = ($MAX_AID -bor $Avid) -bxor $XOR_CODE
        while ($tmp -ne 0) {
            $bvList[$bvIdx] = $ALPHABET[$tmp % $BASE]
            $tmp = [Math]::Truncate($tmp / $BASE)
            $bvIdx -= 1
        }
        $bvList[3], $bvList[9] = $bvList[9], $bvList[3]
        $bvList[4], $bvList[7] = $bvList[7], $bvList[4]
        return -join $bvList
    }

    if ($Reverse) { return av2bv $Source } else { return bv2av $Source }
}

function BiliDown {
    param (
        [parameter(position = 1)]$ID,
        [parameter(position = 2)]$Part = 1
    )

    if ($ID -match '^[aA]') {
        $AID = $ID.Substring(2)
        $BID = ConvertTo-AID $AID $true
        $ID = "av${AID}"
    } elseif ($ID -match '^[bB]') {
        $AID = ConvertTo-AID $ID
        $BID = ConvertTo-AID $AID $true
        $ID = $BID
    } else {
        Write-RunLog "${ID} ID 格式无效，跳过" 'Yellow'
        return
    }

    Write-RunLog "${BID} 开始处理" 'Cyan'
    $Headers.referer = "https://www.bilibili.com/video/av${AID}/"

    Write-RunLog "${BID} 获取分 P 信息" 'Gray'
    $pageUrl = "https://api.bilibili.com/x/player/pagelist?aid=${AID}&jsonp=jsonp"
    $Headers.path = "/x/player/pagelist?aid=${AID}&jsonp=jsonp"
    $pages = Invoke-WebRequest -UseBasicParsing -Uri $pageUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $CID = $pages.data | Where-Object -Property 'page' -EQ $Part | Select-Object -ExpandProperty 'cid'
    if ($null -eq $CID) {
        Write-RunLog "${BID} 未找到 P${Part} 的 CID，跳过" 'Red'
        return
    }
    Write-RunLog "${BID} P${Part} CID=${CID}" 'Gray'

    Write-RunLog "${BID} 获取字幕信息" 'Gray'
    $ccUrl = "https://api.bilibili.com/x/player/wbi/v2?aid=${AID}&cid=${CID}&isGaiaAvoided=false"
    $ccData = Invoke-WebRequest -UseBasicParsing -Uri $ccUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $subtitle = $ccData.data.subtitle.subtitles[0]
    if ($null -ne $subtitle.subtitle_url -and $subtitle.lan -notmatch 'ai-') {
        Invoke-WebRequest -Uri "http:$($subtitle.subtitle_url)" -WebSession $Session -Headers $Headers -OutFile "${FootageFolder}/${ID}.json"
        Write-RunLog "${BID} 字幕已保存" 'Gray'
    } else {
        Write-RunLog "${BID} 无可下载字幕" 'DarkGray'
    }

    Write-RunLog "${BID} 解析播放地址" 'Gray'
    $sourceUrl = "https://api.bilibili.com/pgc/player/web/v2/playurl?avid=${AID}&bvid=${BID}&cid=${CID}&qn=120&fnver=0&fnval=4048&fourk=1"
    $pgcTest = Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $sourceUrl = if (-404 -eq $pgcTest.code) { New-WbiPlayUrl $AID $BID $CID $WbiMixinKey } else { $sourceUrl }
    $Headers.path = $sourceUrl.Substring('https://api.bilibili.com'.Length)
    $videoInfo = Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $videoData = if (-404 -eq $pgcTest.code) { $videoInfo.data } else { $videoInfo.result.video_info }
    if ($null -eq $videoData) {
        Write-RunLog "${BID} 解析失败，跳过" 'Red'
        return
    }

    # 充电专属视频 / 非 DASH 视频
    if ($null -ne $videoData.durl) {
        $singleMp4 = $videoData.durl | Where-Object -Property 'order' -EQ 1 | Select-Object -ExpandProperty 'url'
        try {
            Write-RunLog "${BID} 下载单文件 MP4" 'Cyan'
            $aria2cArgs = @(
                '--conf-path=aria2.conf',
                "${singleMp4}",
                "--header=User-Agent: ${UserAgent}",
                "--header=Referer: $($Headers.referer)",
                "--header=Cookie: ${CookieHeader}",
                "--dir=${DownloadFolder}",
                '--out', "${ID}.mp4"
            )
            Invoke-Aria2Download $aria2cArgs $singleMp4 "${DownloadFolder}/${ID}.mp4" "Download MP4: ${BID}" $Headers.referer
            Write-RunLog "${BID} 下载完成" 'Green'
        } catch {
            Write-RunLog "${BID} 出现错误：$($_.Exception.Message)" 'Red'
            New-Item -Path "${DownloadFolder}" -Name "${BID}.txt" -ItemType 'file' -Value '' -Force | Out-Null
        }
        return
    }

    $audioId = $videoData.dash.audio.id | Measure-Object -Maximum | Select-Object -ExpandProperty 'Maximum'
    $audioDash = $videoData.dash.audio | Where-Object -Property 'id' -EQ $audioId | Select-Object -ExpandProperty 'baseUrl'
    $videoId = $videoData.dash.video.id | Measure-Object -Maximum | Select-Object -ExpandProperty 'Maximum'
    $videoP60 = $videoData.accept_description.IndexOf('高清 1080P60')
    $videoPhigh = $videoData.accept_description.IndexOf('高清 1080P+')
    $videoP = $videoData.accept_description.IndexOf('高清 1080P')
    $videoAq = $videoData.accept_quality
    $videoId = if ($videoP60 -ge 0) { $videoAq[$videoP60] } elseif ($videoPhigh -ge 0) { $videoAq[$videoPhigh] } elseif ($videoP -ge 0) { $videoAq[$videoP] } else { $videoId }
    $videoDash = $videoData.dash.video | Where-Object -Property 'id' -EQ $videoId | Where-Object -Property 'codecs' -Match 'avc' | Select-Object -ExpandProperty 'baseUrl'

    try {
        Write-RunLog "${BID} 下载音频流" 'Cyan'
        $aria2cArgs = @(
            '--conf-path=aria2.conf',
            "${audioDash}",
            "--header=User-Agent: ${UserAgent}",
            "--header=Referer: $($Headers.referer)",
            "--header=Cookie: ${CookieHeader}",
            "--dir=${DownloadFolder}", '--out', "${ID}_a.m4s"
        )
        Invoke-Aria2Download $aria2cArgs $audioDash "${DownloadFolder}/${ID}_a.m4s" "Download audio: ${BID}" $Headers.referer

        Write-RunLog "${BID} 下载视频流" 'Cyan'
        $aria2cArgs = @(
            '--conf-path=aria2.conf',
            "${videoDash}",
            "--header=User-Agent: ${UserAgent}",
            "--header=Referer: $($Headers.referer)",
            "--header=Cookie: ${CookieHeader}",
            "--dir=${DownloadFolder}", '--out', "${ID}_v.m4s"
        )
        Invoke-Aria2Download $aria2cArgs $videoDash "${DownloadFolder}/${ID}_v.m4s" "Download video: ${BID}" $Headers.referer

        Write-RunLog "${BID} 合并音视频" 'Cyan'
        $ffmpegArgs = @(
            '-y', '-hide_banner', '-loglevel', 'error',
            '-i', "${DownloadFolder}/${ID}_a.m4s",
            '-i', "${DownloadFolder}/${ID}_v.m4s",
            '-c', 'copy',
            "${DownloadFolder}/${ID}.mp4"
        )
        & ffmpeg.exe @ffmpegArgs
        if ($LASTEXITCODE -ne 0) { throw "ffmpeg 合并失败，退出码 ${LASTEXITCODE}" }
        Write-RunLog "${BID} 下载完成" 'Green'
    } catch {
        Write-RunLog "${BID} 出现错误：$($_.Exception.Message)" 'Red'
        New-Item -Path "${DownloadFolder}" -Name "${BID}.txt" -ItemType 'file' -Value '' -Force | Out-Null
    }
}

function Main {
    Import-Module powershell-yaml
    $script:WbiMixinKey = Initialize-BiliCredential
    $Files = @()
    $LocalVideos = @()
    $LostVideos = @()
    $RankVideos = @()

    if ($null -eq $Part) {
        Get-ChildItem "${DownloadFolder}/*.mp4" | ForEach-Object { $LocalVideos += $_.BaseName }
    }
    $Part = if ($null -ne $Part) { $Part } else { @('*') }
    foreach ($p in $Part) {
        $Files += Get-Content -Raw "${FootageFolder}/${RankNum}_${p}.yml"
    }
    foreach ($content in $Files) {
        $items = (ConvertFrom-Yaml $content) | ForEach-Object { $_ } | ForEach-Object { $_.':name' }
        $RankVideos += $items
    }
    (Get-Content "${TruePath}/LostFile.json" | ConvertFrom-Json).psobject.Properties.Name | ForEach-Object {
        $LostVideos += $_
    }
    $TaskQueue = $RankVideos | Where-Object { $LocalVideos -notcontains $_ } | Where-Object { $LostVideos -notcontains $_ }
    $OldVideos = $LocalVideos | Where-Object { $RankVideos -notcontains $_ }

    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "${DownloadFolder}/${_}.mp4"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    Get-ChildItem "${DownloadFolder}/*" -Exclude *.mp4, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "${_}"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }

    $script:TaskCount = @($TaskQueue).Count
    Write-RunLog "共 ${TaskCount} 个待下载任务，开始串行下载" 'Cyan'
    foreach ($Task in $TaskQueue) {
        $script:TaskIndex += 1
        BiliDown $Task
    }
    Write-RunLog '任务队列处理完成，清理临时 m4s 文件' 'Gray'
    Get-ChildItem "${DownloadFolder}/*" -Include *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "${_}"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
}

Main
