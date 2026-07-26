# Quy trình build & deploy app Smart TV (Tizen)

Tài liệu này mô tả quy trình chung, không gắn với đường dẫn của một máy cụ
thể. Trước khi làm theo, điền các biến số dưới đây cho đúng với máy đang dùng.

## Bảng biến số theo từng máy

| Biến | Ý nghĩa | Cách xác định trên máy của bạn |
|---|---|---|
| `<ANGULAR_PROJECT>` | Thư mục source Angular | Nơi chứa `package.json`, `angular.json`, script `npm run build:tizen` |
| `<TIZEN_PROJECT>` | Thư mục project Tizen Studio | Nơi chứa `config.xml`, `.project`, `.tizenproject`, `install-tv.bat` |
| `<TIZEN_STUDIO_HOME>` | Thư mục cài Tizen Studio | Nơi chứa `tools\ide\bin\tizen.bat` và `tools\sdb.exe` (mặc định thường là `C:\tizen-studio` hoặc ổ đĩa khác nếu chọn custom khi cài) |
| `<SECURITY_PROFILE>` | Tên security profile dùng để ký app | Mở Tizen Studio > Tools > Certificate Manager, hoặc xem trong `<user>\tizen-studio-data\profile\profiles.xml`, thuộc tính `active` |
| `<APP_ID>` | `tizen:application id` của app | Mở `config.xml` trong `<TIZEN_PROJECT>`, xem thẻ `<tizen:application id="...">` |
| `<CERT_FOLDER>` | Thư mục chứa file `.p12`/`device-profile.xml` của profile ký | Đường dẫn `key=` trong `profiles.xml` ở trên |

> Toàn bộ đường dẫn tuyệt đối trong ví dụ dưới đây chỉ mang tính minh hoạ —
> luôn thay bằng giá trị thật lấy từ bảng trên.

Có **2 project riêng biệt**, không được gộp chung:

| Project | Vai trò |
|---|---|
| `<ANGULAR_PROJECT>` (Angular, source thật) | Nơi code UI, chạy `npm run build:tizen` |
| `<TIZEN_PROJECT>` (Tizen Studio project) | Nơi build/ký/đóng gói `.wgt` và cài lên TV/emulator |

---

## Bước 1 — Build Angular thành bundle cho Tizen

Trong project Angular:

```
cd <ANGULAR_PROJECT>
npm run build:tizen
```

Lệnh này chạy script `scripts/build-tizen-bundle.js`, thực hiện:
1. `ng build --configuration=tizen --base-href=./`
2. Gộp toàn bộ JS (main + polyfills) thành **1 file duy nhất** `bundle.js` bằng
   esbuild, format IIFE (bắt buộc vì Tizen WebView chạy qua `file://` không hỗ
   trợ ES modules).
3. Copy css, `assets/`, `media/` (ảnh nền lấy từ `url()` trong SCSS).
4. Tự sinh `index.html` mới trỏ tới `bundle.js`, có patch History API +
   mock `Capacitor`/`Ionic` để chạy được trên `file://`.

Output nằm ở: `<ANGULAR_PROJECT>\dist\tizen-build\`, gồm:

```
index.html
bundle.js
styles.css (hoặc *.css)
assets/
media/
app_icon.png
config.xml      <-- KHÔNG dùng file này, xem lưu ý bên dưới
.project        <-- KHÔNG dùng file này
.tizenproject   <-- KHÔNG dùng file này
```

> Ghi chú: script `build-tizen-bundle.js` có tự sinh `config.xml`/`.project` và
> tự gọi `tizen package -t tpk` riêng ở cuối, nhưng phần đó dùng `id`/`package`
> và tên profile ký khác với `<TIZEN_PROJECT>` thật (không đồng bộ với
> `<APP_ID>` / `<SECURITY_PROFILE>` ở trên), nên **không dùng kết quả đóng gói
> đó**. Chỉ lấy các file web (html/js/css/assets/media) từ `dist/tizen-build/`.
> Nếu build lại từ một máy khác, nên kiểm tra `id`/tên profile bên trong script
> này có khớp với `<TIZEN_PROJECT>` không, tránh nhầm lẫn.

## Bước 2 — Copy file build qua project Tizen Studio

Copy **đè** các file/thư mục sau từ:
`<ANGULAR_PROJECT>\dist\tizen-build\`

qua:
`<TIZEN_PROJECT>\`

- `index.html`
- `bundle.js`
- `styles.css` (mọi file `*.css` được sinh ra)
- `assets/` (nguyên thư mục)
- `media/` (nguyên thư mục)

**KHÔNG copy / KHÔNG đè** các file sau — đây là file cấu hình riêng của
`<TIZEN_PROJECT>`, đã setup đúng sẵn (package id, chứng chỉ ký, v.v.):

- `config.xml`
- `.project`, `.tizenproject`, `.tproject`
- `icon.png`, `app_icon.png`
- `.sign/`, `.settings/`
- `css/`, `js/`, `images/` (file mẫu mặc định của Tizen Studio, không còn dùng
  tới vì `index.html` đã trỏ thẳng vào `bundle.js`/`styles.css` ở root)

## Bước 3 — Build, ký và cài `.wgt` bằng `install-tv.bat`

`install-tv.bat` (nằm trong `<TIZEN_PROJECT>`) có phần khai báo biến ở đầu
file — đây chính là chỗ cần chỉnh khi mang script sang máy khác:

```bat
set TIZEN=<TIZEN_STUDIO_HOME>\tools\ide\bin\tizen.bat
set SDB=<TIZEN_STUDIO_HOME>\tools\sdb.exe
set PROJECT=<TIZEN_PROJECT>
set PROFILE=<SECURITY_PROFILE>
set APPID=<APP_ID>
```

Chạy `install-tv.bat` (double-click), script tự làm hết các bước sau:

1. `tizen build-web` — build project thành `.buildResult/`
2. `tizen package -t wgt -s <SECURITY_PROFILE>` — đóng gói + ký thành `.wgt`
3. Copy kết quả đè thành `tvsmart.wgt` ở root project
4-6. Restart sdb server, liệt kê thiết bị đang kết nối (dừng lại để xác nhận
   bằng mắt thiết bị đã hiện ra chưa)
7. **`tizen install -n tvsmart.wgt -s <serial>`** — cài lên thiết bị (serial
   tự lấy từ `sdb devices`)
8. **`tizen run -p <APP_ID> -s <serial>`** — chạy app

> **CẢNH BÁO QUAN TRỌNG:** bước 7-8 phải dùng lệnh `tizen install` /
> `tizen run`, **TUYỆT ĐỐI KHÔNG** dùng `sdb install` / `sdb shell
> app_launcher`. Đã test thực tế: `sdb install` chỉ push được file `.wgt` lên
> máy (báo thành công, exit code 0) nhưng **không kích hoạt bước cài đặt thật
> sự** trên thiết bị — app sẽ không bao giờ xuất hiện, mà không có bất kỳ
> thông báo lỗi nào. Đây là hành vi chung của công cụ `sdb`, không phụ thuộc
> máy nào, nên áp dụng ở mọi nơi. Chỉ có `tizen install` (cùng cơ chế mà nút
> "Run As" trong Tizen Studio IDE dùng) mới cài thật.

## Lưu ý về chứng chỉ (certificate) — Device ID

Certificate dùng để ký app: `<SECURITY_PROFILE>` (xem active profile trong
`profiles.xml` như bảng biến số ở trên).

File cert nằm ở: `<CERT_FOLDER>` (`author.p12`, `distributor.p12`,
`device-profile.xml`, ...).

Nếu đây là chứng chỉ loại **Samsung Developer/Seller** (tạo qua "Samsung
Certificate Extension" trong Tizen Studio), nó sẽ được cấp gắn với **Device ID
(DUID) của từng TV thật cụ thể** đã đăng ký trên Samsung Developer Account —
không phải chứng chỉ tự do dùng cho mọi TV. Mở file `device-profile.xml` trong
`<CERT_FOLDER>`, xem thẻ `<TestDeviceInfo>` để biết danh sách Device ID đang
được phép cài.

**Nếu muốn cài lên một TV thật chưa có trong danh sách đó:**
1. Lấy Device ID của TV đó (xem trong Settings > About/Support của TV, hoặc
   qua Tizen Studio > Device Manager khi TV đã kết nối cùng mạng).
2. Vào Tizen Studio > Certificate Manager (hoặc mở lại wizard "Samsung
   Certificate Extension") > chọn `<SECURITY_PROFILE>` > **thêm Device ID
   mới** vào danh sách thiết bị được cấp quyền, rồi tạo lại/refresh chứng chỉ.
3. Chưa thêm Device ID thì cài lên TV thật đó sẽ **âm thầm thất bại giống hệt
   kiểu lỗi `sdb install`** ở trên (không báo lỗi, app không xuất hiện) — vì
   privilege bị hệ điều hành TV từ chối ở tầng bảo mật, không phải lỗi build.

Riêng với **Tizen Emulator** thì không bị check Device ID này (emulator không
enforce TestDevice DUID), nên một chứng chỉ bị khoá theo TV thật vẫn cài/chạy
được bình thường trên emulator.

---

## Tóm tắt nhanh (quy trình đầy đủ mỗi lần build)

```
# 1) Trong project Angular
cd <ANGULAR_PROJECT>
npm run build:tizen

# 2) Copy đè các file sau từ dist\tizen-build\ qua <TIZEN_PROJECT>\
#    index.html, bundle.js, styles.css, assets/, media/
#    (KHÔNG đè config.xml, .project, .tizenproject, icon*.png, .sign/)

# 3) Trong <TIZEN_PROJECT>
install-tv.bat
```
