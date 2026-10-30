param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [int]$History = [Math]::Floor(
        [Math]::Floor(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7) / 100
    ) * 100
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$UseHistory = $PSBoundParameters.ContainsKey('History')
$UseRank = $PSBoundParameters.ContainsKey('RankNum') -or -not $UseHistory

Import-Module powershell-yaml

$CpuCores = $env:NUMBER_OF_PROCESSORS
$TaskLimit = [Math]::Max(2, [Math]::Floor($CpuCores * 0.75))

function ConvertFrom-RankYaml {
    param (
        [array]$Files
    )

    $Tasks = @()
    foreach ($Content in $Files) {
        $Items = (ConvertFrom-Yaml $Content) | ForEach-Object { $_ } | ForEach-Object { $_ }
        $Tasks += $Items
    }
    return $Tasks
}

function Invoke-FakeRankTask {
    param (
        [parameter(position = 1)]$Item,
        [parameter(position = 2)][string]$FootageFolder,
        [parameter(position = 3)][bool]$GenerateMask
    )

    $rank = $Item.':rank'.ToString().PadLeft(2, '0')
    $name = $Item.':name'
    $len = [int]$Item.':length'
    $fileName = "${rank}_${name}"

    if (-not (Test-Path -LiteralPath "${FootageFolder}/${fileName}.png")) {
        Copy-Item './footage/public/MAINRANKIMG.png' "${FootageFolder}/${fileName}.png"
    }
    if ($GenerateMask -and $len -ge 30) {
        if (-not (Test-Path -LiteralPath "${FootageFolder}/${fileName}_.png")) {
            Copy-Item './footage/public/TOPIMG.png' "${FootageFolder}/${fileName}_.png"
        }
    }

    $fakeArgs = @(
        '-n', '-hide_banner',
        '-t', "${len}",
        '-f', 'lavfi', '-i', 'anullsrc',
        '-f', 'lavfi', '-i', "smptebars=duration=${len}:size=1280x720:rate=1",
        '-vf', "drawtext=fontfile='C\:/Windows/Fonts/msyh.ttc':fontsize=100:fontcolor=black:x=(w-text_w)/2:y=(h-text_h)/2:text='${fileName}'",
        "${FootageFolder}/${fileName}.mp4"
    )

    & ffmpeg.exe @fakeArgs 2> $null
}

function Invoke-FakeRankBatch {
    param (
        [array]$TaskQueue,
        [string]$FootageFolder,
        [bool]$GenerateMask
    )

    if ($null -eq $TaskQueue -or $TaskQueue.Count -eq 0) {
        return
    }

    $taskDef = ${Function:Invoke-FakeRankTask}.ToString()
    $TaskQueue | ForEach-Object -ThrottleLimit $TaskLimit -Parallel {
        ${Function:Invoke-FakeRankTask} = [ScriptBlock]::Create($using:taskDef)
        Invoke-FakeRankTask -Item $_ -FootageFolder $using:FootageFolder -GenerateMask $using:GenerateMask
    }
}

if ($UseRank) {
    $FootageFolder = "${TruePath}/ranking/#${RankNum}/main"
    $Files = @(Get-Content -Raw "${FootageFolder}/${RankNum}_*.yml")
    $TaskQueue = @(ConvertFrom-RankYaml $Files)
    Invoke-FakeRankBatch -TaskQueue $TaskQueue -FootageFolder $FootageFolder -GenerateMask $true
}

if ($UseHistory) {
    $FootageFolder = "${TruePath}/ranking/history${History}"
    $HistoryYml = "${FootageFolder}/${History}.yml"
    if (-not (Test-Path -LiteralPath $HistoryYml)) {
        throw "Missing history YAML: ${HistoryYml}"
    }
    $TaskQueue = @(ConvertFrom-RankYaml @(Get-Content -Raw $HistoryYml))
    Invoke-FakeRankBatch -TaskQueue $TaskQueue -FootageFolder $FootageFolder -GenerateMask $false
}
