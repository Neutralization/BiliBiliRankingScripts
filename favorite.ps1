$ProgressPreference = 'SilentlyContinue'

function AddFavourite {
    param (
        [parameter(position = 1)]$FID,
        [parameter(position = 2)]$AVID
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

    $CSRF = $Session.Cookies.GetCookies("https://www.bilibili.com")["bili_jct"].Value
    $Params = @{rid = $AVID; type = 2; add_media_ids = $FID; del_media_ids = ""; jsonp = "jsonp"; csrf = $CSRF }
    $Result = (Invoke-WebRequest -Uri "https://api.bilibili.com/x/v3/fav/resource/deal" -Method "POST" -Headers $Headers -Body $Params).Content | ConvertFrom-Json
    Write-Host $Result
}

$FIDData = @{}
$FIDList = (Invoke-WebRequest -Uri "https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=398300398&jsonp=jsonp" -Headers $Headers).Content | ConvertFrom-Json

$FIDList.data.list | ForEach-Object {
    $FIDData[$_.title] = $_.id
}

Get-Content .\MAD_rank1.csv | ForEach-Object {
    AddFavourite $FIDData['MAD周刊一位'] $_
    Start-Sleep -Seconds 2
}