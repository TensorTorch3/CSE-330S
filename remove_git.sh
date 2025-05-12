#!/bin/bash

# Script to remove Git configuration from the CSE-330S directory and its subdirectories

echo "Removing Git configuration from CSE-330S directory..."

# Check if we're in the CSE-330S directory
if [[ $(basename "$PWD") != "CSE-330S" ]]; then
    echo "Error: This script should be run from the CSE-330S directory."
    exit 1
fi

# Remove the .git directory
if [ -d ".git" ]; then
    echo "Removing .git directory..."
    rm -rf .git
    echo ".git directory removed successfully."
else
    echo "No .git directory found."
fi

# Remove any .gitmodules file if it exists
if [ -f ".gitmodules" ]; then
    echo "Removing .gitmodules file..."
    rm -f .gitmodules
    echo ".gitmodules file removed successfully."
else
    echo "No .gitmodules file found."
fi

# Remove any .gitignore files in the directory and subdirectories
echo "Removing .gitignore files..."
find . -name ".gitignore" -type f -delete
echo ".gitignore files removed."

echo "Git configuration has been removed from the CSE-330S directory and its subdirectories."
echo "The folders are no longer connected to any Git repositories."