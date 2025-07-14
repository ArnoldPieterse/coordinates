# PowerShell script to add AWS CLI to the system PATH for all users
# Run as Administrator

$awsPath = 'C:\Program Files\Amazon\AWSCLIV2\'
if (-not ($env:Path -like "*$awsPath*")) {
    [Environment]::SetEnvironmentVariable('Path', $env:Path + ";$awsPath", [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✅ AWS CLI path added to system PATH. Please restart your terminal."
} else {
    Write-Host "AWS CLI path already in PATH."
} 