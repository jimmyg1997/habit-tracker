#!/bin/bash

# Script to push habit-tracker to GitHub
# Run this AFTER creating the repository on GitHub

echo "🚀 Pushing habit-tracker to GitHub..."

# Replace YOUR_USERNAME with your actual GitHub username
# Common options based on your email: dimitriosgeorgiou, dgeorgiou3, or your actual GitHub username

read -p "Enter your GitHub username: " GITHUB_USERNAME

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true

# Add the new remote
git remote add origin "https://github.com/${GITHUB_USERNAME}/habit-tracker.git"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Your code is now on GitHub at: https://github.com/${GITHUB_USERNAME}/habit-tracker"
