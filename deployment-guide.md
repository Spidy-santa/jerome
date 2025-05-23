# 🚀 Jerome's Birthday Website - Deployment Guide

## 🎯 Recommended Deployment Platforms

### 1. 🌟 GitHub Pages (Recommended - Free & Easy)

#### Step-by-Step Setup:

1. **Prepare Repository**
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Verify all files are committed
git status
```

2. **Enable GitHub Pages**
- Go to your repository: https://github.com/Spidy-santa/jerome-annan
- Click **Settings** tab
- Scroll to **Pages** section
- Under **Source**, select **Deploy from a branch**
- Choose **main** branch
- Select **/ (root)** folder
- Click **Save**

3. **Access Your Site**
- URL will be: `https://spidy-santa.github.io/jerome-annan/`
- ✅ **HTTPS enabled by default** (perfect for microphone!)

#### GitHub Pages Configuration File:
Create `.github/workflows/pages.yml` (optional, for custom deployment):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 2. 🚀 Netlify (Advanced Features)

#### Quick Deploy:
1. Go to [netlify.com](https://netlify.com)
2. Click **New site from Git**
3. Connect GitHub account
4. Select `jerome-annan` repository
5. Build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: (leave empty or `.`)
6. Click **Deploy site**

#### Custom Domain & HTTPS:
- Netlify provides HTTPS automatically
- Custom domain: Site settings → Domain management

#### Netlify Configuration (`netlify.toml`):
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. ⚡ Vercel (Performance Optimized)

#### Deploy Steps:
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import from GitHub: `jerome-annan`
4. Framework Preset: **Other**
5. Build settings:
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
6. Click **Deploy**

#### Vercel Configuration (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🔒 HTTPS Verification

### Check HTTPS Status:
```bash
# Test HTTPS availability
curl -I https://your-domain.com

# Should return: HTTP/2 200
```

### Browser Verification:
1. Open deployed site
2. Check address bar for 🔒 lock icon
3. Verify URL starts with `https://`
4. Test microphone permission prompt

## 📁 File Upload Verification

### Essential Files Checklist:
- [ ] `index.html` (main page)
- [ ] `script.js` (functionality)
- [ ] `styles.css` (styling)
- [ ] `cake.png` (cake image)
- [ ] `jerome.jpg` (main photo)
- [ ] `jerome1.jpg` (gallery photo)
- [ ] `deployment-test.html` (testing page)

### Verification Commands:
```bash
# Check file accessibility
curl -I https://your-domain.com/index.html
curl -I https://your-domain.com/script.js
curl -I https://your-domain.com/styles.css
curl -I https://your-domain.com/cake.png
curl -I https://your-domain.com/jerome.jpg
curl -I https://your-domain.com/jerome1.jpg

# All should return: 200 OK
```
