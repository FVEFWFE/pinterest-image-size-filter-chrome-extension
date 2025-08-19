#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Pinterest Aspect Ratio Filter - GitHub Setup${NC}"
echo "================================================"
echo ""

# Check if git remote exists
if git remote get-url origin &>/dev/null; then
    echo -e "${YELLOW}Remote origin already exists. Removing...${NC}"
    git remote remove origin
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}GitHub username is required!${NC}"
    exit 1
fi

# Get repository name (with default)
read -p "Enter repository name (default: pinterest-aspect-ratio-filter): " REPO_NAME
REPO_NAME=${REPO_NAME:-pinterest-aspect-ratio-filter}

# Ask for visibility
echo "Repository visibility:"
echo "1) Public (recommended)"
echo "2) Private"
read -p "Choose (1 or 2): " VISIBILITY_CHOICE

if [ "$VISIBILITY_CHOICE" = "2" ]; then
    VISIBILITY="private"
else
    VISIBILITY="public"
fi

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "Username: $GITHUB_USERNAME"
echo "Repository: $REPO_NAME"
echo "Visibility: $VISIBILITY"
echo ""

# Check if user has GitHub CLI or wants to use token
echo "Authentication method:"
echo "1) GitHub Personal Access Token (recommended)"
echo "2) GitHub CLI (gh)"
echo "3) SSH Key"
read -p "Choose (1, 2, or 3): " AUTH_METHOD

if [ "$AUTH_METHOD" = "1" ]; then
    echo ""
    echo -e "${YELLOW}To create a Personal Access Token:${NC}"
    echo "1. Go to: https://github.com/settings/tokens/new"
    echo "2. Give it a name (e.g., 'Pinterest Filter Extension')"
    echo "3. Select scopes: 'repo' (all repo permissions)"
    echo "4. Click 'Generate token'"
    echo "5. Copy the token (it won't be shown again!)"
    echo ""
    read -s -p "Paste your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}Token is required for this method!${NC}"
        exit 1
    fi
    
    # Create repository using API
    echo -e "${GREEN}Creating repository on GitHub...${NC}"
    RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -d "{\"name\":\"$REPO_NAME\",\"description\":\"Chrome extension to filter Pinterest images by aspect ratio\",\"private\":$([ "$VISIBILITY" = "private" ] && echo "true" || echo "false"),\"has_issues\":true,\"has_projects\":true,\"has_wiki\":true}" \
        https://api.github.com/user/repos)
    
    if echo "$RESPONSE" | grep -q "\"full_name\""; then
        echo -e "${GREEN}✓ Repository created successfully!${NC}"
        
        # Set up remote with token
        git remote add origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
        
        # Push to GitHub
        echo -e "${GREEN}Pushing code to GitHub...${NC}"
        git push -u origin main
        
        # Remove token from remote URL for security
        git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
        
        echo ""
        echo -e "${GREEN}✅ Success! Your extension is now on GitHub!${NC}"
        echo -e "Repository URL: ${GREEN}https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
        
    elif echo "$RESPONSE" | grep -q "name already exists"; then
        echo -e "${YELLOW}Repository already exists. Adding remote and pushing...${NC}"
        git remote add origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
        git push -u origin main
        git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
        echo -e "${GREEN}✅ Success! Code pushed to existing repository!${NC}"
        
    else
        echo -e "${RED}Failed to create repository. Response:${NC}"
        echo "$RESPONSE"
        exit 1
    fi
    
elif [ "$AUTH_METHOD" = "2" ]; then
    # GitHub CLI method
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}GitHub CLI (gh) is not installed!${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    echo -e "${GREEN}Creating repository using GitHub CLI...${NC}"
    gh repo create "$REPO_NAME" --$VISIBILITY --description "Chrome extension to filter Pinterest images by aspect ratio" --source=. --remote=origin --push
    
elif [ "$AUTH_METHOD" = "3" ]; then
    # SSH method
    echo -e "${YELLOW}Make sure you have SSH keys set up with GitHub${NC}"
    echo "Adding remote origin with SSH..."
    git remote add origin "git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"
    
    echo -e "${YELLOW}Note: You'll need to create the repository manually on GitHub first${NC}"
    echo "Go to: https://github.com/new"
    echo "Create a repository named: $REPO_NAME"
    read -p "Press Enter when you've created the repository..."
    
    echo -e "${GREEN}Pushing to GitHub...${NC}"
    git push -u origin main
    
else
    echo -e "${RED}Invalid choice!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All done! Next steps:${NC}"
echo "1. Visit your repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "2. Add topics: chrome-extension, pinterest, image-filter, aspect-ratio"
echo "3. Star the repository if you like it!"
echo "4. Share it with others who might find it useful!"
echo ""
echo -e "${YELLOW}To install the extension in Chrome:${NC}"
echo "1. Open chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select the extension folder"