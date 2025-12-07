#!/bin/bash
# Commands to push to GitHub
# Run these AFTER creating the repository on GitHub

# Replace 'campaynfounder' and 'viral-vision' with your actual GitHub username and repo name
GITHUB_USER="campaynfounder"
REPO_NAME="viral-vision"

# Add remote
git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Pushed to GitHub!"
echo "View your repo at: https://github.com/${GITHUB_USER}/${REPO_NAME}"

