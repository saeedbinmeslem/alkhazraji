Add-Type -AssemblyName System.Drawing

$source = "d:\my-projects\alkhazraji store\khazraji.png"
$img = [System.Drawing.Image]::FromFile($source)

function Resize-Image {
    param(
        [string]$dest,
        [int]$width,
        [int]$height
    )
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
}

$sizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

$apps = @("Alkhazraji", "Dashbaord")

foreach ($app in $apps) {
    foreach ($size in $sizes.GetEnumerator()) {
        $dir = "$app\android\app\src\main\res\$($size.Name)"
        if (Test-Path $dir) {
            $w = $size.Value
            $h = $size.Value
            Resize-Image -dest "$dir\ic_launcher.png" -width $w -height $h
            Resize-Image -dest "$dir\ic_launcher_round.png" -width $w -height $h
            Resize-Image -dest "$dir\ic_launcher_foreground.png" -width $w -height $h
        }
    }
}

$img.Dispose()
