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

if (fs.existsSync(path.join(distPath, "assets", "images", "app_icon.png"))) {
  fs.copyFileSync(
    path.join(distPath, "assets", "images", "app_icon.png"),
    path.join(tizenOutputPath, "app_icon.png")
  );
}

const assetsPath = path.join(distPath, "assets");
if (fs.existsSync(assetsPath)) {
  copyDir(assetsPath, path.join(tizenOutputPath, "assets"));
}

// Angular rewrites url() references found in component styles (background-image
// in .scss files) to point at a separate "media" output folder — copy it too,
// otherwise every CSS background-image 404s under file://.
const mediaPath = path.join(distPath, "media");
if (fs.existsSync(mediaPath)) {
  copyDir(mediaPath, path.join(tizenOutputPath, "media"));
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
const jsFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".js"));
const mainFile = jsFiles.find((f) => f.startsWith("main"));
const polyfillsFile = jsFiles.find((f) => f.startsWith("polyfills"));

const entryContent = `import "./${polyfillsFile}";\nimport "./${mainFile}";\n`;
const tempEntry = path.join(distPath, "_tizen_entry.js");
fs.writeFileSync(tempEntry, entryContent);

try {
  execSync(
    `npx esbuild "${tempEntry}" --bundle --format=iife --platform=browser --target=es2020 --outfile="${path.join(
      tizenOutputPath,
      "bundle.js"
    )}" --minify --log-level=info`,
    { stdio: "inherit", cwd: path.join(__dirname, ".."), timeout: 120000 }
  );
  console.log("✅ Bundle created successfully!");
} catch (e) {
  console.error("❌ esbuild failed:", e.message);
  process.exit(1);
} finally {
  if (fs.existsSync(tempEntry)) {
    fs.unlinkSync(tempEntry);
  }
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
    <link rel="icon" type="image/png" href="app_icon.png">
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

// =========================================================================
// =========================================================================
// 🚀 STEP 5: TIZEN PACKAGE AUTOMATION (Khắc phục lỗi Cannot provide package function)
// =========================================================================
console.log("\n🚀 Step 5: Packaging into Tizen TPK...");

// 5.1 Tạo config.xml chuẩn Tizen Web App
const configXml = `<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets" id="org.tizen.smartTV" version="1.0.0" viewmodes="maximized">
    <tizen:application id="org.tizen.smartTV.smartTV" package="org.tizen.smartTV" required_version="3.0"/>
    <content src="index.html"/>
    <feature name="http://tizen.org/feature/screen.size.normal.1080.1920"/>
    <icon src="app_icon.png"/>
    <name>smartTV</name>
</widget>`;
fs.writeFileSync(path.join(tizenOutputPath, "config.xml"), configXml);

// 5.2 Tạo file .project chuẩn (BẮT BUỘC ĐỂ TIZEN CLI NHẬN DIỆN WEB PROJECT)
const projectXml = `<?xml version="1.0" encoding="UTF-8"?>
<projectDescription>
	<name>smartTV</name>
	<comment></comment>
	<projects>
	</projects>
	<buildSpec>
		<buildCommand>
			<name>org.tizen.web.project.TizenWebBuilder</name>
			<arguments>
			</arguments>
		</buildCommand>
	</buildSpec>
	<natures>
		<nature>org.tizen.web.project.TizenWebNature</nature>
	</natures>
</projectDescription>`;
fs.writeFileSync(path.join(tizenOutputPath, ".project"), projectXml);

// 5.3 Tạo file .tizenproject
fs.writeFileSync(path.join(tizenOutputPath, ".tizenproject"), "/* Tizen Project Settings */");

// 5.4 Gọi lệnh đóng gói TPK
const tizenCliPath = `"D:\\tizen-studio\\tools\\ide\\bin\\tizen.bat"`;
const certName = "samsumcertificate";

try {
  execSync(`${tizenCliPath} package -t tpk -s ${certName} -- .`, {
    stdio: "inherit",
    cwd: tizenOutputPath
  });
  console.log("\n🎉 BUILD TPK SUCCESSFUL!");
} catch (e) {
  console.error("❌ Tizen Packaging failed:", e.message);
}

// Summary
console.log("\n✅ Tizen build ready at:", tizenOutputPath);
console.log("📋 Files:");
fs.readdirSync(tizenOutputPath).forEach((f) => {
  const stat = fs.statSync(path.join(tizenOutputPath, f));
  const size = stat.isDirectory()
    ? "DIR"
    : (stat.size / 1024).toFixed(1) + " KB";
  console.log("  -", f, "(" + size + ")");
});