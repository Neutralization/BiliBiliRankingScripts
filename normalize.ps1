Import-Module powershell-yaml

$VideoCutArgs = @()
$ThreadNums = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors

Get-ChildItem ".\ranking\list1\*.yml" | ForEach-Object {
    [string[]]$FileContent = Get-Content $_
    $YamlContent = ''
    $FileContent | ForEach-Object {
        $YamlContent = $YamlContent + "`n" + $_
    }
    ConvertFrom-Yaml $YamlContent | ForEach-Object {
        $_ | ForEach-Object {
            # $VideoCutArgs += "-y -hide_banner -ss $($_.':offset') -t $($_.':length') -i .\ranking\list0\$($_.':name').mp4 -c:v libx264 -c:a aac .\ranking\list0\cut_$($_.':name').mp4"
            $VideoCutArgs += "-y -hide_banner -ss $($_.':offset') -t $($_.':length') -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i .\ranking\list0\$($_.':name').mp4 -c:v h264_nvenc -c:a aac .\ranking\list0\cut_$($_.':name').mp4"
        }
    }
}

$VideoCutArgs | ForEach-Object -Parallel {
    Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -RedirectStandardError ".\ranking\list0\temp.log" -ArgumentList $_
} -ThrottleLimit 2 # Whem using GPU, should not be more than 2

Get-ChildItem ".\ranking\list0\cut_*.mp4" | ForEach-Object -Parallel {
    Write-Host "$($_.Basename.Substring($_.Basename.IndexOf("_")+1)) Volume Normalizing......"
    $Target = "loudnorm=I=-12.0:LRA=+7.0:tp=-2.0"
    $AudioArg_1 = "-y -hide_banner -i .\ranking\list0\$($_.Name) -pass 1 -af $($Target):print_format=json -f null -"
    $AudioInfo = ".\ranking\list0\$($_.Basename).log"
    Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -RedirectStandardError $AudioInfo -ArgumentList $AudioArg_1
    $AudioData = Get-Content -Path $AudioInfo | select -Last 12 | ConvertFrom-Json
    $Source = "measured_I=$($AudioData.input_i):measured_LRA=$($AudioData.input_lra):measured_tp=$($AudioData.input_tp):measured_thresh=$($AudioData.input_thresh):offset=$($AudioData.target_offset)"
    $AudioArg_2 = "-y -hide_banner -i .\ranking\list0\$($_.Name) -pass 2 -af $($Target):print_format=summary:linear=true:$($Source) -c:v copy -ar 48k .\ranking\list1\$($_.Basename.Substring($_.Basename.IndexOf("_")+1)).mp4"
    Start-Process -NoNewWindow -Wait -FilePath "ffmpeg.exe" -RedirectStandardError ".\ranking\list0\temp.log" -ArgumentList $AudioArg_2
} -ThrottleLimit $ThreadNums

Remove-Item "ffmpeg2pass-0.log"
Remove-Item ".\ranking\list0\*" -Include *.txt,*.log,cut_*.mp4