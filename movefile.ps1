$ProgressPreference = 'SilentlyContinue'
$FromFolder = '.\'
$DistFolder = 'D:\bilibiliweek\ranking'
$RankNum = [string]$RankNum = [Math]::Floor(
    ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)

$Backup = "$($FromFolder)\$($RankNum)"

if (!(Test-Path -Path $Backup)) {
    New-Item -ItemType Directory $Backup
    Move-Item -Path "$($FromFolder)\op_2.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\start.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\world.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\history_record.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\over.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\rule_2.png" -Destination $Backup -Force
    Move-Item -Path "$($FromFolder)\$($RankNum)_*.yml" -Destination $Backup -Force
} else {
    Copy-Item -Path "$($Backup)\op_2.png" -Destination "$($DistFolder)\1_op\" -Force
    Copy-Item -Path "$($Backup)\start.png" -Destination "$($DistFolder)\1_op\" -Force
    Copy-Item -Path "$($Backup)\world.png" -Destination "$($DistFolder)\1_op\" -Force
    Copy-Item -Path "$($Backup)\history_record.png" -Destination "$($DistFolder)\pic\" -Force
    Copy-Item -Path "$($Backup)\over.png" -Destination "$($DistFolder)\pic\" -Force
    Copy-Item -Path "$($Backup)\rule_2.png" -Destination "$($DistFolder)\pic\" -Force
    Copy-Item -Path "$($Backup)\$($RankNum)_*.yml" -Destination "$($DistFolder)\list1\" -Force
}

Get-ChildItem -File "$($RankNum)*.rar" -Path $FromFolder | ForEach-Object {
    (7z e $_ -o"$($DistFolder)\2_ed" -y) > $null
}