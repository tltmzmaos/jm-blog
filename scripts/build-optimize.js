#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...\n');

// Clean previous build
function cleanBuild() {
  console.log('🧹 Cleaning previous build...');
  
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    execSync('rm -rf dist', { cwd: path.join(__dirname, '..') });
    console.log('✅ Previous build cleaned');
  } else {
    console.log('ℹ️  No previous build found');
  }
}

// Build the project
function buildProject() {
  console.log('\n📦 Building project...');
  
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Optimize images
function optimizeImages() {
  console.log('\n🖼️  Optimizing images...');
  
  const distPath = path.join(__dirname, '../dist');
  
  try {
    // Find all images
    const images = execSync(`find ${distPath} -name "*.jpg" -o -name "*.jpeg" -o -name "*.png"`, { 
      encoding: 'utf8' 
    }).split('\n').filter(Boolean);
    
    if (images.length === 0) {
      console.log('ℹ️  No images found to optimize');
      return true;
    }
    
    console.log(`📊 Found ${images.length} images to optimize`);
    
    let totalSavings = 0;
    
    images.forEach(imagePath => {
      const originalSize = fs.statSync(imagePath).size;
      
      try {
        // Optimize based on file type
        if (imagePath.match(/\.(jpg|jpeg)$/i)) {
          execSync(`npx imagemin ${imagePath} --out-dir=${path.dirname(imagePath)} --plugin=mozjpeg --plugin.mozjpeg.quality=80`, {
            stdio: 'pipe'
          });
        } else if (imagePath.match(/\.png$/i)) {
          execSync(`npx imagemin ${imagePath} --out-dir=${path.dirname(imagePath)} --plugin=pngquant --plugin.pngquant.quality=[0.6,0.8]`, {
            stdio: 'pipe'
          });
        }
        
        const newSize = fs.statSync(imagePath).size;
        const savings = originalSize - newSize;
        totalSavings += savings;
        
        if (savings > 0) {
          console.log(`   ✅ ${path.basename(imagePath)}: ${Math.round(savings / 1024)}KB saved`);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Failed to optimize ${path.basename(imagePath)}`);
      }
    });
    
    console.log(`📊 Total savings: ${Math.round(totalSavings / 1024)}KB`);
    return true;
    
  } catch (error) {
    console.log('⚠️  Image optimization failed:', error.message);
    return false;
  }
}

// Generate critical CSS
function generateCriticalCSS() {
  console.log('\n🎨 Analyzing CSS usage...');
  
  try {
    const distPath = path.join(__dirname, '../dist');
    const cssFiles = execSync(`find ${distPath} -name "*.css"`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    if (cssFiles.length === 0) {
      console.log('ℹ️  No CSS files found');
      return true;
    }
    
    let totalCssSize = 0;
    cssFiles.forEach(file => {
      totalCssSize += fs.statSync(file).size;
    });
    
    console.log(`📊 Total CSS size: ${Math.round(totalCssSize / 1024)}KB across ${cssFiles.length} files`);
    
    // Basic CSS optimization (remove comments, minify)
    cssFiles.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove comments
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove extra whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      fs.writeFileSync(file, content);
    });
    
    console.log('✅ CSS optimized');
    return true;
    
  } catch (error) {
    console.log('⚠️  CSS optimization failed:', error.message);
    return false;
  }
}

// Compress assets
function compressAssets() {
  console.log('\n📦 Compressing assets...');
  
  const distPath = path.join(__dirname, '../dist');
  
  try {
    // Create gzip versions of large files
    const compressibleFiles = execSync(`find ${distPath} -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.xml"`, { 
      encoding: 'utf8' 
    }).split('\n').filter(Boolean);
    
    let compressed = 0;
    
    compressibleFiles.forEach(file => {
      const stats = fs.statSync(file);
      
      // Only compress files larger than 1KB
      if (stats.size > 1024) {
        try {
          execSync(`gzip -9 -c "${file}" > "${file}.gz"`);
          
          const originalSize = stats.size;
          const compressedSize = fs.statSync(`${file}.gz`).size;
          const savings = originalSize - compressedSize;
          
          if (savings > 0) {
            compressed++;
            console.log(`   ✅ ${path.basename(file)}: ${Math.round(savings / 1024)}KB saved (${Math.round((savings / originalSize) * 100)}%)`);
          }
        } catch (error) {
          // Silently fail - gzip might not be available
        }
      }
    });
    
    console.log(`📊 Compressed ${compressed} files`);
    return true;
    
  } catch (error) {
    console.log('⚠️  Asset compression failed:', error.message);
    return false;
  }
}

// Generate build report
function generateBuildReport() {
  console.log('\n📊 Generating build report...');
  
  const distPath = path.join(__dirname, '../dist');
  
  try {
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
    
    const totalSize = getDirectorySize(distPath);
    
    // Count files by type
    const fileTypes = {};
    const countFiles = (dirPath) => {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          countFiles(filePath);
        } else {
          const ext = path.extname(file.name).toLowerCase() || 'no-ext';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }
    };
    
    countFiles(distPath);
    
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: formatBytes(totalSize),
      totalSizeBytes: totalSize,
      fileTypes,
      buildTime: Date.now()
    };
    
    // Save report
    fs.writeFileSync(
      path.join(distPath, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('📊 Build Report:');
    console.log(`   Total size: ${report.totalSize}`);
    console.log(`   File types: ${Object.keys(fileTypes).length}`);
    console.log(`   Total files: ${Object.values(fileTypes).reduce((a, b) => a + b, 0)}`);
    
    return true;
    
  } catch (error) {
    console.log('⚠️  Build report generation failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  cleanBuild();
  
  const buildSuccess = buildProject();
  if (!buildSuccess) {
    console.log('\n❌ Build optimization failed due to build errors');
    process.exit(1);
  }
  
  optimizeImages();
  generateCriticalCSS();
  compressAssets();
  generateBuildReport();
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`\n🏁 Build optimization completed in ${duration}s!`);
  console.log('✅ Your site is ready for deployment');
}

main().catch(console.error);