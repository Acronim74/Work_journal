#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

function bump() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const [major, minor, patch] = pkg.version.split('.').map(Number);
  pkg.version = `${major}.${minor + 1}.${patch}`;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Version bumped → ${pkg.version}`);
}

// electron-builder beforeBuild hook: exports async function
module.exports = async function() { bump(); };

// direct call: node scripts/bump-version.js
if (require.main === module) bump();
