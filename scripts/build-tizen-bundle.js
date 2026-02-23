/**
 * Build script for Tizen Smart TV
 *
 * This script builds the Angular app and bundles it into a single JavaScript file
 * for Tizen WebView compatibility. Tizen WebView doesn't support ES modules with
 * file:// protocol, so we use esbuild to bundle everything into one IIFE file.
 *
 * Usage: npm run build:tizen
 * Output: dist/tizen-build/
 *
 * After running, copy the contents of dist/tizen-build/ to your VS2022
 * Tizen .NET project's res/www/ folder.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "..", "dist", "smart-tv", "browser");
const tizenOutputPath = path.join(__dirname, "..", "dist", "tizen-build");

console.log("🔨 Step 1: Building Angular for Tizen (no hash)...");
execSync("ng build --configuration=tizen --base-href=./", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});

console.log("📦 Step 2: Bundling for Tizen (no ES modules)...");

// Create output directory
if (fs.existsSync(tizenOutputPath)) {
  fs.rmSync(tizenOutputPath, { recursive: true });
}
fs.mkdirSync(tizenOutputPath, { recursive: true });

// Copy CSS and assets
const cssFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".css"));
cssFiles.forEach((f) => {
  fs.copyFileSync(path.join(distPath, f), path.join(tizenOutputPath, f));
});

// Copy favicon
if (fs.existsSync(path.join(distPath, "favicon.ico"))) {
  fs.copyFileSync(
    path.join(distPath, "favicon.ico"),
    path.join(tizenOutputPath, "favicon.ico"),
  );
}

// Copy assets folder if exists
const assetsPath = path.join(distPath, "assets");
if (fs.existsSync(assetsPath)) {
  copyDir(assetsPath, path.join(tizenOutputPath, "assets"));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// Find main and polyfills files
const jsFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".js"));
const mainFile = jsFiles.find((f) => f.startsWith("main") && f.endsWith(".js"));
const polyfillsFile = jsFiles.find(
  (f) => f.startsWith("polyfills") && f.endsWith(".js"),
);

console.log("Main file:", mainFile);
console.log("Polyfills file:", polyfillsFile);

// Use esbuild to bundle everything into one IIFE file
const entryContent = `
import './${polyfillsFile}';
import './${mainFile}';
`;

// Create temp entry file
const tempEntry = path.join(distPath, "_tizen_entry.js");
fs.writeFileSync(tempEntry, entryContent);

try {
  // Bundle with esbuild - convert to IIFE (no ES modules)
  execSync(
    `npx esbuild "${tempEntry}" --bundle --format=iife --platform=browser --target=es2020 --outfile="${path.join(tizenOutputPath, "bundle.js")}" --minify`,
    {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    },
  );
  console.log("✅ Bundle created successfully!");
} catch (e) {
  console.error("❌ esbuild failed:", e.message);
  // Fallback: try without minify
  try {
    execSync(
      `npx esbuild "${tempEntry}" --bundle --format=iife --platform=browser --target=es2020 --outfile="${path.join(tizenOutputPath, "bundle.js")}"`,
      {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      },
    );
    console.log("✅ Bundle created (without minify)");
  } catch (e2) {
    console.error("❌ esbuild failed completely:", e2.message);
    process.exit(1);
  }
} finally {
  // Clean up temp file
  if (fs.existsSync(tempEntry)) {
    fs.unlinkSync(tempEntry);
  }
}

// Create index.html for Tizen
const cssLinks = cssFiles
  .map((f) => `    <link rel="stylesheet" href="${f}">`)
  .join("\n");

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>SmartTV</title>
    <base href="./">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:;">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
${cssLinks}
    <style>
        .tizen-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 24px;
            font-family: sans-serif;
            background: var(--ion-background-color, #1a1a2e);
            color: var(--ion-text-color, white);
        }
        .tizen-error {
            color: #ff6b6b;
            padding: 20px;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="tizen-status" class="tizen-loading">Loading SmartTV...</div>
    <app-root></app-root>

    <!-- Mock Capacitor/Cordova for Ionic -->
    <script>
        window.Capacitor = {
            isNativePlatform: function() { return false; },
            isPluginAvailable: function() { return false; },
            getPlatform: function() { return 'web'; },
            convertFileSrc: function(url) { return url; },
            Plugins: {}
        };
        window.Ionic = window.Ionic || {};
        window.Ionic.mode = 'md';

        // Fire deviceready event
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                document.dispatchEvent(new Event('deviceready'));
            }, 100);
        });

        // Error handling
        window.onerror = function(msg, url, line) {
            var status = document.getElementById('tizen-status');
            if (status) {
                status.className = 'tizen-error';
                status.innerHTML = 'Error: ' + msg + '\\nFile: ' + url + '\\nLine: ' + line;
            }
            return true;
        };

        // Hide loading when Angular renders
        var observer = new MutationObserver(function() {
            var appRoot = document.querySelector('app-root');
            if (appRoot && appRoot.children.length > 0) {
                var status = document.getElementById('tizen-status');
                if (status) status.style.display = 'none';
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    </script>

    <!-- Single bundled file - NO ES modules -->
    <script src="bundle.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(tizenOutputPath, "index.html"), indexHtml);

console.log("✅ Tizen build ready at:", tizenOutputPath);
console.log("📋 Files created:");
fs.readdirSync(tizenOutputPath).forEach((f) => {
  const stat = fs.statSync(path.join(tizenOutputPath, f));
  const size = stat.isDirectory()
    ? "DIR"
    : (stat.size / 1024).toFixed(1) + " KB";
  console.log("  -", f, "(" + size + ")");
});
console.log("👉 Copy all files to VS2022 TizenApp2/res/www/");
