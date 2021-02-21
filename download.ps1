$ProgressPreference = 'SilentlyContinue'
#$BID = "av586742631"
#$Part = "0"

function BiliDown {
    param (
        [parameter(position=1)]$BID,
        [parameter(position=2)]$Part=""
    )
    $Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $Cookie = Get-Content -Path ".\bilibili.com_cookies.txt"
    $CookieString = ""
    $Cookie | ForEach-Object {
        if (!$_.StartsWith('#') -and $_.StartsWith('.bilibili.com')) {
            $Single = $_.Split("`t")
            $SingleCookie = New-Object System.Net.Cookie
            $SingleCookie.Name = $Single[5]
            $SingleCookie.Value = $Single[6]
            $SingleCookie.Domain = $Single[0]
            $CookieString += "$($Single[5])=$($Single[6]); "
            $Session.Cookies.Add($SingleCookie);
        }
    }
    $Headers = @{}
    $Headers.Add("Cookie", $CookieString)
    $Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0")
    $Headers.Add("Referer", "https://www.bilibili.com")

    if ($BID.StartsWith('a') -or $BID.StartsWith('A')) {
        $VID = $BID.Substring(2)
        $PageList = "https://api.bilibili.com/x/player/pagelist?aid=$($VID)&jsonp=jsonp"
        $SourcePrefix = "https://api.bilibili.com/x/player/playurl?avid"
    } elseif ($BID.StartsWith('b') -or $BID.StartsWith('B')) {
        $VID = $BID
        $PageList = "https://api.bilibili.com/x/player/pagelist?bvid=$($VID)&jsonp=jsonp"
        $SourcePrefix = "https://api.bilibili.com/x/player/playurl?bvid"
    } else {
        exit
    }
    
    $Pages = (Invoke-WebRequest -Uri $PageList -Headers $Headers ).Content | ConvertFrom-Json
    $CIDs = @()
    if ($Part -EQ "") {
        $CIDs += $Pages.data | Where-Object page -EQ 1 | Select-Object cid
    } elseif ($Part -EQ "0") {
        $CIDs += $Pages.data | Select-Object cid
    } else {
        $CIDs += $Pages.data | Where-Object page -EQ $Part | Select-Object cid
    }
    $CIDs | ForEach-Object {
        function DownWithFFMPEG {
            param (
                [parameter(position=1)]$CIDIndex,
                [parameter(position=2)]$CIDPart
            )
            $VideoData = (Invoke-WebRequest -Uri $SourceUrl -Headers $Headers).Content | ConvertFrom-Json
            Invoke-WebRequest -Uri $VideoData.data.dash.audio[0].baseUrl -WebSession $Session -Headers $Headers -OutFile "$($CIDIndex)_a.m4s"
            Invoke-WebRequest -Uri $VideoData.data.dash.video[0].baseUrl -WebSession $Session -Headers $Headers -OutFile "$($CIDIndex)_v.m4s"
            if ($CIDPart -EQ "0") {
                $Filename = $BID
            } else {
                $Filename = "$($BID)_$($CIDPart)"
            }
            $ffmpegArgs = "-y -hide_banner -i $($CID.cid)_a.m4s -i $($CID.cid)_v.m4s -c copy $($Filename).mp4"
            Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -RedirectStandardError ".\$($CID.cid)_.log" -ArgumentList $ffmpegArgs
            Remove-Item "$($CID.cid)_*.*"
        }
        $CID = $_
        $SourceUrl = "$SourcePrefix=$VID&cid=$($CID.cid)&qn=116&fnver=0&fnval=16&otype=json&type="
        DownWithFFMPEG $CID.cid $CIDs.IndexOf($CID)
    }
}

$VideoCutArgs = @()
$ThreadNums = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors

Get-ChildItem "D:\bilibiliweek\ranking\list1\556_5.yml" | ForEach-Object {
    [string[]]$FileContent = Get-Content $_
    $YamlContent = ''
    $FileContent | ForEach-Object {
        $YamlContent = $YamlContent + "`n" + $_
    }
    ConvertFrom-Yaml $YamlContent | ForEach-Object {
        $_ | ForEach-Object {
            $VideoCutArgs += "$($_.':name')"
        }
    }
}

$Call = $function:BiliDown.ToString()
$VideoCutArgs | ForEach-Object -Parallel {
    $function:BiliDown = $using:Call
    BiliDown $_
} -ThrottleLimit $ThreadNums