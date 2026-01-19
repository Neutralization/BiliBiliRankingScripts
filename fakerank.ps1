param (
    [string]$RankNum = [Math]::Floor(
        ((Get-Date).ToFileTime() / 10000000 - 11644473600 - 1277009809 + 133009) / 3600 / 24 / 7),
    [array]$Part = @('*')
)
$ProgressPreference = 'SilentlyContinue'
$TruePath = Split-Path $MyInvocation.MyCommand.Path
$FootageFolder = "$($TruePath)/ranking/list1"

Import-Module powershell-yaml
$Files = Get-Content -Raw "$($FootageFolder)/$($RankNum)_*.yml"
$Files | ForEach-Object {
    ConvertFrom-Yaml $_ | ForEach-Object {
        $jobs = @()
        $_ | ForEach-Object {
            $rank = $_.':rank'.ToString().PadLeft(2, '0')
            if (-not (Test-Path -LiteralPath "$($FootageFolder)/$($rank)_$($_.':name').png")) {
                Copy-Item './footage/MAINRANKIMG.png' "$($FootageFolder)/$($rank)_$($_.':name').png"
            }
            if ([int]$_.':length' -ge 30) {
                if (-not (Test-Path -LiteralPath "$($FootageFolder)/$($rank)_$($_.':name')_.png")) {
                    Copy-Item './footage/TOPIMG.png' "$($FootageFolder)/$($rank)_$($_.':name')_.png"
                }
            }
            $FakeArg = -join @(
                "-n -hide_banner -t $($_.':length') -f lavfi -i anullsrc -f lavfi "
                "-i smptebars=duration=$($_.':length'):size=1280x720:rate=1 "
                "-vf drawtext=fontfile=C\\:\\\\Windows\\\\Fonts\\\\msyh.ttc:fontsize=100:fontcolor=black:x=(w-text_w)/2:y=(h-text_h)/2:text=$($rank)_$($_.':name') "
                "$($FootageFolder)/$($rank)_$($_.':name').mp4"
            )
            Write-Debug "ffmpeg $($FakeArg)"
            $jobs += Start-ThreadJob -Name "$($_.':name')" -ArgumentList 'ffmpeg.exe', $FakeArg -ScriptBlock {
                param($ffmpegExe, $ffmpegArgs)
                Start-Process -NoNewWindow -Wait -FilePath $ffmpegExe -ArgumentList $ffmpegArgs -RedirectStandardError '.\NUL'
            }
        }
        Wait-Job -Job $jobs
        Remove-Job -Job $jobs
    }
}