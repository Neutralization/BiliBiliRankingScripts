$ProgressPreference = 'SilentlyContinue'
$FromFolder = 'FileRecv'
$DistFolder = 'bilibiliweek\ranking'
$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7)

Expand-Archive -Path "$($FromFolder)\$($RankNum)history.zip" -DestinationPath "$($DistFolder)\list1" -Force
Expand-Archive -Path "$($FromFolder)\$($RankNum)other.zip" -DestinationPath "$($DistFolder)\pic" -Force
Expand-Archive -Path "$($FromFolder)\$($RankNum)主榜.zip" -DestinationPath "$($DistFolder)\list1" -Force
Expand-Archive -Path "$($FromFolder)\$($RankNum)副榜.zip" -DestinationPath "$($DistFolder)\list2" -Force
Move-Item -Path "$($DistFolder)\list2\tv_*.png" -Destination "$($DistFolder)\list3\" -Force
Move-Item -Path "$($DistFolder)\list2\bangumi_*.png" -Destination "$($DistFolder)\list4\" -Force
Move-Item -Path "$($DistFolder)\list2\bangumi_*.png" -Destination "$($DistFolder)\list4\" -Force
Move-Item -Path "$($DistFolder)\pic\title.png" -Destination "$($DistFolder)\1_op\" -Force

Copy-Item -Path "$($FromFolder)\op_2.png" -Destination "$($DistFolder)\1_op\" -Force
Copy-Item -Path "$($FromFolder)\start.png" -Destination "$($DistFolder)\1_op\" -Force
Copy-Item -Path "$($FromFolder)\world.png" -Destination "$($DistFolder)\1_op\" -Force

Copy-Item -Path "$($FromFolder)\history_record.png" -Destination "$($DistFolder)\pic\" -Force
Copy-Item -Path "$($FromFolder)\over.png" -Destination "$($DistFolder)\pic\" -Force
Copy-Item -Path "$($FromFolder)\rule_2.png" -Destination "$($DistFolder)\pic\" -Force

Copy-Item -Path "$($FromFolder)\$($RankNum)_*.yml" -Destination "$($DistFolder)\list1\" -Force