param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$Part = @("*")
)
$ProgressPreference = "SilentlyContinue"
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "$($TruePath)/ranking/list0"
$CookieFile = "$($TruePath)/bilibili.com_cookies.txt"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Session.UserAgent = $UserAgent
if (Test-Path $CookieFile) {
    $Cookies = Get-Content -Path $CookieFile
    $Cookies | ForEach-Object {
        if (!$_.StartsWith("#") -and $_.StartsWith(".bilibili.com")) {
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
    "User-Agent" = $UserAgent
}

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
        $r = ($r - $add) -bxor $xor
        if ($r -lt 0) {
            $r += [Math]::Pow(2, 31)
        }
        return $r
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
    } else {
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
        $BID = ABconvert $AID $false
        $ID = "av$($AID)"
    } elseif ($ID -match "^[bB]") {
        $AID = ABconvert $ID $true
        $BID = ABconvert $AID $false
        $ID = $BID
    } else {
        exit
    }
    Write-Host "av$($AID) / $($BID)"
    $PageList = "https://api.bilibili.com/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    # Write-Host $PageList
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = "/x/player/pagelist?aid=$($AID)&jsonp=jsonp"
    $Pages = Invoke-WebRequest -UseBasicParsing -Uri $PageList -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty "Content" | ConvertFrom-Json
    # Write-Host $Pages.data
    $CID = $Pages.data | Where-Object -Property "page" -EQ $Part | Select-Object -ExpandProperty "cid"
    # Write-Host $CID

    $CCsub = "https://api.bilibili.com/x/player/v2?aid=$($AID)&cid=$($CID)"
    $SubData = Invoke-WebRequest -UseBasicParsing -Uri $CCsub -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty "Content" | ConvertFrom-Json
    if ($null -ne $SubData.data.subtitle.subtitles[0].subtitle_url -and $SubData.data.subtitle.subtitles[0].lan -notmatch 'ai') {
        # Write-Host "http:$($SubData.data.subtitle.subtitles[0].subtitle_url)"
        Invoke-WebRequest -Uri "http:$($SubData.data.subtitle.subtitles[0].subtitle_url)" -WebSession $Session -Headers $Headers -OutFile "$($DownloadFolder)/$($CID)_.json"
        Start-Process -NoNewWindow -Wait -FilePath "python.exe" -ArgumentList "ccsub2ass.py $($DownloadFolder)/$($CID)_"
        $CC = $true
        Write-Host "$($ID) Subtitle Downloading......" -ForegroundColor Yellow
    } else {
        $CC = $false
    }

    $SourceUrl = "https://api.bilibili.com/x/player/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1"
    # Write-Host $SourceUrl
    $Headers.referer = "https://www.bilibili.com/video/av$($AID)/"
    $Headers.path = "/x/player/playurl?avid=$($AID)&bvid=$($BID)&cid=$($CID)&qn=120&fnver=0&fnval=4048&fourk=1"
    $VideoData = Invoke-WebRequest -UseBasicParsing -Uri $SourceUrl -WebSession $Session -Headers $Headers | Select-Object -ExpandProperty "Content" | ConvertFrom-Json
    # Write-Host $VideoData.data
    Write-Host "$($ID) Video Downloading......" -ForegroundColor Green

    $AudioID = $VideoData.data.dash.audio.id | Measure-Object -Maximum | Select-Object -ExpandProperty "Maximum"
    $AudioDASH = $VideoData.data.dash.audio | Where-Object -Property "id" -EQ $AudioID | Select-Object -ExpandProperty "baseUrl"
    $VideoID = $VideoData.data.dash.video.id | Measure-Object -Maximum | Select-Object -ExpandProperty "Maximum"
    $Video1080Plus = $VideoData.data.accept_description.IndexOf('高清 1080P+')
    $Video1080 = $VideoData.data.accept_description.IndexOf('高清 1080P')
    if ($Video1080Plus -ge 0) {
        $VideoID = $VideoData.data.accept_quality[$Video1080Plus]
    } elseif ($Video1080 -ge 0) {
        $VideoID = $VideoData.data.accept_quality[$Video1080]
    }
    # Write-Host $VideoID
    $VideoDASH = $VideoData.data.dash.video | Where-Object -Property "id" -EQ $VideoID | Where-Object -Property "codecs" -Match "avc" | Select-Object -ExpandProperty "baseUrl"
    # Write-Host $AudioDASH
    # Write-Host $VideoDASH

    try {
        $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide ""$($AudioDASH)"" --header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_a.m4s"
        # Write-Host $aria2cArgs
        Start-Process -NoNewWindow -Wait -FilePath "aria2c.exe" -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
        $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide ""$($VideoDASH)"" --header=""User-Agent: $($UserAgent)"" --header=""Referer: $($Headers.referer)"" --dir=$($DownloadFolder) --out $($CID)_v.m4s"
        # Write-Host $aria2cArgs
        Start-Process -NoNewWindow -Wait -FilePath "aria2c.exe" -ArgumentList $aria2cArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
    
        if ($CC) {
            Write-Host "$($ID) Merging with subtitle......" -ForegroundColor Yellow
            $ffmpegArgs = "-y -hide_banner -i $($DownloadFolder)/$($CID)_a.m4s -i $($DownloadFolder)/$($CID)_v.m4s -c:a copy -vf subtitles=.$($DownloadFolder.Substring($TruePath.Length))/$($CID)_.ass  $($DownloadFolder)/$($ID).mp4"
        } else {
            Write-Host "$($ID) Merging A/V files......" -ForegroundColor Green
            $ffmpegArgs = "-y -hide_banner -i $($DownloadFolder)/$($CID)_a.m4s -i $($DownloadFolder)/$($CID)_v.m4s -c copy $($DownloadFolder)/$($ID).mp4"
        }
        Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -ArgumentList $ffmpegArgs -RedirectStandardError "$($DownloadFolder)/$($CID)_.log"
    } catch { 
        New-Item -Path "$($DownloadFolder)" -Name "$($BID).txt" -ItemType "file" -Value "" -Force 
    }
    Remove-Item "$($DownloadFolder)/$($CID)_*.*"
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $RankVideos = @()
    $ExistVideos = @()
    $LostVideos = @()
    if ($Part.Contains("*")) {
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
                $RankVideos += $_.":name"
            }
        }
    }
    Get-Content ".\LostFile.json" | ConvertFrom-Json | Select-Object -ExpandProperty name | ForEach-Object {
        $LostVideos += $_
    }
    $NeedVideos = $RankVideos | Where-Object { $ExistVideos -notcontains $_ }
    $NeedVideos = $NeedVideos | Where-Object { $LostVideos -notcontains $_ }
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
        Write-Host "$($_)" -ForegroundColor Yellow
        BiliDown $_
    }
}

Main
