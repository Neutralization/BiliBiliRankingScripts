param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = @('*')
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "$($TruePath)/ranking/list0"
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
        exit
    }
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 获取 av$($AID) / $($BID)" -ForegroundColor Green
    $PageList = "https://api.bilibili.com/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - API $($PageList)"
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = "/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $Pages = Invoke-WebRequest -UseBasicParsing -Uri $PageList -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    Write-Debug $Pages.data[0]
    $CID = $Pages.data | Where-Object -Property 'page' -EQ $Part | Select-Object -ExpandProperty 'cid'
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 获取 CID $($CID)"
    
    $CCsub = "https://api.bilibili.com/x/player/wbi/v2?aid=$($AID)&cid=$($CID)&isGaiaAvoided=false"
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - API $($CCsub)"
    $SubData = Invoke-WebRequest -UseBasicParsing -Uri $CCsub -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    if ($null -ne $SubData.data.subtitle.subtitles[0].subtitle_url -and $SubData.data.subtitle.subtitles[0].lan -notmatch 'ai-') {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 存在 CC 字幕" -ForegroundColor Green
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - Subtitle http:$($SubData.data.subtitle.subtitles[0].subtitle_url)"
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 下载 CC 字幕 $($ID).json" -ForegroundColor Green
        Invoke-WebRequest -Uri "http:$($SubData.data.subtitle.subtitles[0].subtitle_url)" -WebSession $Session -Headers $Headers -OutFile "$($DownloadFolder)/../list1/$ID.json"
    }
    $PGCTest = Invoke-WebRequest -Uri "https://api.bilibili.com/pgc/player/web/v2/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1" -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    if (-404 -eq $PGCTest.code) {
        $SourceUrl = "https://api.bilibili.com/x/player/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1"
    } else {
        $SourceUrl = "https://api.bilibili.com/pgc/player/web/v2/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1"
    }
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - API $($SourceUrl)"
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = $SourceUrl.Substring('https://api.bilibili.com'.Length)
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 解析视频链接" -ForegroundColor Green
    $VideoInfo = Invoke-WebRequest -UseBasicParsing -Uri $SourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty 'Content' | ConvertFrom-Json
    if (-404 -eq $PGCTest.code) {
        $VideoData = $VideoInfo.data
    } else {
        $VideoData = $VideoInfo.result.video_info
    }
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($VideoData)"
    if ($null -eq $VideoData) {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 解析失败，跳过" -ForegroundColor Red
        return
    }
    # 充电专属视频
    if ($null -ne $VideoData.durl) {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 充电专属视频" -ForegroundColor Green
        $VideoMP4 = $VideoData.durl | Where-Object -Property 'order' -EQ 1 | Select-Object -ExpandProperty 'url'
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 试看视频 $($VideoMP4)"
        try {
            $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
                "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($VideoMP4)"" "
                "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($ID).mp4"
            )
            Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - aria2c.exe $($aria2cArgs)"
            Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 开始下载试看视频" -ForegroundColor Green
            Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
        } catch {
            New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType 'file' -Value '' -Force
        }
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 清理临时文件`n" -ForegroundColor Green
        Remove-Item "$($DownloadFolder)/$($CID)_*.*"
        return
    }
    $AudioID = $VideoData.dash.audio.id | Measure-Object -Maximum | Select-Object -ExpandProperty 'Maximum'
    $AudioDASH = $VideoData.dash.audio | Where-Object -Property 'id' -EQ $AudioID | Select-Object -ExpandProperty 'baseUrl'
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 音频流 $($AudioID) $($AudioDASH)"
    $VideoID = $VideoData.dash.video.id | Measure-Object -Maximum | Select-Object -ExpandProperty 'Maximum'
    $Video1080P60 = $VideoData.accept_description.IndexOf('高清 1080P60')
    $Video1080Plus = $VideoData.accept_description.IndexOf('高清 1080P+')
    $Video1080 = $VideoData.accept_description.IndexOf('高清 1080P')
    if ($Video1080P60 -ge 0) {
        $VideoID = $VideoData.accept_quality[$Video1080P60]
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 选择 高清 1080P60"
    } elseif ($Video1080Plus -ge 0) {
        $VideoID = $VideoData.accept_quality[$Video1080Plus]
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 选择 高清 1080P+"
    } elseif ($Video1080 -ge 0) {
        $VideoID = $VideoData.accept_quality[$Video1080]
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 选择 高清 1080P"
    } else {
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 选择最清晰画质"
    }
    $VideoDASH = $VideoData.dash.video | Where-Object -Property 'id' -EQ $VideoID | Where-Object -Property 'codecs' -Match 'avc' | Select-Object -ExpandProperty 'baseUrl'
    Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - 视频流 $($VideoID) $($VideoDASH)"

    try {
        $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
            "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($AudioDASH)"" "
            "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_a.m4s"
        )
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - aria2c.exe $($aria2cArgs)"
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 开始下载音频" -ForegroundColor Green
        Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
        $aria2cArgs = -join @('-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none '
            "--summary-interval=0 --download-result=hide --console-log-level=notice ""$($VideoDASH)"" "
            "--header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_v.m4s"
        )
        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - aria2c.exe $($aria2cArgs)"
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 开始下载视频" -ForegroundColor Green
        Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"

        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 合并音视频" -ForegroundColor Green
        $ffmpegArgs = "-y -hide_banner -i $($DownloadFolder)/$($CID)_a.m4s -i $($DownloadFolder)/$($CID)_v.m4s -c copy $($DownloadFolder)/$($ID).mp4"

        Write-Debug "$(Get-Date -Format 'MM/dd HH:mm:ss') - ffmpeg.exe $($ffmpegArgs)"
        Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $ffmpegArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
    } catch {
        New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType 'file' -Value '' -Force
    }
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - 清理临时文件`n" -ForegroundColor Green
    Remove-Item "$($DownloadFolder)/$($CID)_*.*"
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $RankVideos = @()
    $ExistVideos = @()
    $LostVideos = @()
    if ($Part.Contains('*')) {
        $Files = Get-Content -Raw "$($DownloadFolder)/../list1/$($RankNum)_*.yml"
        Get-ChildItem "$($DownloadFolder)/*.mp4" | ForEach-Object { $ExistVideos += $_.BaseName }
    } else {
        $Part | ForEach-Object {
            $Files += Get-Content -Raw "$($DownloadFolder)/../list1/$($RankNum)_$($_).yml"
        }
    }
    $Files | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += $_.':name'
            }
        }
    }
    (Get-Content "$($TruePath)/LostFile.json" | ConvertFrom-Json).psobject.Properties.Name | ForEach-Object {
        $LostVideos += $_
    }
    $NeedVideos = $RankVideos | Where-Object { $ExistVideos -notcontains $_ }
    $NeedVideos = $NeedVideos | Where-Object { $LostVideos -notcontains $_ }
    $OldVideos = $ExistVideos | Where-Object { $RankVideos -notcontains $_ }

    $RankVideos | Where-Object { $ExistVideos -contains $_ } | ForEach-Object {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($_) 已存在，跳过下载" -ForegroundColor Green
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "$($DownloadFolder)/$($_).mp4"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    Get-ChildItem "$($DownloadFolder)/*" -Exclude *.mp4, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    $NeedVideos | ForEach-Object {
        BiliDown $_ # -Debug
    }
}

Main
