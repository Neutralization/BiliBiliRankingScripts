param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)
)
$ProgressPreference = 'SilentlyContinue'
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Cookie = Get-Content -Path './cookies.txt'
$Cookie | ForEach-Object {
    if (!$_.StartsWith('#') -and $_.StartsWith('.bilibili.com')) {
        $Single = $_.Split("`t")
        $SingleCookie = New-Object System.Net.Cookie
        $SingleCookie.Name = $Single[5]
        $SingleCookie.Value = $Single[6]
        $SingleCookie.Domain = "member$($Single[0])"
        $Session.Cookies.Add($SingleCookie)
    }
}
$Headers = @{
    "Accept"           = "application/json, text/javascript, */*; q=0.01"
    "Accept-Language"  = "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2"
    "Accept-Encoding"  = "gzip, deflate, br"
    "X-Requested-With" = "XMLHttpRequest"
    "DNT"              = "1"
    "Connection"       = "keep-alive"
    "Referer"          = "https://member.bilibili.com/platform/upload-manager/article"
    "Sec-Fetch-Dest"   = "empty"
    "Sec-Fetch-Mode"   = "cors"
    "Sec-Fetch-Site"   = "same-origin"
    "TE"               = "trailers"
}
$Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0')
function AddFavourite {
    param (
        [parameter(position = 1)]$FID,
        [parameter(position = 2)]$AVID
    )
    $Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $Cookie = Get-Content -Path './cookies.txt'
    $CookieString = ''
    $Cookie | ForEach-Object {
        if (!$_.StartsWith('#') -and $_.StartsWith('.bilibili.com')) {
            $Single = $_.Split("`t")
            $SingleCookie = New-Object System.Net.Cookie
            $SingleCookie.Name = $Single[5]
            $SingleCookie.Value = $Single[6]
            $SingleCookie.Domain = $Single[0]
            $CookieString += "$($Single[5])=$($Single[6]); "
            $Session.Cookies.Add($SingleCookie)
        }
    }
    $Headers = @{}
    $Headers.Add('Cookie', $CookieString)
    $Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0')
    $Headers.Add('Referer', 'https://www.bilibili.com')

    $CSRF = $Session.Cookies.GetCookies('https://www.bilibili.com')['bili_jct'].Value
    $Params = @{
        "rid"           = $AVID
        "type"          = "2"
        "add_media_ids" = $FID
        "del_media_ids" = ""
        "platform"      = "web"
        "eab_x"         = "2"
        "ramval"        = "0"
        "ga"            = "1"
        "gaia_source"   = "web_normal"
        "csrf"          = $CSRF
    }
    $Result = (Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v3/fav/resource/deal' -Method 'POST' -Headers $Headers -Body $Params).Content | ConvertFrom-Json
    Write-Host $Result
}

$FIDData = @{}
$FIDList = (Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=398300398&jsonp=jsonp' -Headers $Headers).Content | ConvertFrom-Json
$FIDList.data.list | ForEach-Object {
    $FIDData[$_.title] = $_.id
}

$Body = @{
    "status"      = "is_pubing,pubed,not_pubed"
    "pn"          = "1"
    "ps"          = "10"
    "keyword"     = "周刊哔哩哔哩排行榜#$($RankNum)"
    "coop"        = "1"
    "interactive" = "1"
}
$Self = (Invoke-WebRequest -Uri "https://member.bilibili.com/x/web/archives" -Headers $Headers -Body $Body -WebSession $Session).Content | ConvertFrom-Json
Write-Host $Self.data.arc_audits[0].Archive.bvid
AddFavourite $FIDData['周刊合集'] $Self.data.arc_audits[0].Archive.aid
Start-Sleep -Seconds 1
$Parts = @(16, 3)
$Files = @()
$RankVideos = @()
$Parts | ForEach-Object {
    $Files += Get-Content -Raw "./ranking/list1/$($RankNum)_$($_).yml"
}
$Files | ForEach-Object {
    ConvertFrom-Yaml $_ | ForEach-Object {
        $_ | ForEach-Object {
            $RankVideos += $_. ':name'
        }
    }
}
AddFavourite $FIDData['周刊一位'] $RankVideos[2].Substring(2)
Start-Sleep -Seconds 1
$RankVideos[ - ($RankVideos.Length - 3)..-1] | ForEach-Object {
    AddFavourite $FIDData['周刊 Pickup'] $_.Substring(2)
    Start-Sleep -Seconds 1
}