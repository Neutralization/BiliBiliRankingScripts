param (
    [int]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [int]$HistoryNum = [Math]::Floor(
        (((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7) / 100
    ) * 100,
    [array]$Part = $null
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "${TruePath}/footage/videos"
$UseHistory = $PSBoundParameters.ContainsKey('HistoryNum')
$FootageFolder = if ($UseHistory) { "${TruePath}/ranking/history${HistoryNum}" } else { "${TruePath}/ranking/#${RankNum}" }
$CookieFile = "${TruePath}/bilibili.com_cookies.txt"
$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Session.UserAgent = $UserAgent
if (Test-Path $CookieFile) {
    $Cookies = Get-Content -Path $CookieFile
    $Cookies | ForEach-Object {
        if (!$_.StartsWith('#') -and $_.StartsWith('.bilibili.com')) {
            $Cookie = $_.Split("`t")
            $Name = $Cookie[5]
            $Value = $Cookie[6]
            $Path = $Cookie[2]
            $Domain = $Cookie[0]
            $Session.Cookies.Add((New-Object System.Net.Cookie($Name, $Value, $Path, $Domain)))
        }
    }
}
$Headers = @{
    'User-Agent' = $UserAgent
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
        $bvList[3..($BV_LEN - 1)] | ForEach-Object {
            $idx = $table[$_]
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

function Get-Aria2DefaultArgument {
    return @(
        '--check-certificate=false',
        '--console-log-level=notice',
        '--continue=true',
        '--download-result=hide',
        '--enable-color=false',
        '--file-allocation=none',
        '--max-concurrent-downloads=20',
        '--max-connection-per-server=16',
        '--min-split-size=1M',
        '--split=12',
        '--summary-interval=0'
    )
}

function Get-Aria2cArgument {
    param (
        [string]$SourceUrl,
        [string]$OutputName,
        [string]$DownloadFolder,
        [string]$UserAgent,
        [string]$Referer
    )

    return @(
        Get-Aria2DefaultArgument
        $SourceUrl
        "--header=User-Agent: ${UserAgent}"
        "--header=Referer: ${Referer}"
        "--dir=${DownloadFolder}"
        '--out', $OutputName
    )
}

function Get-YamlFile {
    if ($UseHistory) {
        return @(Get-Content -Raw "${FootageFolder}/${HistoryNum}.yml")
    }

    $Parts = if ($null -ne $Part) { $Part } else { @('*') }
    return @(
        $Parts | ForEach-Object {
            Get-Content -Raw "${FootageFolder}/main/${RankNum}_${_}.yml"
        }
    )
}

function Get-RankVideo {
    param (
        [array]$Files
    )

    return @(
        $Files | ForEach-Object {
            (ConvertFrom-Yaml $_) | ForEach-Object { $_ } | ForEach-Object { $_.':name' }
        }
    )
}

function Get-LocalVideo {
    if ($null -ne $Part) {
        return @()
    }

    return @(Get-ChildItem "${DownloadFolder}/*.mp4" | ForEach-Object { $_.BaseName })
}

function Get-LostVideo {
    return @((Get-Content "${TruePath}/footage/LostFile.json" | ConvertFrom-Json).psobject.Properties.Name)
}

function Clear-OldVideo {
    param (
        [array]$OldVideos
    )

    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "${DownloadFolder}/${_}.mp4"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
}

function Clear-DownloadTempFile {
    Add-Type -AssemblyName Microsoft.VisualBasic
    Get-ChildItem "${DownloadFolder}/*" -Exclude *.mp4 | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "${_}"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
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
        return
    }
    $pagePath = "/x/player/pagelist?aid=${AID}&jsonp=jsonp"
    $Headers.referer = "https://www.bilibili.com/video/av${AID}/"
    $Headers.path = $pagePath
    $pages = Invoke-WebRequest -UseBasicParsing -Uri "https://api.bilibili.com${pagePath}" -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $CID = $pages.data | Where-Object -Property 'page' -EQ $Part | Select-Object -ExpandProperty 'cid'

    $ccData = Invoke-WebRequest -UseBasicParsing -Uri "https://api.bilibili.com/x/player/wbi/v2?aid=${AID}&cid=${CID}&isGaiaAvoided=false" -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $subtitle = $ccData.data.subtitle.subtitles[0]
    if ($null -ne $subtitle.subtitle_url -and $subtitle.lan -notmatch 'ai-') {
        Invoke-WebRequest -Uri "http:$($subtitle.subtitle_url)" -WebSession $Session -Headers $Headers -OutFile "${FootageFolder}/main/${ID}.json"
    }

    $playUrl = "https://api.bilibili.com/pgc/player/web/v2/playurl?avid=${AID}&bvid=${BID}&cid=${CID}&qn=120&fnver=0&fnval=4048&fourk=1"
    $pgcTest = Invoke-WebRequest -UseBasicParsing -Uri $playUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $resolvedUrl = if (-404 -eq $pgcTest.code) { "https://api.bilibili.com/x/player/playurl?avid=${AID}&bvid=${BID}&cid=${CID}&qn=120&fnver=0&fnval=4048&fourk=1" } else { $playUrl }
    $Headers.referer = "https://www.bilibili.com/video/av${AID}/"
    $Headers.path = $resolvedUrl.Substring('https://api.bilibili.com'.Length)
    $videoInfo = Invoke-WebRequest -UseBasicParsing -Uri $resolvedUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $videoData = if (-404 -eq $pgcTest.code) { $videoInfo.data } else { $videoInfo.result.video_info }
    if ($null -eq $videoData) {
        [Console]::Out.WriteLine("$($PSStyle.Foreground.Red)$(Get-Date -Format 'MM/dd HH:mm:ss') - ${ID} 解析失败，跳过$($PSStyle.Reset)")
        return
    }

    # 充电专属视频 / 非 DASH 视频
    if ($null -ne $videoData.durl) {
        $singleMp4 = $videoData.durl | Where-Object -Property 'order' -EQ 1 | Select-Object -ExpandProperty 'url'
        try {
            $aria2cArgs = Get-Aria2cArgument -SourceUrl $singleMp4 -OutputName "${ID}.mp4" -DownloadFolder "${DownloadFolder}" -UserAgent $UserAgent -Referer $Headers.referer
            & aria2c.exe @aria2cArgs 1>> "${DownloadFolder}/${ID}_.log"
        } catch {
            New-Item -Path "${DownloadFolder}" -Name "${ID}.txt" -ItemType 'file' -Value '' -Force
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
        [Console]::Out.WriteLine("$($PSStyle.Foreground.Green)$(Get-Date -Format 'MM/dd HH:mm:ss') - ${ID} 正在下载$($PSStyle.Reset)")
        $aria2cArgs = Get-Aria2cArgument -SourceUrl $audioDash -OutputName "${CID}_a.m4s" -DownloadFolder "${DownloadFolder}" -UserAgent $UserAgent -Referer $Headers.referer
        & aria2c.exe @aria2cArgs 1>> "${DownloadFolder}/${CID}_.log"

        $aria2cArgs = Get-Aria2cArgument -SourceUrl $videoDash -OutputName "${CID}_v.m4s" -DownloadFolder "${DownloadFolder}" -UserAgent $UserAgent -Referer $Headers.referer
        & aria2c.exe @aria2cArgs 1>> "${DownloadFolder}/${CID}_.log"

        $ffmpegArgs = @(
            '-y', '-hide_banner',
            '-i', "${DownloadFolder}/${CID}_a.m4s",
            '-i', "${DownloadFolder}/${CID}_v.m4s",
            '-c', 'copy',
            "${DownloadFolder}/${ID}.mp4"
        )
        & ffmpeg.exe @ffmpegArgs 2>> "${DownloadFolder}/${CID}_.log"
    } catch {
        [Console]::Out.WriteLine("$($PSStyle.Foreground.Red)$(Get-Date -Format 'MM/dd HH:mm:ss') - ${ID} 出现错误$($PSStyle.Reset)")
        New-Item -Path "${DownloadFolder}" -Name "${ID}.txt" -ItemType 'file' -Value '' -Force
    }
}

function Main {
    Import-Module powershell-yaml
    $Files = Get-YamlFile
    $LocalVideos = Get-LocalVideo
    $LostVideos = Get-LostVideo
    $RankVideos = Get-RankVideo $Files

    $TaskQueue = $RankVideos | Where-Object { $LocalVideos -notcontains $_ } | Where-Object { $LostVideos -notcontains $_ }
    $OldVideos = $LocalVideos | Where-Object { $RankVideos -notcontains $_ }
    $RankVideos | Where-Object { $LocalVideos -contains $_ } | ForEach-Object {
        [Console]::Out.WriteLine("$($PSStyle.Foreground.Yellow)$(Get-Date -Format 'MM/dd HH:mm:ss') - ${_} 已存在，跳过下载$($PSStyle.Reset)")
    }
    if ($OldVideos.Length -ne 0) { Clear-OldVideo $OldVideos }
    $TaskQueue | ForEach-Object {
        BiliDown $_
    }
    Clear-DownloadTempFile
}

Main
