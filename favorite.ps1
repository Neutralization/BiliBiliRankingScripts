param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7)
)
$ProgressPreference = 'SilentlyContinue'

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
            $Session.Cookies.Add($SingleCookie);
        }
    }
    $Headers = @{}
    $Headers.Add('Cookie', $CookieString)
    $Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0')
    $Headers.Add('Referer', 'https://www.bilibili.com')

    $CSRF = $Session.Cookies.GetCookies('https://www.bilibili.com')['bili_jct'].Value
    $Params = @{rid = $AVID; type = 2; add_media_ids = $FID; del_media_ids = ''; jsonp = 'jsonp'; csrf = $CSRF; platform = 'web' }
    $Result = (Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v3/fav/resource/deal' -Method 'POST' -Headers $Headers -Body $Params).Content | ConvertFrom-Json
    Write-Host $Result
}

$FIDData = @{}
$FIDList = (Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=398300398&jsonp=jsonp' -Headers $Headers).Content | ConvertFrom-Json
$FIDList.data.list | ForEach-Object {
    $FIDData[$_.title] = $_.id
}

$Self = (Invoke-WebRequest -Uri "https://api.bilibili.com/x/space/arc/search?mid=398300398&ps=30&tid=0&pn=1&keyword=$($RankNum)&order=pubdate&jsonp=jsonp" -Headers $Headers).Content | ConvertFrom-Json
AddFavourite $FIDData['周刊合集'] $Self.data.list.vlist[0].aid
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