# Push to GitHub - Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/campaynfounder (or your GitHub account)
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `viral-vision` (or your preferred name)
4. Description: "Mobile-first web app for generating viral faceless content prompts with luxury aesthetics"
5. Choose Public or Private
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with campaynfounder or your GitHub username)
git remote add origin https://github.com/campaynfounder/viral-vision.git

# Or if using SSH:
# git remote add origin git@github.com:campaynfounder/viral-vision.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create viral-vision --public --source=. --remote=origin --push
```

