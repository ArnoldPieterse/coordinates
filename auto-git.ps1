param(
    [string]$msg = "chore: auto-commit all staged changes"
)
git add -A
git commit -m "$msg"
git push 