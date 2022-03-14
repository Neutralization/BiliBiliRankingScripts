Import-Module powershell-yaml

function Normailze {
    param (
        [parameter(position = 1)]$FileName,
        [parameter(position = 2)]$Offset,
        [parameter(position = 3)]$Length,
        [parameter(position = 4)]$RankNum
    )
    $Target = 'loudnorm=I=-12.0:LRA=+7.0:tp=-2.0'
    $Length = $Length + 5
    $RankNum = 601 - $RankNum
    $AudioArg = "-y -hide_banner -ss $($Offset) -t $($Length) -i .\ranking\list100\$($FileName).mp4 -af $($Target):print_format=json -f null -"
    $AudioInfo = ".\ranking\list100\$($FileName).log"
    Write-Host "$($FileName) Audio Analyzing......"
    Write-Host "ffmpeg.exe $($AudioArg)"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -RedirectStandardError $AudioInfo -ArgumentList $AudioArg
    $AudioData = Get-Content -Path $AudioInfo | Select-Object -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    # Nvidia CUDA
    $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) -vsync cfr -hwaccel_output_format cuda -c:v h264_cuvid -i .\ranking\list100\$($FileName).mp4 -af $($Target):print_format=summary:linear=true:$($Source) -b:v 20M -ar 48000 -c:v h264_nvenc -c:a aac .\ranking\list100\$($RankNum)_$($FileName).mp4"

    Write-Host "$($FileName) Volume Normalizing......"
    Write-Host "ffmpeg.exe $($VideoArg)"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $VideoArg
}

function Main {
    Get-ChildItem '.\ranking\list100\100.yml' | ForEach-Object {
        [string[]]$FileContent = Get-Content $_
        $YamlContent = ''
        $FileContent | ForEach-Object {
            $YamlContent = $YamlContent + "`n" + $_
        }

        $ExistVideos = @()
        Get-Item '.\ranking\list100\*.mp4' | ForEach-Object { $ExistVideos += $_.BaseName }
        $Call = $function:Normailze.ToString()
        ConvertFrom-Yaml $YamlContent | ForEach-Object {
            $_ | ForEach-Object -Parallel {
                $function:Normailze = $using:Call
                if ($using:ExistVideos -notcontains "$(601 - $_.':rank')_$($_.':name')") {
                    # Write-Host $_.":name"
                    Normailze $_.':name' $_.':offset' $_.':length' $_.':rank'
                }
            } -ThrottleLimit 2
        }
    }
    Remove-Item '.\ranking\list100\*.log'
}

Main
