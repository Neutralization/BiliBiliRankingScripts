param (
    [int]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$FootageFolder = "${TruePath}/ranking/#${RankNum}"
$LOST_FILE = "${TruePath}/footage/LostFile.json"
$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
$script:JsonSourceDir = $null

Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 周刊哔哩哔哩排行榜#${RankNum}" -InformationAction Continue

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

function Get-Cover {
    param (
        [string]$Id,
        [string]$Link,
        [string]$Name
    )
    if ([string]::IsNullOrWhiteSpace($Link)) {
        return './footage/public/cover_lost.png'
    }
    $destination = Join-Path './footage/covers' "${Id}_${Name}.$((($Link -split '\.')[-1]))"
    if (-not (Test-Path $destination)) {
        if (-not (Test-Path './footage/covers')) {
            New-Item -ItemType Directory -Path './footage/covers' | Out-Null
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

    try {
        $resp = Invoke-RestMethod -Uri "https://api.bilibili.com/x/web-interface/view?aid=${Aid}" -Headers @{ 'User-Agent' = $UserAgent; 'DNT' = '1' } -Method Get
        if ($resp.code -eq 0) {
            return @{ title = $resp.data.title; tname = $resp.data.tname_v2 }
        } else {
            # 记录失效视频
            $msg = switch ([int32]$resp.code) {
                -404 { '管理员锁定' }
                62002 { '用户自删除' }
                62012 { '用户仅自见' }
                default { '未知错误' }
            }
            $lost = if (Test-Path $LOST_FILE) { Get-Content $LOST_FILE -Raw | ConvertFrom-Json -AsHashtable }
            $lost = if ($null -ne $lost) { $lost } else { [ordered]@{} }
            $lost["av$Aid"] = $msg; $lost["$(ConvertTo-AID -Source $Aid -Reverse $true)"] = $msg
            $lost | ConvertTo-Json -Depth 10 | Set-Content $LOST_FILE -Encoding UTF8
            Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 视频失效: av${Aid} (${msg})" -InformationAction Continue
            return $null
        }
    } catch { return $null }
}

function Get-YamlItem {
    param (
        [string]$Suffix,
        [int]$Max,
        [int]$Min,
        [int]$Part
    )

    $jsonPath = Join-Path $JsonSourceDir "${RankNum}_${Suffix}.json"
    if (-not (Test-Path $jsonPath)) { return $null }
    $content = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $rankFrom = $content[0].rank_from
    $yamlItems = New-Object System.Collections.Generic.List[PSObject]

    foreach ($x in $content) {
        if ($null -eq $x.info -and $x.sp_type_id -ne 2) {
            $rank = if ($null -ne $x.score_rank) { $x.score_rank } else { $x.rank }
            $Bvid = $x.bv -replace '^bv', 'BV'
            $len = 20
            if ($Part -in @(7, 11, 15)) { $len = 15 } elseif ($Part -eq 16) { $len = 30 }
            if ($x.changqi) { $len -= 10 }
            if ($rankFrom -le $Max) { $Max = $rankFrom }
            if ($rank -le $Max -and $rank -ge $Min) {
                $yamlItems.Add([PSCustomObject]@{ rank = $rank; name = $Bvid; length = $len })
            }
        }
    }

    return $yamlItems
}

function Convert-YamlItemToLineList {
    param (
        [System.Collections.Generic.List[PSObject]]$YamlItems
    )

    $yamlLines = New-Object System.Collections.Generic.List[string]
    $yamlLines.Add('---')
    for ($i = $YamlItems.Count - 1; $i -ge 0; $i--) {
        $item = $YamlItems[$i]
        $yamlLines.Add("- :rank: $($item.rank)")
        $yamlLines.Add("  :name: $($item.name)")
        $yamlLines.Add("  :length: $($item.length)")
        $yamlLines.Add('  :offset: 0')
    }
    return $yamlLines
}

function Write-YamlOutput {
    param (
        [System.Collections.Generic.List[string]]$YamlLines,
        [int]$Part
    )

    $YamlLines | Set-Content -Path "${FootageFolder}/main/${RankNum}_${Part}.yml" -Encoding UTF8
    Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 已生成 YAML: ${FootageFolder}/main/${RankNum}_${Part}.yml" -InformationAction Continue
}

function Write-YamlItemList {
    param (
        [string]$Suffix,
        [int]$Max,
        [int]$Min,
        [int]$Part
    )
    $yamlItems = Get-YamlItem -Suffix $Suffix -Max $Max -Min $Min -Part $Part
    if ($null -eq $yamlItems) { return }
    $yamlLines = Convert-YamlItemToLineList -YamlItems $yamlItems
    Write-YamlOutput -YamlLines $yamlLines -Part $Part
}

function Write-RankdoorCsv {
    $sections = @(
        @{ label = '主榜'; suffix = 'results'; max = 99; min = 21 },
        @{ label = '主榜'; suffix = 'results'; max = 20; min = 11 },
        @{ label = '主榜'; suffix = 'results'; max = 10; min = 4 },
        @{ label = '主榜'; suffix = 'results'; max = 3; min = 1 },
        @{ label = '历史'; suffix = 'results_history'; max = 5; min = 1 },
        @{ label = '国创'; suffix = 'guoman_bangumi'; max = 10; min = 1 },
        @{ label = '番剧'; suffix = 'results_bangumi'; max = 10; min = 1 }
    )

    $csvLines = New-Object System.Collections.Generic.List[string]

    foreach ($section in $sections) {
        $jsonPath = Join-Path $JsonSourceDir "${RankNum}_$($section.suffix).json"
        if (-not (Test-Path $jsonPath)) { continue }

        $content = Get-Content $jsonPath -Raw | ConvertFrom-Json
        $rankFrom = $content[0].rank_from
        $max = $section.max
        if ($rankFrom -le $max) { $max = $rankFrom }

        $items = New-Object System.Collections.Generic.List[PSObject]
        foreach ($x in $content) {
            if ($null -eq $x.info -and $x.sp_type_id -ne 2) {
                $rank = if ($null -ne $x.score_rank) { $x.score_rank } else { $x.rank }
                if ($rank -le $max -and $rank -ge $section.min) {
                    $items.Add([PSCustomObject]@{
                            rank = [int]$rank
                            bvid = ($x.bv -replace '^bv', 'BV')
                        })
                }
            }
        }

        if ($items.Count -eq 0) { continue }

        $csvLines.Add($section.label)
        $items | Sort-Object -Property rank -Descending | ForEach-Object {
            $csvLines.Add("$($_.rank),$($_.bvid)")
        }
    }

    $csvPath = "${TruePath}/ranking/#${RankNum}/${RankNum}_rankdoor.csv"
    $csvLines | Set-Content -Path $csvPath -Encoding UTF8
    Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 已生成 Rankdoor CSV: ${csvPath}" -InformationAction Continue
}

function Main {
    function Get-SourceJson {
        param ([string]$Suffix)

        $file = Join-Path $JsonSourceDir "${RankNum}_${Suffix}.json"
        if (-not (Test-Path $file)) { return }
        Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 正在处理文件: ${RankNum}_${Suffix}.json" -InformationAction Continue
        $data = Get-Content $file -Raw | ConvertFrom-Json

        foreach ($item in $data) {
            if ($null -ne $item.info) {
                continue
            }
            if ($null -ne $item.wid) {
                $info = Get-VideoTitle -Aid $item.wid
                if ($null -ne $info) {
                    if ($info.title -ne '' -and $info.title -ne $item.name) {
                        Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 正在更新标题：原 $($item.name)" -InformationAction Continue
                        Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 正在更新标题: 现 $($info.title)" -InformationAction Continue
                        $item.name = $info.title
                    }
                    if ($info.tname -ne '' -and $item.wtype -ne $info.tname) { $item.wtype = $info.tname }
                }
                $pic = $item.pic
                $cover = $item.cover
                $id = ConvertTo-AID -Source $item.wid -Reverse $true
                if ($null -ne $pic) {
                    Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 正在下载封面: ${pic} > ${id}_pic" -InformationAction Continue
                    Get-Cover -Id $id -Link $pic -Name 'pic'
                }
                if ($null -ne $cover) {
                    Write-Information "$(Get-Date -Format 'MM/dd HH:mm:ss') - 正在下载封面: ${cover} > ${id}_cover" -InformationAction Continue
                    Get-Cover -Id $id -Link $cover -Name 'cover'
                }
            }
        }
        $data | ConvertTo-Json -Depth 10 -Compress | Set-Content $file -Encoding UTF8
    }

    function Get-DerivedAsset {
        Write-YamlItemList -Suffix 'results' -Max 99 -Min 21 -Part 5
        Write-YamlItemList -Suffix 'guoman_bangumi' -Max 10 -Min 1 -Part 7
        Write-YamlItemList -Suffix 'results' -Max 20 -Min 11 -Part 9
        Write-YamlItemList -Suffix 'results_bangumi' -Max 10 -Min 1 -Part 11
        Write-YamlItemList -Suffix 'results' -Max 10 -Min 4 -Part 13
        Write-YamlItemList -Suffix 'results_history' -Max 5 -Min 1 -Part 15
        Write-YamlItemList -Suffix 'results' -Max 3 -Min 1 -Part 16
        Write-RankdoorCsv
        uv run .\generate.py --week $RankNum
    }

    function Get-OutputArchive {
        $rankStartTime = [DateTimeOffset]::FromUnixTimeSeconds(1276876800 + ([int64]$RankNum * 604800)).LocalDateTime
        $archivePaths = @("${FootageFolder}/main/${RankNum}*.yml")
        $pngFiles = Get-ChildItem -Path "${FootageFolder}/main/*.png" -File -ErrorAction SilentlyContinue | Where-Object { $_.CreationTime -gt $rankStartTime }
        if ($pngFiles.Count -gt 0) {
            $archivePaths += $pngFiles.FullName
        }

        $archiveTemp = Join-Path ([System.IO.Path]::GetTempPath()) "bilibiliweek_${RankNum}_main_$([Guid]::NewGuid().ToString('N'))"
        $archiveListFolder = Join-Path $archiveTemp 'main'
        try {
            New-Item -ItemType Directory -Path $archiveListFolder -Force | Out-Null
            foreach ($archivePath in $archivePaths) {
                Get-ChildItem -Path $archivePath -File -ErrorAction SilentlyContinue | ForEach-Object {
                    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $archiveListFolder $_.Name) -Force
                }
            }
            Compress-Archive -Path $archiveListFolder -DestinationPath "${TruePath}/${RankNum}_main.zip" -Force
        } finally {
            if (Test-Path $archiveTemp) {
                Remove-Item -LiteralPath $archiveTemp -Recurse -Force
            }
        }
    }

    if (!(Test-Path "${FootageFolder}/main")) {
        New-Item -ItemType Directory -Path "${FootageFolder}/main" | Out-Null
    }
    if (!(Test-Path "${FootageFolder}/sub")) {
        New-Item -ItemType Directory -Path "${FootageFolder}/sub" | Out-Null
    }
    $targetFiles = @('results_bangumi', 'guoman_bangumi', 'results_history', 'results' )

    $archivePath = "./json${RankNum}.zip"
    if (-not (Test-Path $archivePath)) {
        throw "缺少周刊 JSON 归档文件: $archivePath"
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $jsonTempDir = Join-Path ([System.IO.Path]::GetTempPath()) "bilibiliweek_${RankNum}_json_$([Guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Path $jsonTempDir -Force | Out-Null
    $script:JsonSourceDir = $jsonTempDir

    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $jsonTempDir)

        foreach ($suffix in $targetFiles) {
            Get-SourceJson -Suffix $suffix
        }

        $archive = [System.IO.Compression.ZipFile]::Open($archivePath, 'Update')
        try {
            foreach ($suffix in $targetFiles) {
                $tempFile = Join-Path $jsonTempDir "${RankNum}_${suffix}.json"
                if (-not (Test-Path $tempFile)) { continue }
                $entryName = "${RankNum}_${suffix}.json"
                $existing = $archive.GetEntry($entryName)
                if ($null -ne $existing) { $existing.Delete() }
                $entry = $archive.CreateEntry($entryName)
                $entryStream = $entry.Open()
                try {
                    $fileBytes = [System.IO.File]::ReadAllBytes($tempFile)
                    $entryStream.Write($fileBytes, 0, $fileBytes.Length)
                } finally {
                    $entryStream.Dispose()
                }
            }
        } finally {
            $archive.Dispose()
        }

        Get-DerivedAsset
        Get-OutputArchive
    } finally {
        if (Test-Path $jsonTempDir) {
            Remove-Item -LiteralPath $jsonTempDir -Recurse -Force
        }
        $script:JsonSourceDir = $null
    }
}

Main
