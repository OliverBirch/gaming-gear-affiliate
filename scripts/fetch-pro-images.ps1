# Download pro player images from prosettings.net CDN
# Tries multiple URL patterns per player

$ErrorActionPreference = "Continue"
$publicDir = "public\images\pros"

$slugs = @(
    "nilo","snow","biguzera","woro2k","calyx","mzinho","electronic",
    "adamb","arrozdoce","pr1metapz","spooke","gr1ks","snappi","n0te",
    "fear","br4tko","maden","jackasmo","jambo","cairne","latto","dumau",
    "n1ssim","laser","atarax1a","doc-cs","gafolo","koala","rdnzao","maxxkor",
    "ksloks","wood7","naitte","righi","pancc","fame","nafany","artfr0st","belchonokk",
    "cauanzin","virtyy","davih","tkzin","lukxo","al0rante","seven","qpert",
    "grubinho","westside","ara","flickless"
)

function Try-Download($slug, $url, $outPath) {
    try {
        $req = [System.Net.WebRequest]::Create($url)
        $req.UserAgent = "Mozilla/5.0"
        $req.Timeout = 10000
        $resp = $req.GetResponse()
        $len = $resp.ContentLength
        if ($len -gt 1000) {
            $stream = $resp.GetResponseStream()
            $fileStream = [System.IO.File]::Create($outPath)
            $stream.CopyTo($fileStream)
            $fileStream.Close()
            $stream.Close()
            $resp.Close()
            return $true
        }
        $resp.Close()
        return $false
    } catch {
        return $false
    }
}

foreach ($slug in $slugs) {
    $outPath = Join-Path $publicDir "$slug.png"
    if (Test-Path $outPath) {
        Write-Host "SKIP $slug (already exists)"
        continue
    }
    
    $success = $false
    
    # Pattern 1: {slug}-220x220-fitcontain-q99-gb283-s1.png
    $url = "https://prosettings.net/wp-content/uploads/${slug}-220x220-fitcontain-q99-gb283-s1.png"
    if (Try-Download $slug $url $outPath) {
        Write-Host "OK   $slug (pattern 1)"
        continue
    }
    
    # Pattern 2: {slug}-1-220x220-fitcontain-q99-gb283-s1.png
    $url = "https://prosettings.net/wp-content/uploads/${slug}-1-220x220-fitcontain-q99-gb283-s1.png"
    if (Try-Download $slug $url $outPath) {
        Write-Host "OK   $slug (pattern 2)"
        continue
    }
    
    # Pattern 3: {slug}.png
    $url = "https://prosettings.net/wp-content/uploads/${slug}.png"
    if (Try-Download $slug $url $outPath) {
        Write-Host "OK   $slug (pattern 3)"
        continue
    }
    
    Write-Host "FAIL $slug (all patterns exhausted)"
}
