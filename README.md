# SmartTV

Angular application for Smart TV, supporting Web, Android TV, and Samsung Tizen TV platforms.

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running on Web](#running-on-web)
- [Running on Android TV](#running-on-android-tv)
- [Running on Samsung Tizen TV](#running-on-samsung-tizen-tv)
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

| Technology   | Version | Description                        |
| ------------ | ------- | ---------------------------------- |
| Angular      | 17.3.0  | Main framework                     |
| Ionic        | 8.7.17  | UI Components                      |
| Capacitor    | 8.1.0   | Native bridge for Android          |
| esbuild      | 0.27.3  | Bundler for Tizen                  |
| TypeScript   | 5.4.2   | Programming language               |
| Browserslist | -       | Controls JS output for TV WebViews |

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

## Running on Android TV

### Requirements

1. **Java JDK 17** (required)
   - Download: https://adoptium.net/
   - Set `JAVA_HOME` environment variable

2. **Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK (API level 35)
   - Install Android Build Tools

3. **Android SDK** (via Android Studio)
   - SDK Platform: Android 15.0 (API 35)
   - Build Tools: 35.0.0
   - Set `ANDROID_HOME` environment variable

4. **ADB** (Android Debug Bridge)
   - Included in Android SDK platform-tools
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

5. **Android TV Emulator or physical device**
   - Create AVD with TV profile in Android Studio
   - Or enable Developer Mode on a real Android TV

### Environment Variables (Windows)

```batch
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x
ANDROID_HOME=C:\Users\<username>\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

### Running Steps

```bash
# Option 1: Open project in Android Studio
npm run android
# Then Run from Android Studio

# Option 2: Build and run directly (requires connected emulator/device)
npm run run:android

# Option 3: Build APK and install manually
npm run build:apk        # Build debug APK
npm run install:apk      # Install APK to device
npm run launch:app       # Launch app

# Or run all in one command
npm run test:apk
```

### APK Output

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

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
