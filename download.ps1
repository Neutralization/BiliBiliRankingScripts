param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$Part = @("*")
)
$ProgressPreference = "SilentlyContinue"
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$CookieFile = "$($TruePath)/bilibili.com_cookies.txt"
# $DownloadList = "$($TruePath)/download.txt"
$DownloadFolder = "$($TruePath)/ranking/list0"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26"

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Session.UserAgent = $UA
$CookieString = ""
if (Test-Path $CookieFile) {
    $Cookies = Get-Content -Path $CookieFile
    $Cookies | ForEach-Object {
        if (!$_.StartsWith("#") -and $_.StartsWith(".bilibili.com")) {
            $Cookie = $_.Split("`t")
            $Name = $Cookie[5]
            $Value = $Cookie[6]
            $Path = $Cookie[2]
            $Domain = $Cookie[0]
            $CookieString += "$($Name)=$($Value); "
            $Session.Cookies.Add((New-Object System.Net.Cookie($Name, $Value, $Path, $Domain)))
        }
    }
}
$Headers = @{
    "authority"  = "api.bilibili.com"
    "method"     = "GET"
    "path"       = ""
    "scheme"     = "https"
    "origin"     = "https://www.bilibili.com"
    "referer"    = ""
    "user-agent" = $UA
}
if ("" -ne $CookieString) { $Headers.cookie = $CookieString }

function ABconvert {
    param (
        [parameter(position = 1)]$Source,
        [parameter(position = 2)]$Target = $true
    )
    # 如何看待 2020 年 3 月 23 日哔哩哔哩将稿件的「av 号」变更为「BV 号」？ - mcfx的回答 - 知乎
    # https://www.zhihu.com/question/381784377/answer/1099438784
    $table = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF".ToCharArray()
    $tr = @{}
    0..57 | ForEach-Object {
        $tr[$table[$_]] = $_
    }
    $s = @(11, 10, 3, 8, 4, 6)
    $xor = 177451812
    $add = 8728348608

    function dec {
        param (
            [string]$x
        )
        $r = 0
        0..5 | ForEach-Object {
            $r += $tr[$x[$s[$_]]] * [Math]::Pow(58, $_)
        }
        return (($r - $add) -bxor $xor)
    }
    function enc {
        param (
            [string]$x
        )
        $x = ($x -bxor $xor) + $add
        $r = "BV1  4 1 7  ".ToCharArray()
        0..5 | ForEach-Object {
            $r[$s[$_]] = $table[[Math]::Floor($x / [Math]::Pow(58, $_)) % 58]
        }
        return -join $r
    }
    if ($Target) {
        return dec $Source
    }
    else {
        return enc $Source
    }
}

function BiliDown {
    param (
        [parameter(position = 1)]$ID,
        [parameter(position = 2)]$Part = 1
    )

    if ($ID -match "^[aA]") {
        $AID = $ID.Substring(2)
        $BID = ABconvert $ID.Substring(2) $false
    }
    elseif ($ID -match "^[bB]") {
        $AID = ABconvert $ID $true
        $BID = $ID
    }
    else {
        exit
    }
    # Write-Output $AID
    # Write-Output $BID

    $PageList = "https://api.bilibili.com/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = "/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $Pages = Invoke-WebRequest -UseBasicParsing -Uri $PageList -WebSession $Session -Headers $Headers |
    Select-Object -ExpandProperty "Content" | ConvertFrom-Json
    $CID = $Pages.data | Where-Object -Property "page" -EQ $Part | Select-Object -ExpandProperty "cid"
    # Write-Output $CID

    $SourceUrl = "https://api.bilibili.com/x/player/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1&voice_balance=1"
    # Write-Output $SourceUrl
    $VideoData = Invoke-WebRequest -UseBasicParsing -Uri $SourceUrl -WebSession $Session -Headers $Headers |
    Select-Object -ExpandProperty "Content" | ConvertFrom-Json
    Write-Host "$($ID) Video Downloading......"

    $AudioID = $VideoData.data.dash.audio.id | Measure-Object -Maximum | Select-Object -ExpandProperty "Maximum"
    $AudioDASH = $VideoData.data.dash.audio | Where-Object -Property "id" -EQ $AudioID |
    Select-Object -ExpandProperty "baseUrl"
    $VideoID = $VideoData.data.dash.video.id | Measure-Object -Maximum | Select-Object -ExpandProperty "Maximum"
    $VideoDASH = $VideoData.data.dash.video | Where-Object -Property "id" -EQ $VideoID |
    Where-Object -Property "codecs" -match "avc" | Select-Object -ExpandProperty "baseUrl"
    # Write-Output $AudioDASH
    # Write-Output $VideoDASH

    try {
        $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide ""$($AudioDASH)"" --header=""$($UA)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_a.m4s"
        Start-Process -NoNewWindow -Wait -FilePath "aria2c.exe" -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"

        $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide ""$($VideoDASH)"" --header=""$($UA)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_v.m4s"
        Start-Process -NoNewWindow -Wait -FilePath "aria2c.exe" -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"

        $ffmpegArgs = "-y -hide_banner -i $($DownloadFolder)/$($CID)_a.m4s -i $($DownloadFolder)/$($CID)_v.m4s -c copy $($DownloadFolder)/$($ID).mp4"
        Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -ArgumentList $ffmpegArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
    }
    catch { New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType "file" -Value "" -Force }
    Remove-Item "$($DownloadFolder)/$($CID)_*.*"
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $RankVideos = @()
    $ExistVideos = @()
    if ($Part.Contains("*")) {
        $Files = Get-Content -Raw "$($DownloadFolder)/../list1/$($RankNum)_*.yml"
        Get-ChildItem "$($DownloadFolder)/*.mp4" | ForEach-Object { $ExistVideos += $_.BaseName }
    }
    else {
        $Part | ForEach-Object {
            $Files += Get-Content -Raw "$($DownloadFolder)/../list1/$($RankNum)_$($_).yml"
        }
    }
    $Files | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += $_.":name"
            }
        }
    }
    
    $NeedVideos = $RankVideos | Where-Object { $ExistVideos -notcontains $_ }
    $OldVideos = $ExistVideos | Where-Object { $RankVideos -notcontains $_ }

    $RankVideos | Where-Object { $ExistVideos -contains $_ } | ForEach-Object {
        Write-Host "$($_) Already Downloaded." -ForegroundColor Yellow
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "$($DownloadFolder)/$($_).mp4"), "OnlyErrorDialogs", "SendToRecycleBin")
    }
    Get-ChildItem "$($DownloadFolder)/*" -Exclude *.mp4, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", "OnlyErrorDialogs", "SendToRecycleBin")
    }
    $NeedVideos | ForEach-Object {
        BiliDown $_
    }
}

Main
