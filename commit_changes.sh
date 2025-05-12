#!/bin/bash

# Script to commit changes in the CSE-330S repository
# This will make changes visible in the commits section

echo "Committing changes to the CSE-330S repository..."

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Update Creative Project files and documentation"

# Push to the remote repository
echo "To push these changes to the remote repository, run:"
echo "git push"

echo "Changes have been committed locally. They will now be visible in the commit history."
echo "Run 'git push' to make them visible on GitHub/remote repository."