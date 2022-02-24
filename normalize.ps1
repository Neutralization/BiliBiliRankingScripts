param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$Part = @("*")
)
$ProgressPreference = "SilentlyContinue"

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
    $Files = @()
    $LocalVideos = @()
    $RankVideos = @()
    if ($Part.Contains("*")) {
        $Files = Get-Content -Raw "./ranking/list1/$($RankNum)_*.yml"
        Get-ChildItem "./ranking/list1/*.mp4" | ForEach-Object { $LocalVideos += $_.BaseName }
    }
    else {
        $Part | ForEach-Object {
            $Files += Get-Content -Raw "./ranking/list1/$($RankNum)_$($_).yml"
        }
    }
    $Files | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += @{n = $_.":name"; o = $_.":offset"; l = $_.":length" }
            }
        }
    }
    $RankVideos | ForEach-Object {
        if ($Part.Contains("*")) {
            if ($LocalVideos -notcontains $_.n) {
                Normailze $_.n $_.o $_.l
            }
            else {
                Write-Host "$($_.n) Already Normalized." -ForegroundColor Yellow
            }
        }
        else {
            Normailze $_.n $_.o $_.l
        }
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    Get-ChildItem "./ranking/list0/*.log" | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", "OnlyErrorDialogs", "SendToRecycleBin")
    }
}

Main