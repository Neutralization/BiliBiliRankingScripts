Import-Module powershell-yaml

function Normailze {
    param (
        [parameter(position = 1)]$FileName,
        [parameter(position = 2)]$Offset,
        [parameter(position = 3)]$Length,
        [parameter(position = 4)]$RankNum
    )
    if (-Not(Test-Path "./ranking/list100/$($FileName).mp4")) {
        Write-Host "$($FileName).mp4 Not Exist!" -ForegroundColor Red
        $FakeArg = "-n -hide_banner -t 40 -f lavfi -i anullsrc -f lavfi "`
            + "-i color=size=1280x720:duration=60:rate=60:color=AntiqueWhite "`
            + "-vf drawtext=fontfile=MiSans-Medium.ttf:fontsize=147:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='$($FileName)' "`
            + "./ranking/list100/$($RankNum)_$($FileName).mp4"
        Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $FakeArg
        return $null
    }
    $Target = 'loudnorm=I=-12.0:LRA=+7.0:tp=-2.0'
    $Length = $Length + 5
    $AudioArg = "-y -hide_banner -ss $($Offset) -t $($Length) -i ./ranking/list100/$($FileName).mp4 -af $($Target):print_format=json -f null -"
    $AudioInfo = "./ranking/list100/$($FileName).log"
    Write-Host "$($FileName) Audio Analyzing......"
    Write-Host "ffmpeg.exe $($AudioArg)"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -RedirectStandardError $AudioInfo -ArgumentList $AudioArg
    $AudioData = Get-Content -Path $AudioInfo | Select-Object -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    # Nvidia CUDA
    $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) -vsync cfr -hwaccel_output_format cuda -c:v h264_cuvid -i ./ranking/list100/$($FileName).mp4 -vf scale='ceil((min(1,gt(iw,1920)+gt(ih,1080))*(gte(a,1920/1080)*1920+lt(a,1920/1080)*((1080*iw)/ih))+not(min(1,gt(iw,1920)+gt(ih,1080)))*iw)/2)*2:ceil((min(1,gt(iw,1920)+gt(ih,1080))*(lte(a,1920/1080)*1080+gt(a,1920/1080)*((1920*ih)/iw))+not(min(1,gt(iw,1920)+gt(ih,1080)))*ih)/2)*2' -af $($Target):print_format=summary:linear=true:$($Source) -ar 48000 -c:v h264_nvenc  -b:v 10M -c:a aac -b:a 320k -r 60 ./ranking/list100/$($RankNum)_$($FileName).mp4"

    Write-Host "$($FileName) Volume Normalizing......"
    Write-Host "ffmpeg.exe $($VideoArg)"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $VideoArg
}

function Main {
    Get-ChildItem './ranking/list100/700.yml' | ForEach-Object {
        [string[]]$FileContent = Get-Content $_
        $YamlContent = ''
        $FileContent | ForEach-Object {
            $YamlContent = $YamlContent + "`n" + $_
        }

        $ExistVideos = @()
        Get-Item './ranking/list100/*.mp4' | ForEach-Object { $ExistVideos += $_.BaseName }
        ConvertFrom-Yaml $YamlContent | ForEach-Object {
            $_ | ForEach-Object {
                if ($ExistVideos -notcontains "$($_.':rank')_$($_.':name')") {
                    # Write-Host $_.":name"
                    Normailze $_.':name' $_.':offset' $_.':length' $_.':rank'
                }
            }
        }
    }
    Remove-Item './ranking/list100/*.log'
}

Main
