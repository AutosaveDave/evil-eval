# Evil-Eval: Deploy to GitHub Pages

## 1. Initialize git and commit your code

```
git init
git add .
git commit -m "Initial commit"
```

## 2. Create a GitHub repository and push your code

```
git remote add origin https://github.com/YOUR_USERNAME/evil-eval.git
git branch -M main
git push -u origin main
```

## 3. Install dependencies

```
npm install
```

## 4. Deploy to GitHub Pages

```
npm run deploy
```

## 5. Set GitHub Pages source to `gh-pages` branch in your repo settings

---

- Your site will be available at: `https://YOUR_USERNAME.github.io/evil-eval/`
- If you update your app, just commit and push, then run `npm run deploy` again.
