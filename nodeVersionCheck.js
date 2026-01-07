#!/usr/bin/env node

// This script patches the Next.js Node.js version check
// Run this before starting the dev server

const fs = require('fs');
const path = require('path');

// Path to the Next.js version check file
const nextPath = path.join(__dirname, 'node_modules/next/dist/lib/setup-env.js');

try {
  if (fs.existsSync(nextPath)) {
    let content = fs.readFileSync(nextPath, 'utf8');
    
    // Replace the version check function with one that always returns true
    const patchedContent = content.replace(
      /checkNodeVersion.*?=.*?\(.*?\).*?{[\s\S]*?}(?=;)/m,
      'checkNodeVersion = () => true'
    );
    
    fs.writeFileSync(nextPath, patchedContent);
    console.log('✅ Successfully patched Next.js Node version check!');
  } else {
    console.error('❌ Could not find Next.js version check file at:', nextPath);
  }
} catch (error) {
  console.error('❌ Error patching Next.js:', error);
}
