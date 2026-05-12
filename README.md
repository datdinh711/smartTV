# SmartTV

Angular application for Smart TV, supporting Web, Android TV, and Samsung Tizen TV platforms.

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running on Web](#running-on-web)
- [Running on Android TV](#running-on-android-tv)
- [Running on Samsung Tizen TV](#running-on-samsung-tizen-tv)
- [Running on Desktop (Electron)](#running-on-desktop-electron)
- [Commands Reference](#commands-reference)

---

## Project Structure

```
smartTV/
├── android/                    # Android project (Capacitor)
│   ├── app/
│   │   └── build/outputs/apk/  # APK output files
│   └── gradlew.bat             # Gradle wrapper
├── dist/
│   ├── smart-tv/browser/       # Angular production build
│   └── tizen-build/            # Tizen bundle output
├── electron/                   # Electron desktop app
│   ├── main.js                 # Main process entry point
│   └── preload.js              # Preload script (context bridge)
├── release/                    # Electron build output
│   └── win-unpacked/           # Unpacked build output
├── scripts/
│   └── build-tizen-bundle.js   # Build script for Tizen
├── src/
│   ├── app/                    # Angular components
│   ├── assets/                 # Static assets
│   ├── index.html              # Entry HTML
│   ├── main.ts                 # Entry point
│   └── styles.scss             # Global styles
├── angular.json                # Angular CLI configuration
├── capacitor.config.ts         # Capacitor configuration
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## Technologies Used

| Technology       | Version | Description                        |
| ---------------- | ------- | ---------------------------------- |
| Angular          | 17.3.0  | Main framework                     |
| Ionic            | 8.7.17  | UI Components                      |
| Capacitor        | 8.1.0   | Native bridge for Android          |
| Electron         | 41.0.0  | Desktop app framework              |
| electron-builder | 26.8.1  | Packaging & distribution           |
| esbuild          | 0.27.3  | Bundler for Tizen                  |
| TypeScript       | 5.4.2   | Programming language               |
| Browserslist     | -       | Controls JS output for TV WebViews |

### Browser Compatibility

The `.browserslistrc` file ensures JavaScript output is compatible with:

- **Android TV**: Chrome 90+ WebView (Android 11+)
- **Samsung Tizen**: ES2017 bundle via esbuild

This prevents `SyntaxError: Unexpected token` errors on older WebView engines.

---

## Installation

### General Requirements

- **Node.js** >= 18.x
- **npm** >= 9.x

```bash
# Clone project
git clone <repository-url>
cd smartTV

# Install dependencies
npm install
```

---

## Running on Web

### Requirements

- Node.js >= 18.x
- npm >= 9.x

### Steps

```bash
# Run development server
npm start

# Open browser: http://localhost:4200
```

### Production Build

```bash
npm run build
# Output: dist/smart-tv/browser/
```

---

## Running in Docker

### Build and run with Docker Compose

Create a bind mount from the host `src/assets/videos` folder into the container so the large video files are not baked into the image.

```bash
docker compose up --build -d
```

### Run with plain Docker

```bash
docker build -t smarttv .
docker run -d -p 9877:9877 -v "${PWD}/src/assets/videos:/usr/share/nginx/html/assets/videos:ro" smarttv
```

If you are on Windows PowerShell, use:

```powershell
docker run -d -p 9877:9877 -v "${PWD}\src\assets\videos:/usr/share/nginx/html/assets/videos:ro" smarttv
```

---

## Running on Android TV

### Project Config

| Property         | Value                  |
| ---------------- | ---------------------- |
| App ID           | `com.example.smarttv`  |
| Min SDK          | 22 (Android 5.1)       |
| Target SDK       | 34 (Android 14)        |
| Compile SDK      | 35 (Android 15)        |
| Gradle           | 8.6                    |
| Java             | 17                     |

---

### Step 1 — Install Java JDK 17

Download and install from: https://adoptium.net/ (Temurin JDK 17)

Set environment variable (Windows — System Properties → Environment Variables):

```batch
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
```

Verify:
```bash
java -version
# openjdk version "17.x.x" ...
```

---

### Step 2 — Install Android Studio

Download the latest stable version from: https://developer.android.com/studio

During installation, make sure these components are checked:
- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)

---

### Step 3 — Install SDK Components

Open **Android Studio → Settings → Languages & Frameworks → Android SDK**

#### SDK Platforms tab — install:
- ✅ Android 14.0 (API 34) — *recommended for TV emulator*
- ✅ Android 15.0 (API 35) — *compile target*

#### SDK Tools tab — install:
- ✅ Android SDK Build-Tools **35.0.0**
- ✅ Android SDK Platform-Tools
- ✅ Android Emulator
- ✅ Android Emulator hypervisor driver (HAXM or WHPX depending on your CPU)

> **Note**: The old `tools/` folder is deprecated. Do **not** add `%ANDROID_HOME%\tools` to PATH.

---

### Step 4 — Set Environment Variables (Windows)

Open **System Properties → Advanced → Environment Variables** and add:

| Variable       | Value                                               |
| -------------- | --------------------------------------------------- |
| `JAVA_HOME`    | `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot` |
| `ANDROID_HOME` | `C:\Users\<username>\AppData\Local\Android\Sdk`     |

Add to `Path`:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

Restart your terminal, then verify:
```bash
adb --version
# Android Debug Bridge version 1.0.x
```

---

### Step 5 — Create Android TV Emulator

1. Open **Android Studio → Device Manager** (right toolbar or View → Tool Windows → Device Manager)
2. Click **+** → **Create Virtual Device**
3. Select category: **Television**
4. Choose a device: **Android TV (1080p)** or **Android TV (720p)**
5. Click **Next**
6. Select system image:
   - Tab **"Other Images"** (TV images are not in the default "Recommended" tab)
   - Choose **API 34**, ABI: **x86_64**, Target: **Android 14.0 (Google APIs)**
   - Click **Download** if not yet installed, then select it
7. Click **Next → Finish**
8. Start the emulator by clicking the ▶ button

> **Tip**: If you have an Intel CPU, enable **Intel HAXM** for better emulator performance. For AMD/ARM, use **Windows Hypervisor Platform (WHPX)** — enable it via Windows Features.

---

### Step 6 — Run the App

Make sure the TV emulator is running, then choose one of the options below:

#### Option 1: Open in Android Studio (recommended for first run)
```bash
npm run android
# This opens the android/ folder in Android Studio
# Press the Run ▶ button and select the TV emulator
```

#### Option 2: Build and run directly via CLI
```bash
npm run run:android
# Builds Angular, syncs Capacitor, then deploys to the running emulator
```

#### Option 3: Build APK manually and install
```bash
# Build debug APK
npm run build:apk

# Install to running emulator/device
npm run install:apk

# Launch the app
npm run launch:app

# Or all in one
npm run test:apk
```

> **Windows note**: The `build:apk:debug` script uses `./gradlew` which works in Git Bash.
> In Command Prompt or PowerShell, run manually:
> ```bat
> cd android
> gradlew.bat assembleDebug
> ```

---

### APK Output

| Build Type | Path |
| ---------- | ---- |
| Debug      | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release    | `android/app/build/outputs/apk/release/app-release.apk` |

---

### Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `JAVA_HOME` not found | Set `JAVA_HOME` and restart terminal |
| `SDK location not found` | Open `android/local.properties`, set `sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk` |
| Emulator is slow | Enable hardware acceleration (HAXM or WHPX) |
| `adb: command not found` | Add `%ANDROID_HOME%\platform-tools` to PATH |
| App crashes on launch | Check WebView version — TV emulator needs API 34+ for modern WebView support |
| `./gradlew: Permission denied` | Run `git update-index --chmod=+x android/gradlew` |

---

## Running on Samsung Tizen TV

### Requirements

1. **Visual Studio 2022** (Windows)
   - Download: https://visualstudio.microsoft.com/
   - Workload: .NET desktop development

2. **Visual Studio Extension for Tizen**
   - Download: https://docs.tizen.org/application/vstools/
   - Install Tizen SDK via extension

3. **Tizen SDK** (install via VS extension or Tizen Studio)
   - Tizen Platform: TV 10.0+
   - Emulator images

4. **Certificate** (for physical devices)
   - Create Samsung Certificate in Tizen Certificate Manager
   - Register device DUID

### Running Steps

#### Step 1: Build Angular for Tizen

```bash
npm run build:tizen
# Output: dist/tizen-build/
```

#### Step 2: Create Tizen .NET project in VS2022

1. Open Visual Studio 2022
2. Create New Project → **Tizen NUI Application**
3. Project name: `TizenSmartTV`
4. Create folder structure: `res/www/`

#### Step 3: Copy files

Copy all files from `dist/tizen-build/` to `<VS Project>/res/www/`:

- `bundle.js`
- `index.html`
- `styles-*.css`
- `favicon.ico`

#### Step 4: Configure Main.cs

```csharp
using Tizen.NUI;
using Tizen.NUI.BaseComponents;

namespace TizenSmartTV
{
    class Program : NUIApplication
    {
        protected override void OnCreate()
        {
            base.OnCreate();
            Initialize();
        }

        void Initialize()
        {
            Window.Default.KeyEvent += OnKeyEvent;
            Window.Default.BackgroundColor = Color.White;

            var webView = new WebView()
            {
                Size = new Size(Window.Default.WindowSize.Width, Window.Default.WindowSize.Height),
                Position = new Position(0, 0)
            };

            webView.Settings.JavaScriptEnabled = true;

            string resPath = Tizen.Applications.Application.Current.DirectoryInfo.Resource;
            string indexPath = System.IO.Path.Combine(resPath, "www", "index.html");
            webView.LoadUrl("file://" + indexPath);

            Window.Default.GetDefaultLayer().Add(webView);
        }

        public void OnKeyEvent(object sender, Window.KeyEventArgs e)
        {
            if (e.Key.State == Key.StateType.Down &&
                (e.Key.KeyPressedName == "XF86Back" || e.Key.KeyPressedName == "Escape"))
            {
                Exit();
            }
        }

        static void Main(string[] args)
        {
            var app = new Program();
            app.Run(args);
        }
    }
}
```

#### Step 5: Configure .csproj

Add to the `.csproj` file:

```xml
<ItemGroup>
  <TizenResource Include="res\www\**\*" />
</ItemGroup>
```

#### Step 6: Build and Run

1. **Build** → **Clean Solution**
2. **Build** → **Rebuild Solution**
3. Select Tizen Emulator or device
4. Press **F5** to run

#### Step 7: Install TPK directly to Emulator (Alternative)

If you have a `.tpk` file and want to install it directly to the emulator:

##### Prerequisites

- Tizen SDK installed (includes `sdb` tool)
- Add Tizen tools to PATH: `C:\tizen-studio\tools`
- Emulator is running

##### Commands

```bash
# Check connected devices/emulators
sdb devices

# Install TPK to emulator
sdb install <path-to-your-app>.tpk

# Example
sdb install "C:\Projects\TizenSmartTV\bin\Debug\TizenSmartTV-1.0.0.tpk"

# If multiple devices connected, specify target
sdb -s <device-serial> install <path-to-your-app>.tpk

# Uninstall app (using package ID)
sdb uninstall <package-id>

# Launch app after install
sdb shell app_launcher -s <app-id>
```

##### TPK Location

After building in VS2022, the `.tpk` file is located at:

```
<VS Project>\bin\Debug\<ProjectName>-<version>.tpk
```

##### Useful SDB Commands

| Command                     | Description                      |
| --------------------------- | -------------------------------- |
| `sdb devices`               | List connected devices/emulators |
| `sdb install <tpk>`         | Install TPK package              |
| `sdb uninstall <pkg-id>`    | Uninstall app by package ID      |
| `sdb shell`                 | Open shell on device             |
| `sdb push <local> <remote>` | Copy file to device              |
| `sdb pull <remote> <local>` | Copy file from device            |
| `sdb dlog`                  | View device logs                 |
| `sdb capability`            | Show device capabilities         |

---

## Running on Desktop (Electron)

Electron allows running the Angular application as a native desktop app on Windows.

### Requirements

- Node.js >= 18.x
- npm >= 9.x
- Dependencies installed via `npm install`

### Preview Production Build

```bash
# Build Angular and run Electron from static files (no hot reload)
npm run electron:start
```

### Build for Distribution

```bash
# Build to directory (unpacked, for quick testing)
npm run electron:build
# Output: release/win-unpacked/

# Build NSIS installer (.exe)
npm run electron:build:exe
# Output: release/SmartTV Setup 0.0.0.exe

# Build portable executable (no installation required)
npm run electron:build:portable
# Output: release/SmartTV-portable.exe
```

### Build Output

| Command                   | Output                            | Description                                 |
| ------------------------- | --------------------------------- | ------------------------------------------- |
| `electron:build`          | `release/win-unpacked/`           | Unpacked directory, run directly            |
| `electron:build:exe`      | `release/SmartTV Setup 0.0.0.exe` | NSIS installer                              |
| `electron:build:portable` | `release/SmartTV-portable.exe`    | Portable executable, no installation needed |

### Electron Configuration

Packaging configuration is in the `"build"` section of `package.json`:

- **appId**: `com.example.smarttv`
- **productName**: `SmartTV`
- **Output directory**: `release/`
- **Windows target**: NSIS installer (x64)
- **Icon**: `src/assets/images/icon.ico`

---

## Commands Reference

### Web Development

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm start`     | Run development server (http://localhost:4200) |
| `npm run build` | Build for production                           |
| `npm run watch` | Build and watch for changes                    |
| `npm test`      | Run unit tests                                 |

### Android TV

| Command                     | Description                            |
| --------------------------- | -------------------------------------- |
| `npm run android`           | Open project in Android Studio         |
| `npm run run:android`       | Build and run on device/emulator       |
| `npm run build:mobile`      | Build Angular and sync with Capacitor  |
| `npm run sync`              | Sync web assets with native project    |
| `npm run build:apk`         | Build debug APK                        |
| `npm run build:apk:debug`   | Build debug APK (detailed)             |
| `npm run build:apk:release` | Build release APK                      |
| `npm run install:apk`       | Install APK to connected device        |
| `npm run launch:app`        | Launch app on device                   |
| `npm run test:apk`          | Build, install and launch (all-in-one) |

### Desktop (Electron)

| Command                           | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `npm run electron:dev`            | Run dev mode (hot reload + DevTools)             |
| `npm run electron:start`          | Build Angular and run Electron from static files |
| `npm run electron:build`          | Build to unpacked directory                      |
| `npm run electron:build:exe`      | Build NSIS installer (.exe)                      |
| `npm run electron:build:portable` | Build portable executable (.exe)                 |

### Samsung Tizen TV

| Command               | Description                |
| --------------------- | -------------------------- |
| `npm run build:tizen` | Build and bundle for Tizen |

Output of `build:tizen` is the `dist/tizen-build/` folder containing:

- `bundle.js` - Single bundled JavaScript (no ES modules)
- `index.html` - HTML with Capacitor mock for Ionic
- `styles-*.css` - Compiled CSS
- `favicon.ico` - App icon

---

## Important Notes

### Android TV

- Requires Java 17, do not use Java 20+ due to Gradle compatibility issues
- Disable Instant Run in Android Studio to avoid build errors

### Desktop (Electron)

- The `--configuration electron` flag in `angular.json` is used when building for Electron
- Dev mode (`electron:dev`) uses `concurrently` and `wait-on` to synchronize Angular dev server with Electron
- `electron/main.js` distinguishes dev mode from production mode via the `--dev-server` flag

### Tizen TV

- Tizen WebView does not support ES modules from `file://` protocol
- The `build-tizen-bundle.js` script uses esbuild to bundle everything into a single file
- Must mock Capacitor because Ionic requires it for initialization

---

## Troubleshooting

### Android: "SDK location not found"

```bash
# Create file android/local.properties
sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

### Android: Gradle build failed

```bash
# Clear cache and rebuild
cd android
./gradlew clean
cd ..
npm run build:apk
```

### Tizen: White screen

- Verify all files are copied to `res/www/`
- Check that `.csproj` includes `TizenResource`
- Clean and Rebuild solution

---

## License

This project is private.
