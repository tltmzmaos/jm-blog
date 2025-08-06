#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running SEO checks...\n');

function checkSEOFiles() {
  console.log('📄 Checking SEO files...');
  
  const distPath = path.join(__dirname, '../dist');
  const requiredFiles = [
    'sitemap.xml',
    'robots.txt'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
      
      // Check file content
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.length > 0) {
        console.log(`   📊 Size: ${content.length} characters`);
      } else {
        console.log(`   ⚠️  File is empty`);
      }
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkMetaTags() {
  console.log('\n🏷️  Checking meta tags...');
  
  const distPath = path.join(__dirname, '../dist');
  const htmlFiles = execSync(`find ${distPath} -name "*.html" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  const requiredMetaTags = [
    'meta name="description"',
    'meta property="og:title"',
    'meta property="og:description"',
    'meta property="og:image"',
    'meta name="twitter:card"',
    'link rel="canonical"'
  ];
  
  let totalIssues = 0;
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    let fileIssues = 0;
    
    requiredMetaTags.forEach(tag => {
      if (!content.includes(tag)) {
        if (fileIssues === 0) {
          console.log(`\n📄 ${fileName}:`);
        }
        console.log(`   ❌ Missing: ${tag}`);
        fileIssues++;
        totalIssues++;
      }
    });
    
    if (fileIssues === 0) {
      console.log(`✅ ${fileName} - All meta tags present`);
    }
  });
  
  return totalIssues === 0;
}

function checkStructuredData() {
  console.log('\n📊 Checking structured data...');
  
  const distPath = path.join(__dirname, '../dist');
  const htmlFiles = execSync(`find ${distPath} -name "*.html" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let hasStructuredData = false;
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    
    if (content.includes('application/ld+json')) {
      console.log(`✅ ${fileName} - Has structured data`);
      hasStructuredData = true;
      
      // Extract and validate JSON-LD
      const jsonLdMatches = content.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatches) {
        jsonLdMatches.forEach((match, index) => {
          try {
            const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            const parsed = JSON.parse(jsonContent);
            console.log(`   📊 JSON-LD ${index + 1}: ${parsed['@type'] || 'Unknown type'}`);
          } catch (error) {
            console.log(`   ❌ Invalid JSON-LD ${index + 1}: ${error.message}`);
          }
        });
      }
    } else {
      console.log(`⚠️  ${fileName} - No structured data found`);
    }
  });
  
  return hasStructuredData;
}

function checkImageOptimization() {
  console.log('\n🖼️  Checking image optimization...');
  
  const distPath = path.join(__dirname, '../dist');
  
  try {
    const imageFiles = execSync(`find ${distPath} -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -type f`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    if (imageFiles.length === 0) {
      console.log('ℹ️  No images found');
      return true;
    }
    
    let totalSize = 0;
    let largeImages = 0;
    
    imageFiles.forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
      
      if (stats.size > 100 * 1024) { // 100KB
        largeImages++;
        console.log(`⚠️  Large image: ${path.basename(file)} (${Math.round(stats.size / 1024)}KB)`);
      }
    });
    
    console.log(`📊 Total images: ${imageFiles.length}`);
    console.log(`📊 Total size: ${Math.round(totalSize / 1024)}KB`);
    console.log(`📊 Average size: ${Math.round(totalSize / imageFiles.length / 1024)}KB`);
    
    if (largeImages > 0) {
      console.log(`⚠️  ${largeImages} images exceed 100KB`);
    } else {
      console.log('✅ All images are optimized');
    }
    
    return largeImages === 0;
    
  } catch (error) {
    console.log('ℹ️  No images found or error checking images');
    return true;
  }
}

function checkPageSpeed() {
  console.log('\n⚡ Checking page speed factors...');
  
  const distPath = path.join(__dirname, '../dist');
  const htmlFiles = execSync(`find ${distPath} -name "*.html" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let issues = 0;
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    
    // Check for preconnect links
    if (!content.includes('rel="preconnect"')) {
      console.log(`⚠️  ${fileName} - No preconnect links found`);
      issues++;
    }
    
    // Check for lazy loading
    const images = content.match(/<img[^>]*>/g) || [];
    const lazyImages = images.filter(img => img.includes('loading="lazy"')).length;
    
    if (images.length > 0 && lazyImages === 0) {
      console.log(`⚠️  ${fileName} - No lazy loading on images`);
      issues++;
    } else if (images.length > 0) {
      console.log(`✅ ${fileName} - ${lazyImages}/${images.length} images use lazy loading`);
    }
  });
  
  return issues === 0;
}

// Main execution
async function main() {
  const seoFilesOk = checkSEOFiles();
  const metaTagsOk = checkMetaTags();
  const structuredDataOk = checkStructuredData();
  const imagesOk = checkImageOptimization();
  const pageSpeedOk = checkPageSpeed();
  
  console.log('\n🏁 SEO check complete!');
  
  const allChecksPass = seoFilesOk && metaTagsOk && structuredDataOk && imagesOk && pageSpeedOk;
  
  if (!allChecksPass) {
    console.log('❌ Some SEO checks failed. Please review the issues above.');
    process.exit(1);
  } else {
    console.log('✅ All SEO checks passed!');
  }
}

main().catch(console.error);