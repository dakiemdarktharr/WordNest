$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$installRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot 'outputs\installer-smoke'))
$outputRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot 'outputs')) + '\'
if (-not $installRoot.StartsWith($outputRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Test install path is outside workspace outputs.' }
$uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$existing = if (Test-Path -LiteralPath $uninstallKey) { Get-ChildItem -LiteralPath $uninstallKey | Where-Object { (Get-ItemProperty $_.PSPath).DisplayName -eq 'WordNest' } } else { @() }
if ($existing) { throw 'WordNest is already installed. Refusing to replace an existing user installation for testing.' }
$package = Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw | ConvertFrom-Json
$setup = Join-Path $repoRoot ('release\WordNest-Setup-' + $package.version + '-x64.exe')
if (-not (Test-Path -LiteralPath $setup -PathType Leaf)) { throw "Installer for version $($package.version) not found. Run npm run desktop:dist first." }
$installer = Start-Process -FilePath $setup -ArgumentList "/S /currentuser /D=$installRoot" -WindowStyle Hidden -PassThru -Wait
if ($installer.ExitCode -ne 0) { throw "Installer failed: $($installer.ExitCode)" }
$installedExe = Join-Path $installRoot 'WordNest.exe'
if (-not (Test-Path -LiteralPath $installedExe)) { throw 'Installer did not produce WordNest.exe.' }
$uninstaller = Join-Path $installRoot 'Uninstall WordNest.exe'
$priorExe = $env:WORDNEST_EXECUTABLE
try {
  $shell = New-Object -ComObject WScript.Shell
  $desktopShortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) 'WordNest.lnk'
  $startShortcut = Join-Path ([Environment]::GetFolderPath('Programs')) 'WordNest.lnk'
  foreach ($shortcut in @($desktopShortcut, $startShortcut)) {
    if (-not (Test-Path -LiteralPath $shortcut)) { throw "Missing shortcut: $shortcut" }
    if ($shell.CreateShortcut($shortcut).TargetPath -ne $installedExe) { throw "Wrong shortcut target: $shortcut" }
  }
  $env:WORDNEST_EXECUTABLE = $installedExe
  node (Join-Path $repoRoot 'scripts\desktop-smoke.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'Installed app smoke test failed.' }
  node (Join-Path $repoRoot 'scripts\journey-check.mjs') --desktop
  if ($LASTEXITCODE -ne 0) { throw 'Installed app vocabulary journey failed.' }
} finally {
  $env:WORDNEST_EXECUTABLE = $priorExe
  if (Test-Path -LiteralPath $uninstaller) {
    $uninstall = Start-Process -FilePath $uninstaller -ArgumentList '/S /currentuser' -WindowStyle Hidden -PassThru -Wait
    if ($uninstall.ExitCode -ne 0) { throw "Uninstaller failed: $($uninstall.ExitCode)" }
    $deadline = [DateTime]::UtcNow.AddSeconds(25)
    while ((Test-Path -LiteralPath $installedExe) -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 250 }
    if (Test-Path -LiteralPath $installedExe) { throw 'Uninstaller did not remove the test executable.' }
  }
}
@{ passed = $true; installer = $setup; installerExitCode = $installer.ExitCode; shortcuts = 'Desktop and Start Menu verified'; installedApp = 'smoke passed'; uninstall = 'removed test executable'; testedAt = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $repoRoot 'outputs\installer-result.json')
Write-Output 'PASS installer, installed app, shortcuts and uninstaller.'
