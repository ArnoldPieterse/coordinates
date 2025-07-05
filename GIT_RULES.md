# Git Rules and Best Practices
*IDX-GITRULES: Comprehensive git workflow guidelines for the Coordinates project*

## Table of Contents
- [Basic Workflow](#basic-workflow)
- [Commit Message Standards](#commit-message-standards)
- [Branch Management](#branch-management)
- [File Organization](#file-organization)
- [Error Prevention](#error-prevention)
- [Troubleshooting](#troubleshooting)

## Basic Workflow

### 1. Pre-Commit Checklist
```bash
# Always check status first
git status

# Check for untracked files
git ls-files --others --exclude-standard

# Check for modified files
git diff --name-only

# Check for staged files
git diff --cached --name-only
```

### 2. Staging Files
```bash
# Stage specific files (preferred)
git add <filename>

# Stage all modified files (use with caution)
git add .

# Stage all files including new ones (use with extreme caution)
git add -A
```

### 3. Committing Changes
```bash
# Always use descriptive commit messages
git commit -m "IDX-TAG: Descriptive message about changes"

# For complex changes, use multi-line commit
git commit -m "IDX-TAG: Main change description" -m "- Detailed bullet points" -m "- Additional context"
```

### 4. Pushing Changes
```bash
# Always pull before pushing
git pull origin main

# Push to remote
git push origin main

# If pushing to a different branch
git push origin <branch-name>
```

## Commit Message Standards

### Format
```
IDX-TAG: Brief description (50 chars or less)

Optional longer description after blank line
- Bullet points for details
- Additional context
```

### Index Tags (IDX-TAG)
- `IDX-DOC`: Documentation updates
- `IDX-FEAT`: New features
- `IDX-FIX`: Bug fixes
- `IDX-REFACTOR`: Code refactoring
- `IDX-PERF`: Performance improvements
- `IDX-TEST`: Test additions/updates
- `IDX-DEPS`: Dependency updates
- `IDX-CONFIG`: Configuration changes
- `IDX-GITRULES`: Git workflow updates
- `IDX-TREEHYBRID`: Tree generator specific changes

### Examples
```bash
git commit -m "IDX-FEAT: Add hybrid L-System tree generator"
git commit -m "IDX-FIX: Resolve mesh generation edge case"
git commit -m "IDX-DOC: Update README with implementation status"
```

## Branch Management

### Creating Feature Branches
```bash
# Create and switch to new branch
git checkout -b feature/IDX-TREEHYBRID-lsystem

# Or using newer syntax
git switch -c feature/IDX-TREEHYBRID-lsystem
```

### Merging Branches
```bash
# Switch to target branch
git checkout main

# Merge feature branch
git merge feature/IDX-TREEHYBRID-lsystem

# Delete feature branch after successful merge
git branch -d feature/IDX-TREEHYBRID-lsystem
```

### Handling Conflicts
```bash
# If merge conflict occurs
git status  # Check conflicted files
# Edit conflicted files manually
git add <resolved-files>
git commit -m "IDX-FIX: Resolve merge conflicts"
```

## File Organization

### Staging Order
1. **Documentation files first**
   - README.md
   - PROJECT_STATUS.md
   - CONTRIBUTING.md
   - Any .md files

2. **Source code files**
   - src/ directory files
   - tools/ directory files

3. **Configuration files**
   - package.json
   - package-lock.json
   - vite.config.js
   - Other config files

4. **Build and deployment files**
   - Dockerfile
   - docker-compose.yml
   - GitHub Actions workflows

### Example Staging Sequence
```bash
# Stage documentation
git add README.md PROJECT_STATUS.md CONTRIBUTING.md

# Stage source code
git add src/procedural-tree-voxel.js src/main.js

# Stage configuration
git add package.json vite.config.js

# Commit with appropriate tag
git commit -m "IDX-TREEHYBRID: Implement L-System skeleton generation"
```

## Error Prevention

### Common Issues and Solutions

#### 1. Large File Commits
```bash
# Check file sizes before committing
git status --porcelain | while read status file; do
  if [ -f "$file" ]; then
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown")
    echo "$file: $size bytes"
  fi
done
```

#### 2. Accidental Large Commits
```bash
# If you accidentally staged too many files
git reset HEAD  # Unstage all files
git add <specific-files>  # Stage only intended files
```

#### 3. Wrong Branch Commits
```bash
# If you committed to wrong branch
git log --oneline -1  # Get commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1  # Remove commit from wrong branch
```

#### 4. Commit Message Mistakes
```bash
# Amend last commit message
git commit --amend -m "IDX-TAG: Corrected commit message"

# Only amend if not pushed yet!
```

## Troubleshooting

### Git Status Issues
```bash
# Check what's happening
git status

# Check for ignored files
git status --ignored

# Check for untracked files
git status --porcelain
```

### Staging Issues
```bash
# See what's staged
git diff --cached

# See what's not staged
git diff

# Unstage specific file
git reset HEAD <filename>

# Unstage all files
git reset HEAD
```

### Push Issues
```bash
# Check remote status
git remote -v

# Check branch tracking
git branch -vv

# Force push (use with extreme caution)
git push --force-with-lease origin main
```

### Pull Issues
```bash
# Fetch without merge
git fetch origin

# See what would be merged
git log HEAD..origin/main

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

## Best Practices Summary

1. **Always check status before operations**
2. **Use descriptive commit messages with IDX tags**
3. **Stage files in logical groups**
4. **Pull before pushing**
5. **Create feature branches for major changes**
6. **Test commits before pushing**
7. **Keep commits atomic and focused**
8. **Document complex changes in commit messages**

## Emergency Procedures

### Reverting Last Commit
```bash
# Soft revert (keep changes staged)
git reset --soft HEAD~1

# Hard revert (lose changes completely)
git reset --hard HEAD~1
```

### Reverting Pushed Commits
```bash
# Create revert commit
git revert HEAD

# Or revert specific commit
git revert <commit-hash>
```

### Recovering Lost Work
```bash
# Check reflog for lost commits
git reflog

# Recover specific commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

---

*This document should be updated whenever new git workflows or requirements are established.* 