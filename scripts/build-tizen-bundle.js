/**
 * Build script for Tizen Smart TV
 *
 * Builds the Angular app and bundles into a single IIFE JavaScript file
 * for Tizen WebView (file:// protocol, no ES modules support).
 *
 * Key fixes for file:// protocol:
 * - IIFE format instead of ES modules
 * - History.pushState/replaceState monkey-patch (origin 'null' on file://)
 * - Capacitor mock for Ionic
 *
 * Usage: npm run build:tizen
 * Output: dist/tizen-build/
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "..", "dist", "smart-tv", "browser");
const tizenOutputPath = path.join(__dirname, "..", "dist", "tizen-build");

// Step 1: Angular build
console.log("🔨 Step 1: Building Angular for Tizen...");
execSync("ng build --configuration=tizen --base-href=./", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});

// Step 2: Prepare output directory
console.log("📦 Step 2: Bundling for Tizen...");

if (fs.existsSync(tizenOutputPath)) {
  try {
    fs.rmSync(tizenOutputPath, { recursive: true, force: true });
  } catch (e) {
    // Directory may be locked (e.g. by http-server), just overwrite files
  }
}
fs.mkdirSync(tizenOutputPath, { recursive: true });

// Copy CSS, favicon, assets
const cssFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".css"));
cssFiles.forEach((f) => {
  fs.copyFileSync(path.join(distPath, f), path.join(tizenOutputPath, f));
});

if (fs.existsSync(path.join(distPath, "favicon.ico"))) {
  fs.copyFileSync(
    path.join(distPath, "favicon.ico"),
    path.join(tizenOutputPath, "favicon.ico"),
  );
}

const assetsPath = path.join(distPath, "assets");
if (fs.existsSync(assetsPath)) {
  copyDir(assetsPath, path.join(tizenOutputPath, "assets"));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

// Step 3: Bundle JS with esbuild
// esbuild follows static imports from main.js automatically.
// We only need polyfills + main as entry points.
const jsFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".js"));
const mainFile = jsFiles.find((f) => f.startsWith("main"));
const polyfillsFile = jsFiles.find((f) => f.startsWith("polyfills"));

const entryContent = `import "./${polyfillsFile}";\nimport "./${mainFile}";\n`;
const tempEntry = path.join(distPath, "_tizen_entry.js");
fs.writeFileSync(tempEntry, entryContent);

try {
  execSync(
    `npx esbuild "${tempEntry}" --bundle --format=iife --platform=browser --target=es2020 --outfile="${path.join(tizenOutputPath, "bundle.js")}" --minify --log-level=info`,
    { stdio: "inherit", cwd: path.join(__dirname, ".."), timeout: 120000 },
  );
  console.log("✅ Bundle created successfully!");
} catch (e) {
  console.error("❌ esbuild failed:", e.message);
  process.exit(1);
} finally {
  fs.unlinkSync(tempEntry);
}

// Step 4: Generate index.html
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
</head>
<body>
    <app-root></app-root>

    <script>
        // Fix file:// protocol: History API throws SecurityError because origin is 'null'.
        if (window.location.protocol === 'file:') {
            var origPushState = History.prototype.pushState;
            var origReplaceState = History.prototype.replaceState;
            History.prototype.pushState = function(state, title, url) {
                try { origPushState.call(this, state, title, url); } catch(e) {}
            };
            History.prototype.replaceState = function(state, title, url) {
                try { origReplaceState.call(this, state, title, url); } catch(e) {}
            };
        }

        // Mock Capacitor for Ionic
        window.Capacitor = {
            isNativePlatform: function() { return false; },
            isPluginAvailable: function() { return false; },
            getPlatform: function() { return 'web'; },
            convertFileSrc: function(url) { return url; },
            Plugins: {}
        };
        window.Ionic = window.Ionic || {};
        window.Ionic.mode = 'md';

        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                document.dispatchEvent(new Event('deviceready'));
            }, 100);
        });
    </script>

    <script src="bundle.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(tizenOutputPath, "index.html"), indexHtml);

// Summary
console.log("✅ Tizen build ready at:", tizenOutputPath);
console.log("📋 Files:");
fs.readdirSync(tizenOutputPath).forEach((f) => {
  const stat = fs.statSync(path.join(tizenOutputPath, f));
  const size = stat.isDirectory()
    ? "DIR"
    : (stat.size / 1024).toFixed(1) + " KB";
  console.log("  -", f, "(" + size + ")");
});
console.log("👉 Copy all files to VS2022 TizenApp2/res/www/");
