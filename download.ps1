param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = $null
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "$($TruePath)/ranking/list0"
$FootageFolder = "$($TruePath)/ranking/list1"
$CookieFile = "$($TruePath)/bilibili.com_cookies.txt"
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
        $ID = "av$($AID)"
    } elseif ($ID -match '^[bB]') {
        $AID = ConvertTo-AID $ID
        $BID = ConvertTo-AID $AID $true
        $ID = $BID
    } else {
        return
    }
    $pageUrl = "https://api.bilibili.com/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = "/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $pages = Invoke-WebRequest -UseBasicParsing -Uri $pageUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $CID = $pages.data | Where-Object -Property 'page' -EQ $Part | Select-Object -ExpandProperty 'cid'
    
    $ccUrl = "https://api.bilibili.com/x/player/wbi/v2?aid=$($AID)&cid=$($CID)&isGaiaAvoided=false"
    $ccData = Invoke-WebRequest -UseBasicParsing -Uri $ccUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $subtitle = $ccData.data.subtitle.subtitles[0]
    if ($null -ne $subtitle.subtitle_url -and $subtitle.lan -notmatch 'ai-') {
        Invoke-WebRequest -Uri "http:$($subtitle.subtitle_url)" -WebSession $Session -Headers $Headers -OutFile "$($FootageFolder)/$ID.json"
    }

    $sourceUrl = "https://api.bilibili.com/pgc/player/web/v2/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1"
    $pgcTest = Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $sourceUrl = if (-404 -eq $pgcTest.code) { "https://api.bilibili.com/x/player/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1" } else { $sourceUrl }
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = $sourceUrl.Substring('https://api.bilibili.com'.Length)
    $videoInfo = Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    $videoData = if (-404 -eq $pgcTest.code) { $videoInfo.data } else { $videoInfo.result.video_info }
    if ($null -eq $videoData) {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 解析失败，跳过" -ForegroundColor Red
        return
    }

    # 充电专属视频 / 非 DASH 视频
    if ($null -ne $videoData.durl) {
        $singleMp4 = $videoData.durl | Where-Object -Property 'order' -EQ 1 | Select-Object -ExpandProperty 'url'
        try {
            $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
                "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($singleMp4)"" "
                "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($ID).mp4"
            )
            Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - aria2c.exe $($aria2cArgs)"
            Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 开始下载试看视频" -ForegroundColor Green
            Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($ID)_.log"
        } catch {
            New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType 'file' -Value '' -Force
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
        $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
            "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($audioDash)"" "
            "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($ID)_a.m4s"
        )
        Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($ID)_.log"
        $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
            "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($videoDash)"" "
            "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($ID)_v.m4s"
        )
        Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($ID)_.log"

        $ffmpegArgs = "-y -hide_banner -i $($DownloadFolder)/$($ID)_a.m4s -i $($DownloadFolder)/$($ID)_v.m4s -c copy $($DownloadFolder)/$($ID).mp4"

        Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $ffmpegArgs -RedirectStandardError "$($DownloadFolder)/$($ID)_.log"
    } catch {
        New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType 'file' -Value '' -Force
    }
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $LocalVideos = @()
    $LostVideos = @()
    $RankVideos = @()

    if ($null -eq $Part) {
        Get-ChildItem "$($DownloadFolder)/*.mp4" | ForEach-Object { $LocalVideos += $_.BaseName }
    }
    $Part = if ($null -ne $Part) { $Part } else { @('*') }
    foreach ($p in $Part) {
        $Files += Get-Content -Raw "$($FootageFolder)/$($RankNum)_$($p).yml"
    }
    foreach ($content in $Files) {
        $items = (ConvertFrom-Yaml $content) | ForEach-Object { $_ } | ForEach-Object { $_.':name' }
        $RankVideos += $items
    }
    (Get-Content "$($TruePath)/LostFile.json" | ConvertFrom-Json).psobject.Properties.Name | ForEach-Object {
        $LostVideos += $_
    }
    $TaskQueue = $RankVideos | Where-Object { $LocalVideos -notcontains $_ } | Where-Object { $LostVideos -notcontains $_ }
    $OldVideos = $LocalVideos | Where-Object { $RankVideos -notcontains $_ }

    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "$($DownloadFolder)/$($_).mp4"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    Get-ChildItem "$($DownloadFolder)/*" -Exclude *.mp4, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "$($_)"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }

    $bilidownDef = ${Function:BiliDown}.ToString()
    $converttoaidDef = ${Function:ConvertTo-AID}.ToString()
    $TaskQueue | ForEach-Object -ThrottleLimit 4 -Parallel {
        $Headers = $using:Headers
        $Session = $using:Session
        $UserAgent = $using:UserAgent
        $DownloadFolder = $using:DownloadFolder
        $FootageFolder = $using:FootageFolder
        ${Function:BiliDown} = [ScriptBlock]::Create($using:bilidownDef)
        ${Function:ConvertTo-AID} = [ScriptBlock]::Create($using:converttoaidDef)
        BiliDown $_
    }
    Get-ChildItem "$($DownloadFolder)/*" -Include *.log, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "$($_)"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
}

Main
