@echo off
REM Premium Stays - Auto Deploy to GitHub Script (Windows)
REM Run this script to automatically push everything to GitHub

echo 🚀 Starting Premium Stays deployment to GitHub...

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo 📦 Initializing git repository...
    git init
)

REM Add all files
echo 📁 Adding all files to git...
git add .

REM Create commit
echo 💾 Creating commit...
git commit -m "Initial commit: Premium Stays vacation rental platform with house activation feature"

REM Add remote repository
echo 🔗 Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/my-useless-apps/hotel.git

REM Push to GitHub
echo ⬆️ Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo ✅ Successfully pushed Premium Stays to GitHub!
echo 🌐 Repository: https://github.com/my-useless-apps/hotel
echo.
echo 🚀 Next steps:
echo 1. Visit: https://railway.app
echo 2. Click 'Deploy from GitHub repo'
echo 3. Select 'my-useless-apps/hotel'
echo 4. Your app will be live in 2-3 minutes!

pause

