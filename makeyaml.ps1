param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$FootageFolder = "${TruePath}/ranking/list1"
$LOST_FILE = "${TruePath}/LostFile.json"
$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'

Write-Host ">>> 周刊哔哩哔哩排行榜#${RankNum}" -ForegroundColor Cyan

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

function Get-Cover {
    param (
        [string]$Link,
        [string]$Name
    )
    if ([string]::IsNullOrWhiteSpace($Link)) {
        return './footage/cover_lost.png'
    }
    $ext = ($Link -split '\.')[-1]
    $folderPath = './pic'
    $fileName = "${Id}_${Name}.${ext}"
    $destination = Join-Path $folderPath $fileName
    if (-not (Test-Path $destination)) {
        if (-not (Test-Path $folderPath)) {
            New-Item -ItemType Directory -Path $folderPath | Out-Null
        }
        try {
            Invoke-WebRequest -Uri $Link -OutFile $destination -UserAgent $UserAgent
        } catch {
            Write-Error "下载失败: $_"
        }
    }
}

function Get-VideoTitle {
    param ([int64]$Aid)

    $url = 'https://api.bilibili.com/x/web-interface/view'
    $headers = @{ 'User-Agent' = $UserAgent; 'DNT' = '1' }
    
    try {
        $resp = Invoke-RestMethod -Uri "${url}?aid=${Aid}" -Headers $headers -Method Get
        if ($resp.code -eq 0) {
            return @{ title = $resp.data.title; tname = $resp.data.tname_v2 }
        } else {
            # 记录失效视频
            $codemsg = @{ -404 = '管理员锁定'; 62002 = '用户自删除'; 62012 = '用户仅自见' }
            $msg = if ($codemsg.ContainsKey([int32]$resp.code)) { $codemsg[[int32]$resp.code] } else { '未知错误' }
            $lost = if (Test-Path $LOST_FILE) { Get-Content $LOST_FILE -Raw | ConvertFrom-Json -AsHashtable }
            $lost = if ($null -ne $lost) { $lost } else { [ordered]@{} }
            $Bvid = ConvertTo-AID -Source $Aid -Reverse $true
            $lost["av$Aid"] = $msg; $lost["$Bvid"] = $msg
            $lost | ConvertTo-Json -Depth 10 | Set-Content $LOST_FILE -Encoding UTF8
            Write-Host "> 视频失效: av${Aid} (${msg})" -ForegroundColor Red
            return $null
        }
    } catch { return $null }
}

function Write-YamlList {
    param (
        [string]$Suffix, 
        [int]$Max,
        [int]$Min,
        [int]$Part
    )

    $jsonPath = "./${RankNum}_${Suffix}.json"
    if (-not (Test-Path $jsonPath)) { return }
    $content = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $rankFrom = $content[0].rank_from
    $yamlList = New-Object System.Collections.Generic.List[PSObject]

    foreach ($x in $content) {
        if ($null -eq $x.info -and $x.sp_type_id -ne 2) {
            $rank = if ($null -ne $x.score_rank) { $x.score_rank } else { $x.rank }
            $Bvid = $x.bv -replace '^bv', 'BV'
            
            $len = 20
            if ($Part -in @(7, 11, 15)) { $len = 15 } elseif ($Part -eq 16) { $len = 30 }
            if ($x.changqi) { $len -= 10 }

            if ($rankFrom -le $Max) { $Max = $rankFrom }
            if ($rank -le $Max -and $rank -ge $Min) {
                $yamlList.Add([PSCustomObject]@{
                        rank   = $rank
                        name   = $Bvid
                        length = $len
                    })
            }
        }
    }

    $yamlStr = New-Object System.Collections.Generic.List[string]
    $yamlStr.Add('---')
    for ($i = $yamlList.Count - 1; $i -ge 0; $i--) {
        $item = $yamlList[$i]
        $yamlStr.Add("- :rank: $($item.rank)")
        $yamlStr.Add("  :name: $($item.name)")
        $yamlStr.Add("  :length: $($item.length)")
        $yamlStr.Add('  :offset: 0')
    }
    $yamlStr | Set-Content -Path "${FootageFolder}/${RankNum}_${Part}.yml" -Encoding UTF8
    Write-Host "> 已生成 YAML: ${FootageFolder}/${RankNum}_${Part}.yml" -ForegroundColor Cyan
}

function Main {
    $targetFiles = @('results_bangumi', 'guoman_bangumi', 'results_history', 'results' )
    
    foreach ($suffix in $targetFiles) {
        $file = "./${RankNum}_${suffix}.json"
        if (-not (Test-Path $file)) { continue }
        Write-Host "> 正在处理文件: $file" -ForegroundColor Cyan
        $data = Get-Content $file -Raw | ConvertFrom-Json
        
        foreach ($item in $data) {
            if ($null -ne $item.info) {
                continue
            }
            if ($null -ne $item.wid) {
                $info = Get-VideoTitle -Aid $item.wid
                if ($null -ne $info) {
                    if ($info.title -ne '' -and $info.title -ne $item.name) {
                        Write-Host "> 正在更新标题：原 $($item.wid) / $($item.name)" -ForegroundColor Yellow
                        Write-Host "> 正在更新标题: 现 $($info.title)" -ForegroundColor Yellow
                        $item.name = $info.title
                    }
                    if ($info.tname -ne '' -and $item.wtype -ne $info.tname) { $item.wtype = $info.tname }
                }
                $pic = $item.pic
                $cover = $item.cover
                $id = ConvertTo-AID -Source $item.wid -Reverse $true
                if ($null -ne $pic) {
                    Write-Host "> 正在下载封面: ${pic} > ${id}_pic" -ForegroundColor Cyan
                    Get-Cover -Id $id -Link $pic -Name 'pic'
                }
                if ($null -ne $cover) {
                    Write-Host "> 正在下载封面: ${cover} > ${id}_cover" -ForegroundColor Cyan
                    Get-Cover -Id $id -Link $cover -Name 'cover'
                }
            }
        }
        $data | ConvertTo-Json -Depth 10 -Compress | Set-Content $file -Encoding UTF8
    }

    Write-YamlList -Suffix 'results' -Max 99 -Min 21 -Part 5
    Write-YamlList -Suffix 'guoman_bangumi' -Max 10 -Min 1 -Part 7
    Write-YamlList -Suffix 'results' -Max 20 -Min 11 -Part 9
    Write-YamlList -Suffix 'results_bangumi' -Max 10 -Min 1 -Part 11
    Write-YamlList -Suffix 'results' -Max 10 -Min 4 -Part 13
    Write-YamlList -Suffix 'results_history' -Max 5 -Min 1 -Part 15
    Write-YamlList -Suffix 'results' -Max 3 -Min 1 -Part 16
    Compress-Archive -Path "${FootageFolder}/${RankNum}*.yml" -DestinationPath "${TruePath}/${RankNum}_list1.zip" -Update
}

Main
