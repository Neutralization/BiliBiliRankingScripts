param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$CookieFile = "${TruePath}/cookies.txt"
$StampFile = "${TruePath}/stamp.json"
$FootageFolder = "${TruePath}/ranking/#${RankNum}"
$ReplyFile = "${FootageFolder}/${RankNum}_rankdoor.csv"
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
$CSRF = $Session.Cookies.GetCookies('https://www.bilibili.com')['bili_jct'].Value
$Headers = @{'User-Agent' = $UserAgent }
$MID = 398300398

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

function Add-TimeStamp {
    param (
        [parameter(position = 1)]$AVID
    )
    $AID = $AVID.Substring(2)
    $Body = @{
        'aid' = $AID
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://api.bilibili.com/x/web-interface/view' `
            -Headers $Headers `
            -Body $Body
    ).Content | ConvertFrom-Json
    if ($Result.code -ne 0) {
        Write-Information -MessageData $Result.message -InformationAction Continue
        return 1
    } else {
        $CID = $Result.data.pages[0].cid
        Write-Information -MessageData "取得视频 CID ${CID}" -InformationAction Continue
    }
    $Stamp = Get-Content $StampFile -Encoding 'UTF-8'
    $StampString = $Stamp | ConvertFrom-Json | ConvertTo-Json -Compress
    Write-Debug $StampString
    $Body = @{
        'aid'       = $AID
        'cid'       = $CID
        'type'      = '2'
        'cards'     = $StampString
        'permanent' = 'false'
        'csrf'      = $CSRF
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://member.bilibili.com/x/web/card/submit' `
            -Method Post `
            -WebSession $Session `
            -Headers $Headers `
            -ContentType 'application/x-www-form-urlencoded' `
            -Body $Body
    ).Content | ConvertFrom-Json
    if ($Result.code -ne 0) {
        Write-Information -MessageData $Result.message -InformationAction Continue
        return 1
    } else {
        Write-Information -MessageData '添加视频分段章节成功' -InformationAction Continue
    }
}

function Get-FIDList {
    $FIDData = @{}
    $Result = (
        Invoke-WebRequest -Uri "https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${MID}&jsonp=jsonp" `
            -Headers $Headers
    ).Content | ConvertFrom-Json
    $Result.data.list | ForEach-Object {
        $FIDData[$_.title] = $_.id
    }
    return $FIDData
}

function Get-SelfAID {
    $Body = @{
        'status'      = 'is_pubing,pubed,not_pubed'
        'pn'          = '1'
        'ps'          = '10'
        'keyword'     = "周刊哔哩哔哩排行榜#${RankNum}"
        'coop'        = '1'
        'interactive' = '1'
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://member.bilibili.com/x/web/archives' `
            -WebSession $Session `
            -Headers $Headers `
            -Body $Body
    ).Content | ConvertFrom-Json
    Write-Information "周刊哔哩哔哩排行榜#${RankNum} - $($Result.data.arc_audits[0].Archive.bvid)" -InformationAction Continue
    $SelfAID = "av$($Result.data.arc_audits[0].Archive.aid)"
    return $SelfAID
}

function Add-Favourite {
    param (
        [parameter(position = 1)]$FID,
        [parameter(position = 2)]$AVID
    )
    if ($AVID -match '^[aA]') {
        $AID = $AVID.Substring(2)
    } else {
        $AID = ConvertTo-AID $AVID $false
    }
    $Body = @{
        'rid'           = $AID
        'type'          = '2'
        'add_media_ids' = $FID
        'del_media_ids' = ''
        'platform'      = 'web'
        'eab_x'         = '2'
        'ramval'        = '0'
        'ga'            = '1'
        'gaia_source'   = 'web_normal'
        'csrf'          = $CSRF
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v3/fav/resource/deal' `
            -Method POST `
            -WebSession $Session `
            -Headers $Headers `
            -Body $Body
    ).Content | ConvertFrom-Json
    if ($Result.code -ne 0) {
        Write-Information -MessageData $Result.message -InformationAction Continue
        return 1
    } else {
        Write-Information -MessageData "收藏视频 av${AID} 成功" -InformationAction Continue
    }
}

function Get-Ranking {
    param (
        [parameter(position = 1)]$Part
    )
    $RankVideos = @()
    $File = Get-Content -Raw "${FootageFolder}/main/${RankNum}_${Part}.yml"
    $File | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += $_.':name'
            }
        }
    }
    return $RankVideos
}

function Set-TopReply {
    [CmdletBinding(SupportsShouldProcess)]
    [OutputType([int])]
    param (
        [parameter(position = 1)]$AVID,
        [parameter(position = 2)]$RPID
    )
    $AID = $AVID.Substring(2)
    $Body = @{
        'oid'    = $AID
        'type'   = '1'
        'rpid'   = $RPID
        'action' = '1'
        'csrf'   = $CSRF
    }
    if ($PSCmdlet.ShouldProcess("av${AID}#reply${RPID}", 'Set top reply')) {
        $Result = (
            Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v2/reply/top' `
                -Method Post `
                -WebSession $Session `
                -Headers $Headers `
                -ContentType 'application/x-www-form-urlencoded' `
                -Body $Body
        ).Content | ConvertFrom-Json
        if ($Result.code -ne 0) {
            Write-Information -MessageData $Result.message -InformationAction Continue
            return 1
        } else {
            Write-Information -MessageData "评论置顶成功`nhttps://www.bilibili.com/video/av${AID}#reply${RPID}" -InformationAction Continue
        }
    }
}

function Add-Reply {
    param (
        [parameter(position = 1)]$AVID,
        [parameter(position = 2)]$Parent,
        [parameter(position = 3)]$Message
    )
    $AID = $AVID.Substring(2)
    $Body = @{
        'plat'           = '1'
        'oid'            = $AID
        'type'           = '1'
        'message'        = $Message
        'root'           = $Parent
        'parent'         = $Parent
        'at_name_to_mid' = '{}'
        'gaia_source'    = 'main_web'
        'csrf'           = $CSRF
        'statistics'     = "{'appId':100,'platform':5}"
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://api.bilibili.com/x/v2/reply/add' `
            -Method Post `
            -WebSession $Session `
            -Headers $Headers `
            -ContentType 'application/x-www-form-urlencoded' `
            -Body $Body
    ).Content | ConvertFrom-Json
    if ($Result.code -ne 0) {
        Write-Information -MessageData $Result.message -InformationAction Continue
        return 1
    } else {
        $RPID = $Result.data.rpid
        Write-Information -MessageData "评论发送成功`nhttps://www.bilibili.com/video/av${AID}#reply${RPID}" -InformationAction Continue
        return $RPID
    }
}

function Get-RankList {
    function Join-RankList {
        param (
            [array]$LineList
        )
        $Strings = @()
        $LineList | ForEach-Object {
            if ($null -eq $_.Split(',')[1]) {
                $CurrentLine = "$($_.Split(',')[0])"
            } else {
                $CurrentLine = "$($_.Split(',')[0])`t$($_.Split(',')[1])"
            }
            $Strings += $CurrentLine
        }
        $RankString = $Strings -join "`n"
        return $RankString
    }

    $RankList = @()
    $SplitList = Get-Content $ReplyFile -Encoding 'UTF8BOM' | Select-Object -Skip 0
    $RankList += Join-RankList $SplitList
    return $RankList
}

function Set-MasterPiece {
    [CmdletBinding(SupportsShouldProcess)]
    [OutputType([int])]
    param (
        [parameter(position = 1)]$AVID
    )
    $AID = $AVID.Substring(2)
    $Body = @{
        'vmid' = $MID
    }
    $Result = (
        Invoke-WebRequest -Uri 'https://api.bilibili.com/x/space/masterpiece' `
            -Body $Body `
            -WebSession $Session `
            -Headers $Headers
    ).Content | ConvertFrom-Json
    if ($Result.code -ne 0) {
        Write-Information -MessageData $Result.message -InformationAction Continue
        return 1
    } else {
        $BeforeAID = $Result.data | Where-Object -Property 'title' -Like '*周刊哔哩哔哩排行榜*' | Select-Object -ExpandProperty 'aid'
        if ($null -eq $BeforeAID) {
            Write-Information -MessageData '目前没有代表作' -InformationAction Continue
        } else {
            Write-Information -MessageData "目前代表作 av${BeforeAID}" -InformationAction Continue
            $Body = @{
                'aid'  = $BeforeAID
                'csrf' = $CSRF
            }
            if ($PSCmdlet.ShouldProcess("av${BeforeAID}", 'Cancel masterpiece')) {
                $Result = (
                    Invoke-WebRequest -Uri 'https://api.bilibili.com/x/space/masterpiece/cancel' `
                        -Method Post `
                        -WebSession $Session `
                        -Headers $Headers `
                        -ContentType 'application/x-www-form-urlencoded' `
                        -Body $Body
                ).Content | ConvertFrom-Json
                if ($Result.code -ne 0) {
                    Write-Information -MessageData $Result.message -InformationAction Continue
                    return 1
                } else {
                    Write-Information -MessageData "取消代表作 av${BeforeAID} 成功" -InformationAction Continue
                }
            }
        }
        $Body = @{
            'aid'  = $AID
            'csrf' = $CSRF
        }
        if ($PSCmdlet.ShouldProcess("av${AID}", 'Set masterpiece')) {
            $Result = (
                Invoke-WebRequest -Uri 'https://api.bilibili.com/x/space/masterpiece/add' `
                    -Method Post `
                    -WebSession $Session `
                    -Headers $Headers `
                    -ContentType 'application/x-www-form-urlencoded' `
                    -Body $Body
            ).Content | ConvertFrom-Json
            if ($Result.code -ne 0) {
                Write-Information -MessageData $Result.message -InformationAction Continue
                return 1
            } else {
                Write-Information -MessageData "设置新代表作 av${AID} 成功" -InformationAction Continue
            }
        }
    }
}

function Set-TopVideo {
    [CmdletBinding(SupportsShouldProcess)]
    [OutputType([int])]
    param (
        [parameter(position = 1)]$AVID
    )
    $AID = $AVID.Substring(2)
    $Body = @{
        'aid'    = $AID
        'reason' = ''
        'csrf'   = $CSRF
    }
    if ($PSCmdlet.ShouldProcess("av${AID}", 'Set top video')) {
        $Result = (
            Invoke-WebRequest -Uri 'https://api.bilibili.com/x/space/top/arc/set' `
                -Method Post `
                -WebSession $Session `
                -Headers $Headers `
                -ContentType 'application/x-www-form-urlencoded' `
                -Body $Body
        ).Content | ConvertFrom-Json
        if ($Result.code -ne 0) {
            Write-Information -MessageData $Result.message -InformationAction Continue
            return 1
        } else {
            Write-Information -MessageData "设置空间置顶 av${AID} 成功" -InformationAction Continue
        }
    }
}

function Main {
    $FIDData = Get-FIDList
    $SelfAID = Get-SelfAID
    Add-TimeStamp $SelfAID
    Add-Favourite $FIDData['周刊合集'] $SelfAID
    $Top1 = (Get-Ranking 16)[-1]
    Add-Favourite $FIDData['周刊一位'] $Top1
    Get-Ranking 3 | ForEach-Object {
        Add-Favourite $FIDData['周刊 Pickup 2'] $_
    }
    Set-MasterPiece $SelfAID
    Set-TopVideo $SelfAID
    $RankList = Get-RankList
    $ROOT = Add-Reply -AVID $SelfAID -Parent '0' -Message $RankList
    Start-Sleep -Seconds 1
    Set-TopReply $SelfAID $ROOT
}

Main
