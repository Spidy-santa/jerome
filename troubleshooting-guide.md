# 🔧 Deployment Troubleshooting Guide

## 🚨 Common Deployment Pitfalls & Solutions

### 1. 🔥 Critical Issues

#### Issue: Site Shows "404 Not Found"
**Symptoms:**
- Main site URL returns 404 error
- Files seem uploaded but not accessible

**Solutions:**
```bash
# Check repository structure
ls -la

# Verify index.html is in root directory
# GitHub Pages expects index.html in root or docs/ folder

# If using custom domain, check DNS settings
nslookup your-domain.com
```

**Fix:**
- Ensure `index.html` is in repository root
- Check GitHub Pages source settings
- Verify custom domain configuration

#### Issue: Merge Conflicts Still Present
**Symptoms:**
- Site displays `<<<<<<< HEAD` text
- JavaScript errors in console
- Broken layout or functionality

**Detection:**
```bash
# Search for conflict markers
grep -r "<<<<<<< HEAD" .
grep -r "=======" .
grep -r ">>>>>>> " .
```

**Fix:**
```bash
# Remove conflict markers manually
# Then commit and push
git add .
git commit -m "Fix: Remove remaining merge conflict markers"
git push origin main
```

### 2. 🔊 Audio & Microphone Issues

#### Issue: No Sound Effects
**Symptoms:**
- Sound toggle shows 🔊 but no audio
- Console shows audio context errors

**Debug:**
```javascript
// Check audio context state
console.log('Audio Context:', audioContext?.state);
console.log('Sound Enabled:', soundEnabled);

// Test manual audio creation
if (audioContext) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 440;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
}
```

**Solutions:**
1. **User Interaction Required:**
   - Click anywhere on page first
   - Audio context needs user gesture

2. **Browser Autoplay Policy:**
   - Add user interaction before audio
   - Show "Click to enable sound" message

#### Issue: Microphone Not Working
**Symptoms:**
- Microphone permission denied
- No blow detection

**Check Requirements:**
```javascript
// Verify secure context
console.log('Secure Context:', window.isSecureContext);
console.log('Protocol:', location.protocol);
console.log('getUserMedia Available:', !!(navigator.mediaDevices?.getUserMedia));
```

**Solutions:**
1. **HTTPS Required:**
   - Deploy to HTTPS-enabled platform
   - GitHub Pages provides HTTPS automatically

2. **Permission Handling:**
   - Check browser permission settings
   - Clear site data and retry
   - Test in incognito mode

### 3. 🖼️ Image Loading Problems

#### Issue: Images Not Displaying
**Symptoms:**
- Broken image icons
- Fallback placeholders showing

**Debug:**
```javascript
// Test image accessibility
const testImage = new Image();
testImage.onload = () => console.log('✅ Image loaded');
testImage.onerror = () => console.log('❌ Image failed');
testImage.src = 'cake.png';
```

**Solutions:**
1. **File Path Issues:**
   - Verify case-sensitive file names
   - Check relative path structure
   - Ensure files uploaded correctly

2. **File Format Problems:**
   - Verify image file integrity
   - Check file size limits
   - Test with different image formats

### 4. 💾 Data Persistence Issues

#### Issue: Votes/Wishes Not Saving
**Symptoms:**
- Data resets on page reload
- localStorage errors in console

**Debug:**
```javascript
// Test localStorage functionality
try {
    localStorage.setItem('test', 'value');
    console.log('localStorage test:', localStorage.getItem('test'));
    localStorage.removeItem('test');
    console.log('✅ localStorage working');
} catch (error) {
    console.log('❌ localStorage error:', error);
}
```

**Solutions:**
1. **Privacy Mode:**
   - localStorage disabled in incognito
   - Ask users to use normal browsing

2. **Storage Quota:**
   - Clear old data periodically
   - Implement storage cleanup

### 5. 📱 Mobile Compatibility Issues

#### Issue: Touch Events Not Working
**Symptoms:**
- Balloons don't pop on mobile
- Touch interactions fail

**Debug:**
```javascript
// Test touch support
console.log('Touch Support:', 'ontouchstart' in window);
console.log('Pointer Events:', !!window.PointerEvent);

// Add touch event listeners
element.addEventListener('touchstart', handleTouch, {passive: false});
```

**Solutions:**
1. **Add Touch Events:**
   - Ensure both click and touch events
   - Use passive event listeners
   - Prevent default on touch

2. **Viewport Configuration:**
   - Check meta viewport tag
   - Test responsive design

### 6. 🌐 Cross-Browser Compatibility

#### Issue: Works in Chrome, Fails in Safari
**Symptoms:**
- Different behavior across browsers
- Feature support variations

**Debug:**
```javascript
// Browser feature detection
const features = {
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    getUserMedia: !!(navigator.mediaDevices?.getUserMedia),
    localStorage: !!window.localStorage,
    touchEvents: 'ontouchstart' in window,
    webGL: !!window.WebGLRenderingContext
};
console.table(features);
```

**Solutions:**
1. **Polyfills:**
   - Add vendor prefixes
   - Use feature detection
   - Provide fallbacks

2. **Testing Strategy:**
   - Test on multiple browsers
   - Use browser dev tools
   - Check caniuse.com for support

## 🛠️ Debugging Tools & Commands

### Browser Developer Tools
```javascript
// Comprehensive site health check
function siteHealthCheck() {
    const health = {
        url: window.location.href,
        https: location.protocol === 'https:',
        audioContext: !!audioContext,
        audioState: audioContext?.state,
        localStorage: !!window.localStorage,
        getUserMedia: !!(navigator.mediaDevices?.getUserMedia),
        touchSupport: 'ontouchstart' in window,
        errors: []
    };
    
    // Test localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        health.errors.push('localStorage: ' + e.message);
    }
    
    // Test audio
    if (audioContext && audioContext.state === 'suspended') {
        health.errors.push('Audio context suspended - user interaction required');
    }
    
    console.table(health);
    return health;
}

// Run health check
siteHealthCheck();
```

### Network Debugging
```bash
# Check all resource loading
curl -I https://your-site.com/index.html
curl -I https://your-site.com/script.js
curl -I https://your-site.com/styles.css
curl -I https://your-site.com/cake.png

# Check for CORS issues
curl -H "Origin: https://your-site.com" -I https://your-site.com/api/endpoint
```

### Performance Monitoring
```javascript
// Monitor performance
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
});

// Monitor errors
window.addEventListener('error', (e) => {
    console.error('Error:', e.filename, e.lineno, e.message);
});
```

## 🚀 Quick Fix Commands

### Force Refresh Deployment
```bash
# GitHub Pages
git commit --allow-empty -m "Trigger deployment"
git push origin main

# Netlify
# Use deploy hook or manual deploy in dashboard

# Vercel
vercel --prod
```

### Clear Browser Cache
```javascript
// Force reload without cache
location.reload(true);

// Clear specific localStorage
localStorage.clear();

// Clear specific items
localStorage.removeItem('jeromesBirthdayScore');
localStorage.removeItem('jeromesBirthdayVotes');
```

### Emergency Rollback
```bash
# Revert to previous working commit
git log --oneline -10
git revert <commit-hash>
git push origin main
```

## 📞 Getting Help

### Debug Information to Collect
When reporting issues, include:

```javascript
// Copy this debug info
const debugInfo = {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    features: {
        https: location.protocol === 'https:',
        audioContext: !!audioContext,
        localStorage: !!window.localStorage,
        getUserMedia: !!(navigator.mediaDevices?.getUserMedia)
    },
    errors: [] // Add any console errors here
};
console.log(JSON.stringify(debugInfo, null, 2));
```

### Support Resources
- **GitHub Issues**: Create issue in repository
- **Platform Support**: 
  - GitHub Pages: GitHub Support
  - Netlify: Netlify Support
  - Vercel: Vercel Support
- **Browser DevTools**: F12 → Console tab
- **Online Testing**: BrowserStack, CrossBrowserTesting
