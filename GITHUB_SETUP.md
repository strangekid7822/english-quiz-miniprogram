# GitHub Setup Commands

## 1. Create GitHub repo (via web)
- Go to github.com
- Click "New repository"
- Name: `english-quiz-miniprogram`
- Set to **Private**
- Don't initialize with README

## 2. Run these commands in terminal:
```bash
cd /tmp/english-quiz-miniprogram
git init
git add .
git commit -m "Initial WeChat mini-program implementation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/english-quiz-miniprogram.git
git push -u origin main
```

## 3. Replace YOUR_USERNAME with your actual GitHub username

Files are ready at `/tmp/english-quiz-miniprogram/` with `.gitignore` added.