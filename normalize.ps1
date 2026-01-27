param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = $null
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$DownloadFolder = "$($TruePath)/ranking/list0"
$FootageFolder = "$($TruePath)/ranking/list1"

$tmp = Start-Process -NoNewWindow -Wait -PassThru -FilePath 'ffmpeg.exe' -ArgumentList '-loglevel error -f lavfi -i color=black:s=1920x1080 -vframes 1 -an -c:v h264_nvenc -f null -' -RedirectStandardError '.\NUL'
if ($tmp.ExitCode -eq 0 ) { $Nvdia = $true } else { $Nvdia = $false }
$tmp = Start-Process -NoNewWindow -Wait -PassThru -FilePath 'ffmpeg.exe' -ArgumentList '-loglevel error -f lavfi -i color=black:s=1920x1080 -vframes 1 -an -c:v h264_qsv -f null -' -RedirectStandardError '.\NUL'
if ($tmp.ExitCode -eq 0 ) { $Intel = $true } else { $Intel = $false }
$Encoder = if ($Nvdia) { 'h264_nvenc' } else { if ($Intel) { 'h264_qsv' } else { 'libx264' } }
$LostVideos = @()
(Get-Content "$($TruePath)/LostFile.json" | ConvertFrom-Json).psobject.Properties.Name | ForEach-Object {
    $LostVideos += $_
}

function Normalize {
    param (
        [parameter(position = 1)]$Rank,
        [parameter(position = 2)]$FileName,
        [parameter(position = 3)]$Offset,
        [parameter(position = 4)]$Length
    )
    if ($LostVideos -contains $FileName) {
        Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($FileName) 视频已失效，生成占位视频"
        $fakeArgs = @(
            '-n', '-hide_banner',
            '-t', "$($Length)",
            '-f', 'lavfi', '-i', 'anullsrc',
            '-f', 'lavfi', '-i', "smptebars=duration=$($Length):size=1280x720:rate=1",
            '-vf', "drawtext=fontfile='C\:/Windows/Fonts/msyh.ttc':fontsize=100:fontcolor=black:x=(w-text_w)/2:y=(h-text_h)/2:text='$($FileName)'",
            "$($FootageFolder)/$($Rank)_$($FileName).mp4"
        )
        & ffmpeg.exe @fakeArgs 2> $null
        return $null
    }
    $Target = 'loudnorm=I=-23.0:LRA=+7.0:tp=-1.0'
    $Length = $Length + 5
    $AudioArg = @(
        '-y', '-hide_banner',
        '-ss', "$($Offset)",
        '-t', "$($Length)",
        '-i', "$($DownloadFolder)/$($FileName).mp4",
        '-af', "$($Target):print_format=json",
        '-f', 'null', '-'
    )
    $AudioInfo = "$($DownloadFolder)/$($FileName).log"
    & ffmpeg.exe $AudioArg 2> $AudioInfo
    $AudioData = [Regex]::Match((Get-Content -Raw $AudioInfo), '(?s)({.+?})\r?\n').Value | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    $VideoArg = @(
        '-y', '-hide_banner', '-loglevel', 'error',
        '-ss', "$($Offset)",
        '-t', "$($Length)",
        '-i', "$($DownloadFolder)/$($FileName).mp4 "
        '-vf', "scale='ceil((min(1,gt(iw,1920)+gt(ih,1080))*(gte(a,1920/1080)*1920+lt(a,1920/1080)*((1080*iw)/ih))+not(min(1,gt(iw,1920)+gt(ih,1080)))*iw)/2)*2:ceil((min(1,gt(iw,1920)+gt(ih,1080))*(lte(a,1920/1080)*1080+gt(a,1920/1080)*((1920*ih)/iw))+not(min(1,gt(iw,1920)+gt(ih,1080)))*ih)/2)*2'"
        '-af', "$($Target):print_format=summary:linear=true:$($Source)", '-ar', '48000'
        '-c:v', "$($Encoder)", '-b:v', '10M',
        '-c:a', 'aac', '-b:a', '320k', '-r', '60',
        "$($FootageFolder)/$($Rank)_$($FileName).mp4"
    )
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($FileName) 截取视频并标准化音频音量" -ForegroundColor Green
    & ffmpeg.exe @VideoArg 2> $null
}


function EDNormalize {
    param (
        [parameter(position = 1)]$FileName
    )
    $Target = 'loudnorm=I=-23.0:LRA=+7.0:tp=-1.0'
    $AudioArg = @(
        '-y', '-hide_banner',
        '-i', "./ranking/2_ed/$($FileName)",
        '-af', "$($Target):print_format=json",
        '-f', 'null', '-'
    )
    $AudioInfo = './ranking/2_ed/ed.log'
    & ffmpeg.exe $AudioArg 2> $AudioInfo
    $AudioData = [Regex]::Match((Get-Content -Raw $AudioInfo), '(?s)({.+?})\r?\n').Value | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    $EncodeArg = @(
        '-y', '-hide_banner', '-loglevel', 'error',
        '-i', "./ranking/2_ed/$($FileName)",
        '-i', './ranking/2_ed/Cover.jpg',
        '-map', '0:0', '-map', '1:0',
        '-id3v2_version', '3',
        '-metadata:s:v', "title='Album cover'", '-metadata:s:v', "comment='Cover (front)'",
        '-af', "$($Target):print_format=summary:linear=true:$($Source)", '-ar', '48000',
        '-c:a', 'libmp3lame', '-q:a', '0',
        './ranking/2_ed/ed.mp3'
    )
    Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($FileName) 标准化音频音量" -ForegroundColor Green
    & ffmpeg.exe @EncodeArg 2> $null
}

function Main {
    Import-Module powershell-yaml
    $Files = @()
    $LocalVideos = @()
    $RankVideos = @()
    if ($null -eq $Part) {
        Get-ChildItem "$($FootageFolder)/*.mp4" | ForEach-Object { $LocalVideos += $_.BaseName }
    }
    $Part = if ($null -ne $Part) { $Part } else { @('*') }
    foreach ($p in $Part) {
        $Files += Get-Content -Raw "$($FootageFolder)/$($RankNum)_$($p).yml"
    }
    
    foreach ($content in $Files) {
        $items = (ConvertFrom-Yaml $content) | ForEach-Object { $_ } | ForEach-Object { $_ }
        $RankVideos += $items
    }

    $normalizeDef = ${Function:Normalize}.ToString()
    $RankVideos | ForEach-Object -ThrottleLimit 4 -Parallel {
        $rank = $_.':rank'.ToString().PadLeft(2, '0')
        $name = $_.':name'
        $offset = $_.':offset'
        $length = [int]$_.':length'
        $video = "$($rank)_$($name)"
        $FootageFolder = $using:FootageFolder
        $DownloadFolder = $using:DownloadFolder
        $LocalVideos = $using:LocalVideos
        $LostVideos = $using:LostVideos
        $Encoder = $using:Encoder
        if (($LocalVideos -notcontains $video) -or ((Get-Item "$($FootageFolder)/$($video).mp4").length -eq 0)) {
            ${Function:Normalize} = [ScriptBlock]::Create($using:normalizeDef)
            Normalize $rank $name $offset $length
        } else {
            Write-Host "$(Get-Date -Format 'MM/dd HH:mm:ss') - $($name) 已存在，跳过处理" -ForegroundColor Green
        }
    }
    Add-Type -AssemblyName Microsoft.VisualBasic
    Get-ChildItem "$($DownloadFolder)/*.log" | ForEach-Object {
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($_)", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
    $EDFile = Get-ChildItem -Path './ranking/2_ed/*' -Include *.mp3, *.flac | Where-Object Name -NotMatch 'ed.mp3' | Select-Object -ExpandProperty Name
    if ($null -ne $EDFile ) {
        EDNormalize $EDFile
        [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
            "$($TruePath)/ranking/2_ed/$($EDFile)", 'OnlyErrorDialogs', 'SendToRecycleBin')
    }
}

Main