const fs = require('fs');
const path = require('path');

console.log('🔍 Testing logo file compatibility...');

try {
  // Check if logo exists
  const logoPath = path.join(__dirname, 'logo.png');
  console.log('📁 Logo path:', logoPath);
  
  if (fs.existsSync(logoPath)) {
    const stats = fs.statSync(logoPath);
    console.log('✅ Logo file exists');
    console.log('📏 File size:', stats.size, 'bytes');
    console.log('📅 Last modified:', stats.mtime);
    
    // Try to read the file as buffer
    const logoBuffer = fs.readFileSync(logoPath);
    console.log('📦 Buffer size:', logoBuffer.length, 'bytes');
    
    // Check first few bytes to verify PNG header
    const header = logoBuffer.slice(0, 8);
    const headerHex = header.toString('hex');
    console.log('🔍 PNG header (hex):', headerHex);
    
    // PNG should start with 89 50 4E 47 0D 0A 1A 0A
    if (headerHex === '89504e470d0a1a0a') {
      console.log('✅ Valid PNG header detected');
    } else {
      console.log('❌ Invalid PNG header - this might not be a valid PNG file');
    }
    
    // Try to convert to base64
    const base64Logo = logoBuffer.toString('base64');
    console.log('📝 Base64 length:', base64Logo.length);
    console.log('📝 Base64 preview:', base64Logo.substring(0, 50) + '...');
    
  } else {
    console.log('❌ Logo file not found');
  }
  
} catch (error) {
  console.error('❌ Error testing logo:', error.message);
}
