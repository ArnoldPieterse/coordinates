# Branch Cleanup Script
# Lists all local and remote branches, prompts for deletion of obsolete branches, and deletes them if confirmed.

# List all local branches
Write-Host 'Local branches:'
git branch

# List all remote branches
Write-Host 'Remote branches:'
git branch -r

# Prompt user for branches to delete
$branchesToDelete = Read-Host 'Enter the names of local branches to delete (comma-separated, e.g., feature/old1,feature/old2):'

if ($branchesToDelete) {
    $branchList = $branchesToDelete -split ','
    foreach ($branch in $branchList) {
        $trimmed = $branch.Trim()
        if ($trimmed) {
            Write-Host "Deleting local branch: $trimmed"
            git branch -d $trimmed
        }
    }
}

# Prompt user for remote branches to delete
$remoteBranchesToDelete = Read-Host 'Enter the names of remote branches to delete (comma-separated, e.g., origin/feature/old1,origin/feature/old2):'

if ($remoteBranchesToDelete) {
    $remoteBranchList = $remoteBranchesToDelete -split ','
    foreach ($remoteBranch in $remoteBranchList) {
        $trimmedRemote = $remoteBranch.Trim()
        if ($trimmedRemote) {
            Write-Host "Deleting remote branch: $trimmedRemote"
            git push origin --delete ($trimmedRemote -replace 'origin/', '')
        }
    }
} 