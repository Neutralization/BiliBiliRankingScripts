param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = @('*')
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$FootageFolder = "${TruePath}/ranking/list1"

Import-Module powershell-yaml
$Files = Get-Content -Raw "${FootageFolder}/${RankNum}_*.yml"

$TaskQueue = @()
foreach ($content in $Files) {
    $items = (ConvertFrom-Yaml $content) | ForEach-Object { $_ } | ForEach-Object { $_ }
    $TaskQueue += $items
}

$CpuCores = $env:NUMBER_OF_PROCESSORS
$TaskLimit = [Math]::Max(2, [Math]::Floor($CpuCores * 0.75))

$TaskQueue | ForEach-Object -ThrottleLimit $TaskLimit -Parallel {
    $rank = $_.':rank'.ToString().PadLeft(2, '0')
    $name = $_.':name'
    $len = [int]$_.':length'
    $folder = $using:FootageFolder
    $fileName = "${rank}_${name}"

    if (-not (Test-Path -LiteralPath "${folder}/${fileName}.png")) {
        Copy-Item './footage/MAINRANKIMG.png' "${folder}/${fileName}.png"
    }
    if ($len -ge 30) {
        if (-not (Test-Path -LiteralPath "${folder}/${fileName}_.png")) {
            Copy-Item './footage/TOPIMG.png' "${folder}/${fileName}_.png"
        }
    }

    $fakeArgs = @(
        '-n', '-hide_banner',
        '-t', "${len}",
        '-f', 'lavfi', '-i', 'anullsrc',
        '-f', 'lavfi', '-i', "smptebars=duration=${len}:size=1280x720:rate=1",
        '-vf', "drawtext=fontfile='C\:/Windows/Fonts/msyh.ttc':fontsize=100:fontcolor=black:x=(w-text_w)/2:y=(h-text_h)/2:text='${fileName}'",
        "${folder}/${fileName}.mp4"
    )

    & ffmpeg.exe @fakeArgs 2> $null
}
