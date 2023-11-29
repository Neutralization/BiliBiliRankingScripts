param (
    [string]$RankNum = [Math]::Round(((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809) / 3600 / 24 / 7),
    [array]$Part = @('*')
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "$($TruePath)/ranking/list0"
$FootageFolder = "$($TruePath)/ranking/list1"

if (Test-Path -Path 'C:/Windows/System32/nvcuvid.dll') { $Nvdia = $true } else { $Nvdia = $false }
if ((WMIC CPU Get Name) -match 'Intel') { $Intel = $true } else { $Intel = $false }

function Normailze {
    param (
        [parameter(position = 1)]$FileName,
        [parameter(position = 2)]$Offset,
        [parameter(position = 3)]$Length
    )
    if (-Not(Test-Path "$($DownloadFolder)/$($FileName).mp4")) {
        Write-Host "$($FileName).mp4 Not Exist!" -ForegroundColor Red
        $FakeArg = "-n -hide_banner -t 40 -f lavfi -i anullsrc -f lavfi "`
            + "-i color=size=1280x720:duration=60:rate=60:color=AntiqueWhite "`
            + "-vf drawtext=fontfile=MiSans-Medium.ttf:fontsize=147:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='$($FileName)' "`
            + "$($FootageFolder)/$($FileName).mp4"
        Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $FakeArg
        return $null
    }
    $Target = 'loudnorm=I=-23.0:LRA=+7.0:tp=-1.0'
    $Length = $Length + 5
    $AudioArg = "-y -hide_banner -ss $($Offset) -t $($Length) -i $($DownloadFolder)/$($FileName).mp4 -af $($Target):print_format=json -f null -"
    $AudioInfo = "$($DownloadFolder)/$($FileName).log"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -RedirectStandardError $AudioInfo -ArgumentList $AudioArg
    $AudioData = Get-Content -Path $AudioInfo | Select-Object -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    Write-Host "ffmpeg -af 'measured_I=$($AudioData.input_i):LRA=$($AudioData.input_lra):tp=$($AudioData.input_tp)' -> '$($Target)'" -ForegroundColor Blue
    Write-Host "ffmpeg -ss $($Offset) -t $($Length) -i $($FileName).mp4" -ForegroundColor Green
    if ($Nvdia) {
        # Nvidia CUDA
        $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) "`
            + "-hwaccel_output_format cuda -c:v h264_cuvid "`
            + "-i $($DownloadFolder)/$($FileName).mp4 "`
            + "-vf scale='ceil((min(1,gt(iw,1920)+gt(ih,1080))*(gte(a,1920/1080)*1920+lt(a,1920/1080)*((1080*iw)/ih))+not(min(1,gt(iw,1920)+gt(ih,1080)))*iw)/2)*2:ceil((min(1,gt(iw,1920)+gt(ih,1080))*(lte(a,1920/1080)*1080+gt(a,1920/1080)*((1920*ih)/iw))+not(min(1,gt(iw,1920)+gt(ih,1080)))*ih)/2)*2' "`
            + "-af $($Target):print_format=summary:linear=true:$($Source) -ar 48000 "`
            + "-c:v h264_nvenc -b:v 10M -c:a aac -b:a 320k -r 60 $($FootageFolder)/$($FileName).mp4"
    } elseif ($Intel) {
        # Intel QSV
        $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) "`
            + "-init_hw_device qsv=hw -filter_hw_device hw "`
            + "-i $($DownloadFolder)/$($FileName).mp4 "`
            + "-vf hwupload=extra_hw_frames=64,format=qsv "`
            + "-vf scale='ceil((min(1,gt(iw,1920)+gt(ih,1080))*(gte(a,1920/1080)*1920+lt(a,1920/1080)*((1080*iw)/ih))+not(min(1,gt(iw,1920)+gt(ih,1080)))*iw)/2)*2:ceil((min(1,gt(iw,1920)+gt(ih,1080))*(lte(a,1920/1080)*1080+gt(a,1920/1080)*((1920*ih)/iw))+not(min(1,gt(iw,1920)+gt(ih,1080)))*ih)/2)*2' "`
            + "-af $($Target):print_format=summary:linear=true:$($Source) -ar 48000 "`
            + "-c:v h264_qsv -b:v 10M -c:a aac -b:a 320k -r 60 $($FootageFolder)/$($FileName).mp4"
    } else {
        # x264
        $VideoArg = "-y -hide_banner -loglevel error -ss $($Offset) -t $($Length) "`
            + "-i $($DownloadFolder)/$($FileName).mp4 "`
            + "-vf scale='ceil((min(1,gt(iw,1920)+gt(ih,1080))*(gte(a,1920/1080)*1920+lt(a,1920/1080)*((1080*iw)/ih))+not(min(1,gt(iw,1920)+gt(ih,1080)))*iw)/2)*2:ceil((min(1,gt(iw,1920)+gt(ih,1080))*(lte(a,1920/1080)*1080+gt(a,1920/1080)*((1920*ih)/iw))+not(min(1,gt(iw,1920)+gt(ih,1080)))*ih)/2)*2' "`
            + "-af $($Target):print_format=summary:linear=true:$($Source) -ar 48000 "`
            + "-c:v libx264 -b:v 10M -c:a aac -b:a 320k -r 60 $($FootageFolder)/$($FileName).mp4"
    }
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $VideoArg
    Write-Host "$($FileName) Finish!" -ForegroundColor White
}


function EDNormalize {
    param (
        [parameter(position = 1)]$FileName
    )
    $Target = 'loudnorm=I=-23.0:LRA=+7.0:tp=-1.0'
    $AudioArg = "-y -hide_banner -i ""./ranking/2_ed/$($FileName).mp3"" -af $($Target):print_format=json -f null -"
    $AudioInfo = "./ranking/2_ed/ed.log"
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -RedirectStandardError $AudioInfo -ArgumentList $AudioArg
    $AudioData = Get-Content -Path $AudioInfo | Select-Object -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    Write-Host "ffmpeg -i ""./ranking/2_ed/$($FileName).mp3"" "`
        + "-af 'measured_I=$($AudioData.input_i):LRA=$($AudioData.input_lra):tp=$($AudioData.input_tp)' -> '$($Target)'" -ForegroundColor Blue
    $VideoArg = "-y -hide_banner -loglevel error -i ""./ranking/2_ed/$($FileName).mp3"" "`
        + "-af $($Target):print_format=summary:linear=true:$($Source) -ar 48000 "`
        + "-c:a libmp3lame -q:a 0 ""./ranking/2_ed/ed.mp3"""
    Start-Process -NoNewWindow -Wait -FilePath 'ffmpeg.exe' -ArgumentList $VideoArg
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $LocalVideos = @()
    $RankVideos = @()
    if ($Part.Contains('*')) {
        $Files = Get-Content -Raw "$($FootageFolder)/$($RankNum)_*.yml"
        Get-ChildItem "$($FootageFolder)/*.mp4" | ForEach-Object { $LocalVideos += $_.BaseName }
    } else {
        $Part | ForEach-Object {
            $Files += Get-Content -Raw "$($FootageFolder)/$($RankNum)_$($_).yml"
        }
    }
    $Files | ForEach-Object {
        ConvertFrom-Yaml $_ | ForEach-Object {
            $_ | ForEach-Object {
                $RankVideos += @{n = $_.':name'; o = $_.':offset'; l = $_.':length' }
            }
        }
    }
    $RankVideos | ForEach-Object {
        if ($Part.Contains('*')) {
            if ($LocalVideos -notcontains $_.n) {
                Normailze $_.n $_.o $_.l
            } elseif ((Get-Item "$($FootageFolder)/$($_.n).mp4").length -eq 0) {
                Normailze $_.n $_.o $_.l
            } else {
                Write-Host "$($_.n) Already Normalized." -ForegroundColor Yellow
            }
        } else {
            Normailze $_.n $_.o $_.l
        }
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    Get-ChildItem "$($DownloadFolder)/*.log" | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    $EDFile = Get-ChildItem -Path "./ranking/2_ed/*.mp3" | Where-Object BaseName -NotMatch 'ed' | Select-Object -ExpandProperty BaseName
    if ($null -ne $EDFile ) {
        EDNormalize $EDFile
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "./ranking/2_ed/$($EDFile).mp3", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
}

Main