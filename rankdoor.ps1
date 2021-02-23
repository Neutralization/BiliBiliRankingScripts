Import-Module powershell-yaml

$ProgressPreference = 'SilentlyContinue'

$ABDict = @{}
$VideoNames = @{}
$Contents = @()
$RankParts = [ordered]@{
    3 = 'Pickup'; 5 = '主榜'; 9 = '主榜'; 13 = '主榜'; 16 = '主榜'; 15 = '历史'; 7 = '国创'; 11 = '番剧'
}

$RankParts.Keys | ForEach-Object {
    $Part = $_
    Get-ChildItem ".\ranking\list1\*_$($Part).yml" | ForEach-Object {
        [string[]]$FileContent = Get-Content $_
        $YamlContent = ''
        $FileContent | ForEach-Object {
            $YamlContent = $YamlContent + "`n" + $_
        }
        ConvertFrom-Yaml $YamlContent | ForEach-Object {
            $_ | ForEach-Object {
                $VideoNames[$_.':name'] = @{NAME = $_.':name'; RANK = $_.':rank'; PART = $Part }
            }
        }
    }
}

$VideoNames.Keys | ForEach-Object -Parallel {
    $Out = $using:VideoNames
    $AID = $Out.$_.NAME
    $Info = $using:ABDict
    $URL = "https://api.bilibili.com/x/web-interface/view?aid=$($_.Substring(2))"
    $VideoData = (Invoke-WebRequest -Uri $URL).Content | ConvertFrom-Json
    $Info[$AID] = @{
        BVID  = $VideoData.data.bvid;
        TITLE = $VideoData.data.title;
        RANK  = $Out.$_.RANK -as [int];
        PART  = $Out.$_.PART -as [int]
    }
}

$RankParts.Keys | ForEach-Object {
    if (@(3, 5, 7, 13, 11, 15).Contains($_)) {
        $Contents += @{PART = $_; RANK = $RankParts.$_; BVID = ""; TITLE = "" } | Select-Object -Property RANK, BVID, TITLE | Sort-Object -Property @{Expression = "PART"; Descending = $True }, @{Expression = "RANK"; Descending = $True }
    }
    $Contents += $ABDict.Values | Where-Object PART -EQ $_ | Select-Object -Property RANK, BVID, TITLE | Sort-Object -Property @{Expression = "PART"; Descending = $True }, @{Expression = "RANK"; Descending = $True }
}
$Contents | ConvertTo-Csv | Select-Object -Skip 1 | Out-File -Encoding "utf8BOM" -FilePath .\rankdoor.csv