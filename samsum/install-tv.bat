@echo off
REM ============================================
REM  Dung cho EMULATOR (khong phai TV that)
REM  QUAN TRONG: phai mo Emulator Manager va Launch
REM  emulator "T-samsung-10.0-x86_64" TRUOC, doi no
REM  boot xong (thay man hinh Home cua TV gia lap)
REM  roi moi chay file .bat nay.
REM ============================================

set TIZEN=D:\tizen-studio\tools\ide\bin\tizen.bat
set SDB=D:\tizen-studio\tools\sdb.exe
set PROJECT=C:\Users\Admin\workspace\tvsmart
set BUILDRESULT=%PROJECT%\.buildResult
set WGT=%PROJECT%\tvsmart.wgt
set PROFILE=samsungtvcert
set APPID=TVsmartApp.smartTV

echo ================================
echo 1. Build web project (tizen build-web)
echo ================================
call "%TIZEN%" build-web -- "%PROJECT%"
if errorlevel 1 goto :error

echo.
echo ================================
echo 2. Dong goi va ky .wgt (tizen package)
echo ================================
call "%TIZEN%" package -t wgt -s %PROFILE% -- "%BUILDRESULT%"
if errorlevel 1 goto :error

echo.
echo ================================
echo 3. Copy .wgt vua build de tvsmart.wgt
echo ================================
copy /Y "%BUILDRESULT%\smartTV.wgt" "%WGT%"

echo.
echo ================================
echo 4. Kill sdb server cu
echo ================================
"%SDB%" kill-server

echo.
echo ================================
echo 5. Start sdb server moi
echo ================================
"%SDB%" start-server

echo.
echo ================================
echo 6. Danh sach thiet bi dang ket noi
echo    ==> PHAI thay emulator xuat hien o day
echo        (vd: emulator-26101   device   T-samsung...)
echo    Neu KHONG thay gi: emulator chua duoc mo/
echo    chua boot xong. Mo Emulator Manager, Launch
echo    emulator, doi boot xong roi chay lai file nay.
echo ================================
"%SDB%" devices
pause

set SERIAL=
for /f "skip=1 tokens=1" %%A in ('"%SDB%" devices') do (
    if not defined SERIAL set SERIAL=%%A
)
if not defined SERIAL (
    echo Khong tim thay thiet bi nao dang ket noi.
    goto :error
)
echo Se cai dat len thiet bi: %SERIAL%

echo.
echo ================================
echo 7. Cai dat tvsmart.wgt len emulator (tizen install)
echo    QUAN TRONG: dung "tizen install", KHONG dung
echo    "sdb install" - sdb install chi push file len
echo    may nhung khong kich hoat cai dat that su, ung
echo    dung se khong bao gio xuat hien tren TV.
echo ================================
call "%TIZEN%" install -n "%WGT%" -s %SERIAL%
if errorlevel 1 goto :error

echo.
echo ================================
echo 8. Chay app tren emulator (tizen run)
echo ================================
call "%TIZEN%" run -p %APPID% -s %SERIAL%
goto :end

:error
echo.
echo ================================
echo LOI: Build/Package that bai. Xem log o tren.
echo ================================
pause
exit /b 1

:end

echo.
echo ================================
echo Hoan tat.
echo ================================
pause
