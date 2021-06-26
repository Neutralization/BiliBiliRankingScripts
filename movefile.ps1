$ProgressPreference = "SilentlyContinue"
$FromFolder = "$Env:USERPROFILE\Documents\Tencent Files\FileRecv"
$DistFolder = "$Env:USERPROFILE\Documents\bilibiliweek\ranking"
$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7)

Copy-Item -Path "$($FromFolder)\op_2.png" -Destination "$($DistFolder)\1_op\" -Force
Copy-Item -Path "$($FromFolder)\start.png" -Destination "$($DistFolder)\1_op\" -Force
Copy-Item -Path "$($FromFolder)\world.png" -Destination "$($DistFolder)\1_op\" -Force
Copy-Item -Path "$($FromFolder)\history_record.png" -Destination "$($DistFolder)\pic\" -Force
Copy-Item -Path "$($FromFolder)\over.png" -Destination "$($DistFolder)\pic\" -Force
Copy-Item -Path "$($FromFolder)\rule_2.png" -Destination "$($DistFolder)\pic\" -Force
Copy-Item -Path "$($FromFolder)\$($RankNum)_*.yml" -Destination "$($DistFolder)\list1\" -Force
