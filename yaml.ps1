Import-Module powershell-yaml

$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7)
$FromFolder = "$Env:USERPROFILE\Documents\Tencent Files\FileRecv"
$DistFolder = "$Env:USERPROFILE\Documents\bilibiliweek\ranking"

Expand-Archive -Path "$($FromFolder)\$($RankNum)json.zip" -DestinationPath "$($DistFolder)\..\" -Force

function MakeYaml {
    param (
        [parameter(position = 1)]$FileName,
        [parameter(position = 2)]$MaxRank,
        [parameter(position = 3)]$MinRank,
        [parameter(position = 4)]$YamlPart
    )
    $Yaml = @()
    $Json = Get-Content ".\$($RankNum)_$($FileName).json" | ConvertFrom-Json
    $rankfrom = $Json[0].rank_from
    $Json | ForEach-Object {
        if (($null -ne $_.wid) -and ($_.sp_type_id -ne 2)) {
            $rank = $_.score_rank
            if (($YamlPart -eq 7) -or ($YamlPart -eq 11)){
                $rank = $_.rank
            }
            $name = "av$($_.wid)"
            $length = 20
            if (($YamlPart -eq 7) -or ($YamlPart -eq 11) -or ($YamlPart -eq 15)){
                $length = 15
            }
            if ($YamlPart -eq 16){
                $length = 30
            }
            if ($_.changqi) {
                $length -= 10
            }
            if ($rankfrom -le $MaxRank){
                $MaxRank = $rankfrom
            }
            if (($rank -le $MaxRank) -and ($rank -ge $MinRank)) {
                $Yaml += [ordered]@{":rank" = $rank; ":name" = $name; ":length" = $length; ":offset" = 0 }
            }
        }
    }
    $Yaml | Sort-Object -Descending -Property @{Expression = ":rank"}| ConvertTo-YamL -OutFile "$($DistFolder)\list1\$($RankNum)_$($YamlPart).yml" -Force
}

MakeYaml "results" 99 21 5
MakeYaml "results" 20 11 9
MakeYaml "results" 10 4 13
MakeYaml "results" 3 1 16
MakeYaml "guoman_bangumi" 3 1 7
MakeYaml "results_bangumi" 10 1 11
MakeYaml "results_history" 5 1 15