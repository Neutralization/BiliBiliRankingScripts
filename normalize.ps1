param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$part = "*"
)

function Normailze {
    param (
        [parameter(position = 1)]$FileName,
        [parameter(position = 2)]$Offset,
        [parameter(position = 3)]$Length
    )
    if (-Not(Test-Path "./ranking/list0/$($FileName).mp4")) {
        Write-Host "$($FileName).mp4 Not Exist!" -ForegroundColor Red
        return $null
    }
    $Target = "loudnorm=I=-12.0:LRA=+7.0:tp=-2.0"
    $Length = $Length + 5
    $AudioArg = "-y -hide_banner -ss $($Offset) -t $($Length) -i ./ranking/list0/$($FileName).mp4 -af $($Target):print_format=json -f null -"
    $AudioInfo = "./ranking/list0/$($FileName).log"
    Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -RedirectStandardError $AudioInfo -ArgumentList $AudioArg
    $AudioData = Get-Content -Path $AudioInfo | Select-Object -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    Write-Host "ffmpeg -af 'measured_I=$($AudioData.input_i):LRA=$($AudioData.input_lra):tp=$($AudioData.input_tp)' -> '$($Target)'" -ForegroundColor Blue
    Write-Host "ffmpeg -ss $($Offset) -t $($Length) -i $($FileName).mp4" -ForegroundColor Green
    # Nvidia CUDA
    $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) -vsync cfr -hwaccel_output_format cuda -c:v h264_cuvid -i ./ranking/list0/$($FileName).mp4 -af $($Target):print_format=summary:linear=true:$($Source) -b:v 20M -ar 48000 -c:v h264_nvenc -c:a aac ./ranking/list1/$($FileName).mp4"
    # Intel Quick Sync
    # $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) -init_hw_device qsv=hw -filter_hw_device hw -hwaccel_output_format qsv -i ./ranking/list0/$($FileName).mp4 -af $($Target):print_format=summary:linear=true:$($Source) -b:v 20M -ar 48000 -c:v h264_qsv -c:a aac ./ranking/list1/$($FileName).mp4"
    # CPU
    # $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) -i ./ranking/list0/$($FileName).mp4 -af $($Target):print_format=summary:linear=true:$($Source) -b:v 20M -ar 48000 -c:v libx264 -c:a aac ./ranking/list1/$($FileName).mp4"
    Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -ArgumentList $VideoArg
    Write-Host "$($FileName) Finish!" -ForegroundColor White
}

function Main {
    Import-Module powershell-yaml 
    $part | ForEach-Object {
        $p = $_
        Get-ChildItem "./ranking/list1/$($RankNum)_$($p).yml" | ForEach-Object {
            [string[]]$FileContent = Get-Content $_
            $YamlContent = ""
            $FileContent | ForEach-Object {
                $YamlContent = $YamlContent + "`n" + $_
            }
            $ExistVideos = @()
            if ($p -eq '*') {
                Get-Item "./ranking/list1/*.mp4" | ForEach-Object { $ExistVideos += $_.BaseName }
            }
            $Call = $function:Normailze.ToString()
            ConvertFrom-Yaml $YamlContent | ForEach-Object {
                $_ | ForEach-Object -Parallel {
                    $function:Normailze = $using:Call
                    if ($using:ExistVideos -notcontains $_.":name") {
                        Normailze $_.":name" $_.":offset" $_.":length"
                    }
                } -ThrottleLimit 1
            }
        }
    }
    Remove-Item "./ranking/list0/*.log"
}

Main