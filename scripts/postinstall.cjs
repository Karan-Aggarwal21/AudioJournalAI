/**
 * Post-install script: patches @runanywhere/web-onnx files to use
 * native browser import() instead of bundler-intercepted import().
 * 
 * This is required because webpack/turbopack rewrite import() calls
 * at compile time, breaking dynamic import of blob: URLs and runtime URLs.
 */

const fs = require('fs');
const path = require('path');

const filesToPatch = [
  {
    file: path.join(__dirname, '..', 'node_modules', '@runanywhere', 'web-onnx', 'dist', 'Foundation', 'SherpaHelperLoader.js'),
    search: 'const mod = await import(/* @vite-ignore */ blobUrl);',
    replace: `// Use native browser import to bypass webpack/turbopack import() shim
        const nativeImport = new Function('url', 'return import(url)');
        const mod = await nativeImport(blobUrl);`,
  },
];

for (const { file, search, replace } of filesToPatch) {
  if (!fs.existsSync(file)) {
    console.log(`[postinstall] Skipping ${path.basename(file)} — not found`);
    continue;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[postinstall] Patched ${path.basename(file)} — native import() for blob URLs`);
  } else if (content.includes('nativeImport')) {
    console.log(`[postinstall] ${path.basename(file)} — already patched`);
  } else {
    console.log(`[postinstall] ${path.basename(file)} — search string not found, skipping`);
  }
}

// Also copy WASM files to public/
const wasmSrc = path.join(__dirname, '..', 'node_modules', '@runanywhere', 'web-onnx', 'wasm', 'sherpa');
const wasmDest = path.join(__dirname, '..', 'public', 'wasm', 'sherpa');

if (fs.existsSync(wasmSrc)) {
  fs.mkdirSync(wasmDest, { recursive: true });
  const files = fs.readdirSync(wasmSrc);
  for (const f of files) {
    fs.copyFileSync(path.join(wasmSrc, f), path.join(wasmDest, f));
  }
  console.log(`[postinstall] Copied ${files.length} WASM files to public/wasm/sherpa/`);
}

console.log('[postinstall] RunAnywhere SDK patching complete');
