#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Running performance checks...\n');

// Check bundle sizes
function checkBundleSize() {
  console.log('📦 Checking bundle sizes...');
  
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Run npm run build first.');
    process.exit(1);
  }
  
  // Get file sizes
  const getDirectorySize = (dirPath) => {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return totalSize;
  };
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Check JavaScript files
  const jsFiles = execSync(`find ${distPath} -name "*.js" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let totalJsSize = 0;
  jsFiles.forEach(file => {
    totalJsSize += fs.statSync(file).size;
  });
  
  // Check CSS files
  const cssFiles = execSync(`find ${distPath} -name "*.css" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let totalCssSize = 0;
  cssFiles.forEach(file => {
    totalCssSize += fs.statSync(file).size;
  });
  
  // Check image files
  const imageFiles = execSync(`find ${distPath} -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let totalImageSize = 0;
  imageFiles.forEach(file => {
    totalImageSize += fs.statSync(file).size;
  });
  
  const totalSize = getDirectorySize(distPath);
  
  console.log(`📊 Bundle Analysis:`);
  console.log(`   JavaScript: ${formatBytes(totalJsSize)} (${jsFiles.length} files)`);
  console.log(`   CSS: ${formatBytes(totalCssSize)} (${cssFiles.length} files)`);
  console.log(`   Images: ${formatBytes(totalImageSize)} (${imageFiles.length} files)`);
  console.log(`   Total: ${formatBytes(totalSize)}\n`);
  
  // Check against budgets
  const budgets = {
    js: 100 * 1024, // 100KB
    css: 50 * 1024, // 50KB
    images: 500 * 1024, // 500KB
    total: 1000 * 1024, // 1MB
  };
  
  let hasErrors = false;
  
  if (totalJsSize > budgets.js) {
    console.log(`❌ JavaScript bundle exceeds budget: ${formatBytes(totalJsSize)} > ${formatBytes(budgets.js)}`);
    hasErrors = true;
  } else {
    console.log(`✅ JavaScript bundle within budget: ${formatBytes(totalJsSize)}`);
  }
  
  if (totalCssSize > budgets.css) {
    console.log(`❌ CSS bundle exceeds budget: ${formatBytes(totalCssSize)} > ${formatBytes(budgets.css)}`);
    hasErrors = true;
  } else {
    console.log(`✅ CSS bundle within budget: ${formatBytes(totalCssSize)}`);
  }
  
  if (totalImageSize > budgets.images) {
    console.log(`⚠️  Image bundle exceeds budget: ${formatBytes(totalImageSize)} > ${formatBytes(budgets.images)}`);
  } else {
    console.log(`✅ Image bundle within budget: ${formatBytes(totalImageSize)}`);
  }
  
  if (totalSize > budgets.total) {
    console.log(`⚠️  Total bundle exceeds budget: ${formatBytes(totalSize)} > ${formatBytes(budgets.total)}`);
  } else {
    console.log(`✅ Total bundle within budget: ${formatBytes(totalSize)}`);
  }
  
  return !hasErrors;
}

// Check for unused CSS
function checkUnusedCSS() {
  console.log('\n🎨 Checking for unused CSS...');
  
  try {
    // This would require additional tooling like PurgeCSS
    console.log('ℹ️  CSS optimization handled by Tailwind CSS purge');
  } catch (error) {
    console.log('⚠️  Could not check unused CSS:', error.message);
  }
}

// Check for accessibility issues
function checkAccessibility() {
  console.log('\n♿ Checking accessibility...');
  
  try {
    // Basic checks for common accessibility issues
    const htmlFiles = execSync(`find ${path.join(__dirname, '../dist')} -name "*.html" -type f`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    let issues = 0;
    
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for images without alt text
      const imgWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/g);
      if (imgWithoutAlt) {
        console.log(`⚠️  Found ${imgWithoutAlt.length} images without alt text in ${path.basename(file)}`);
        issues += imgWithoutAlt.length;
      }
      
      // Check for missing lang attribute
      if (!content.includes('lang=')) {
        console.log(`⚠️  Missing lang attribute in ${path.basename(file)}`);
        issues++;
      }
    });
    
    if (issues === 0) {
      console.log('✅ No basic accessibility issues found');
    } else {
      console.log(`⚠️  Found ${issues} potential accessibility issues`);
    }
    
  } catch (error) {
    console.log('⚠️  Could not check accessibility:', error.message);
  }
}

// Main execution
async function main() {
  const bundleOk = checkBundleSize();
  checkUnusedCSS();
  checkAccessibility();
  
  console.log('\n🏁 Performance check complete!');
  
  if (!bundleOk) {
    console.log('❌ Some performance budgets were exceeded.');
    process.exit(1);
  } else {
    console.log('✅ All performance checks passed!');
  }
}

main().catch(console.error);