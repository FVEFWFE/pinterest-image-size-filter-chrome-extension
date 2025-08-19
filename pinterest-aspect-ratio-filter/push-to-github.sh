#!/bin/bash

# Replace YOUR_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="pinterest-aspect-ratio-filter"

echo "This script will push the Pinterest Aspect Ratio Filter to GitHub"
echo "================================================"
echo ""
echo "Please make sure you have:"
echo "1. Created a new repository on GitHub named: $REPO_NAME"
echo "2. Replaced YOUR_USERNAME in this script with your GitHub username"
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Add the remote origin
echo "Adding remote origin..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""
echo "Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Add topics like: chrome-extension, pinterest, image-filter, aspect-ratio"
echo "3. Consider adding a LICENSE file (MIT recommended)"
echo "4. You can publish to Chrome Web Store if desired"