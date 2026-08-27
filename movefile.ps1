$RankNum = [Math]::Floor(
    ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7)
$ProgressPreference = 'SilentlyContinue'
$RankFolder = "D:\bilibiliweek\ranking\#${RankNum}"
$BackupFolder = ".\#$($RankNum)"
$SharedFiles = @(
    'op_2.png',
    'start.png',
    'world.png',
    'history_record.png',
    'over.png',
    'rule_2.png'
)

if (!(Test-Path -Path $BackupFolder)) {
    New-Item -ItemType Directory $BackupFolder
    New-Item -ItemType Directory "${BackupFolder}\main\"
    $SharedFiles | ForEach-Object {
        Move-Item -Path ".\$_" -Destination $BackupFolder -Force
    }
    Move-Item -Path ".\$($RankNum)_*.yml" -Destination "${BackupFolder}\main\" -Force
}
if (!(Test-Path -Path $RankFolder)) {
    New-Item -ItemType Directory $RankFolder -Force
}
Copy-Item -Path "$($BackupFolder)\*" -Destination $RankFolder -Recurse -Force

Get-ChildItem -File ".\$($RankNum)*.rar" | ForEach-Object {
    (7z e $_ -o"$($RankFolder)\" -y) > $null
}
