param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$Part = @('*')
)
$ProgressPreference = 'SilentlyContinue'

function BiliDown {
    param (
        [parameter(position = 1)]$BID,
        [parameter(position = 2)]$Part = ''
    )
    $Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $Cookie = Get-Content -Path './bilibili.com_cookies.txt'
    $CookieString = ''
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
    $Headers.Add('Cookie', $CookieString)
    $Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0')
    $Headers.Add('Referer', 'https://www.bilibili.com')

    if ($BID.StartsWith('a') -or $BID.StartsWith('A')) {
        $VID = $BID.Substring(2)
        $PageList = "https://api.bilibili.com/x/player/pagelist?aid=$($VID)&jsonp=jsonp"
        $SourcePrefix = 'https://api.bilibili.com/x/player/playurl?avid'
    } elseif ($BID.StartsWith('b') -or $BID.StartsWith('B')) {
        $VID = $BID
        $PageList = "https://api.bilibili.com/x/player/pagelist?bvid=$($VID)&jsonp=jsonp"
        $SourcePrefix = 'https://api.bilibili.com/x/player/playurl?bvid'
    } else {
        exit
    }
    $Pages = (Invoke-WebRequest -Uri $PageList -Headers $Headers ).Content | ConvertFrom-Json
    $CIDs = @()
    if ($Part -EQ '') {
        $CIDs += $Pages.data | Where-Object page -EQ 1 | Select-Object cid
    } elseif ($Part -EQ '0') {
        $CIDs += $Pages.data | Select-Object cid
    } else {
        $CIDs += $Pages.data | Where-Object page -EQ $Part | Select-Object cid
    }
    Write-Host "$($BID) Video Downloading......"
    $CIDs | ForEach-Object {
        function DownWithFFMPEG {
            param (
                [parameter(position = 1)]$CID,
                [parameter(position = 2)]$CIDIndex
            )
            $NormalUrl = "https://www.bilibili.com/video/$($BID)"
            $ReDirectTest = Invoke-WebRequest -Method Head -Uri $NormalUrl -Headers $Headers
            if ($null -ne $ReDirectTest.RequestMessage.RequestUri -and $ReDirectTest.RequestMessage.RequestUri.ToString() -Match 'bangumi' ) {
                # Write-Host $ReDirectTest.BaseResponse.RequestMessage.RequestUri
                $EPId = $ReDirectTest.BaseResponse.RequestMessage.RequestUri.ToString().Split('/')[-1].Substring(2)
                $PGCSourceUrl = "https://api.bilibili.com/pgc/player/web/playurl?cid=$($CID)&qn=120&type=&otype=json&fourk=1&ep_id=$($EPId)&fnver=0&fnval=80"
                $VideoData = (Invoke-WebRequest -Uri $PGCSourceUrl -Headers $Headers).Content | ConvertFrom-Json
                $SourceFiles = $VideoData.result.dash
            } else {
                $VideoData = (Invoke-WebRequest -Uri $SourceUrl -Headers $Headers).Content | ConvertFrom-Json
                $SourceFiles = $VideoData.data.dash
            }
            try {
                # Invoke-WebRequest -Uri $SourceFiles.audio[0].baseUrl -WebSession $Session -Headers $Headers -OutFile "./ranking/list0/$($CID)_a.m4s"
                $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide --disable-ipv6 ""$($SourceFiles.audio[0].baseUrl)"" --header=""User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"" --header=""Referer: https://www.bilibili.com"" --out ./ranking/list0/$($CID)_a.m4s"
                Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -RedirectStandardError "./ranking/list0/$($CID)_.log" -ArgumentList $aria2cArgs

                # Invoke-WebRequest -Uri $SourceFiles.video[0].baseUrl -WebSession $Session -Headers $Headers -OutFile "./ranking/list0/$($CID)_v.m4s"
                $aria2cArgs = "-x16 -s12 -j20 -k1M --continue --check-certificate=false --file-allocation=none --summary-interval=0 --download-result=hide --disable-ipv6 ""$($SourceFiles.video[0].baseUrl)"" --header=""User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"" --header=""Referer: https://www.bilibili.com"" --out ./ranking/list0/$($CID)_v.m4s"
                Start-Process -NoNewWindow -Wait -FilePath 'aria2c.exe' -RedirectStandardError "./ranking/list0/$($CID)_.log" -ArgumentList $aria2cArgs
                if ($CIDIndex -EQ '0') {
                    $Filename = $BID
                } else {
                    $Filename = "$($BID)_$($CIDIndex)"
                }
                $ffmpegArgs = "-y -hide_banner -i ./ranking/list0/$($CID)_a.m4s -i ./ranking/list0/$($CID)_v.m4s -c copy ./ranking/list0/$($Filename).mp4"
                Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -RedirectStandardError "./ranking/list0/$($CID)_.log" -ArgumentList $ffmpegArgs
                Remove-Item "./ranking/list0/$($CID)_*.*"
            } catch {
                New-Item -Path './ranking/list0/' -Name "$($BID).txt" -ItemType 'file' -Value '' -Force
            }
        }
        $OID = $_
        $SourceUrl = "$($SourcePrefix)=$($VID)&cid=$($OID.cid)&qn=120&fnver=0&fourk=1&fnval=80&otype=json&type="
        DownWithFFMPEG $OID.cid $CIDs.IndexOf($OID)
    }
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $LocalVideos = @()
    $RankVideos = @()
    $ThreadNums = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
    if ($Part.Contains('*')) {
        $Files = Get-Content -Raw "./ranking/list1/$($RankNum)_*.yml"
        Get-ChildItem './ranking/list0/*.mp4' | ForEach-Object { $LocalVideos += $_.BaseName }
    } else {
        $Part | ForEach-Object {
            $Files += Get-Content -Raw "./ranking/list1/$($RankNum)_$($_).yml"
        }
    }
    $Files | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += $_.':name'
            }
        }
    }
    $NewVideos = $RankVideos | Where-Object { $LocalVideos -notcontains $_ }
    $OldVideos = $LocalVideos | Where-Object { $RankVideos -notcontains $_ }
    $RankVideos | Where-Object { $LocalVideos -contains $_ } | ForEach-Object {
        Write-Host "$($_) Already Downloaded." -ForegroundColor Yellow
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    $OldVideos | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            (Resolve-Path "./ranking/list0/$($_).mp4"), 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    Get-ChildItem './ranking/list0/*' -Exclude *.mp4, *.m4s | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    $Call = $function:BiliDown.ToString()
    $NewVideos | ForEach-Object -Parallel {
        $function:BiliDown = $using:Call
        BiliDown $_
    } -ThrottleLimit $ThreadNums
}

Main