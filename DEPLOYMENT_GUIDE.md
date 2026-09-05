# 📱 راهنمای نصب و انتشار برنامه چیه (iGig)

## ⭐ روش پیشنهادی: Vercel + PWA (رایگان، ۵ دقیقه)

### قدم ۱: برنامه رو روی Vercel بذارید

1. به سایت [vercel.com](https://vercel.com) برید و با **GitHub** وارد بشید
2. دکمه **"Add New"** → **"Project"** رو بزنید
3. اگر کد برنامه روی GitHub نیست:
   - اول یک Repository روی GitHub بسازید
   - تمام فایل‌های برنامه رو آپلود کنید
4. Repository برنامه رو انتخاب کنید
5. دکمه **"Deploy"** رو بزنید
6. ✅ کمتر از ۲ دقیقه برنامه آماده‌ست!

بعد از استقرار، Vercel یک آدرس مثل این بهتون میده:
```
https://igig-xxxx.vercel.app
```

### قدم ۲: دیتابیس رو تنظیم کنید

**روش ساده:** از [Supabase](https://supabase.com) استفاده کنید (رایگان):
1. اکانت بسازید
2. یک پروژه جدید بسازید
3. آدرس PostgreSQL رو از Settings بگیرید
4. در Vercel → Settings → Environment Variables اضافه کنید:
   - Key: `DATABASE_URL`
   - Value: آدرس Supabase PostgreSQL

**سپس:** در Vercel دکمه **"Redeploy"** رو بزنید

### قدم ۳: برنامه رو روی گوشی نصب کنید

#### 🤖 Android:
1. **Chrome** رو باز کنید
2. آدرس برنامه رو تایپ کنید
3. منتظر بنر **"نصب برنامه"** بشید → کلیک کنید
4. یا: منوی ⋮ → **"Install app"** رو بزنید
5. ✅ آیکون روی صفحه اصلی ظاهر میشه!

#### 🍎 iPhone:
1. **Safari** رو باز کنید
2. آدرس برنامه رو تایپ کنید
3<; دکمه اشتراک □↑ رو بزنید
4. **"Add to Home Screen"** رو انتخاب کنید
5. ✅ نصب شد!

---

## 🖥️ روش دوم: سرور شخصی (VPS)

### قدم ۱: سرور لینوکس بگیرید
- از سایت‌هایی مثل Hetzner, DigitalOcean, یا Liara
- حداقل ۱ RAM و ۱ vCPU

### قدم ۲: وصل بشید به سرور
```bash
ssh root@YOUR_SERVER_IP
```

### قدم ۳: نصب پیش‌نیازها
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx
sudo npm install -g pm2
```

### قدم ۴: تنظیم دیتابیس
```bash
sudo -u postgres psql
CREATE DATABASE igig_db;
CREATE USER igig WITH PASSWORD 'changeme';
GRANT ALL PRIVILEGES ON DATABASE igig_db TO igig;
\q
```

### قدم ۵: آپلود کد برنامه
```bash
mkdir -p /var/www/igig
cd /var/www/igig
# فایل‌ها رو با scp یا git clone آپلود کنید
git clone YOUR_REPO .
npm install
```

### قدم ۶: تنظیم محیط
```bash
cat > .env << EOF
DATABASE_URL=postgresql://igig:changeme@localhost:5432/igig_db
EOF
```

### قدم ۷: بیلد و اجرا
```bash
npm run build
pm2 start npm --name igig -- start
pm2 save
pm2 startup
```

### قدم ۸: تنظیم Nginx
```bash
cat > /etc/nginx/sites-available/igig << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -s /etc/nginx/sites-available/igig /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

### قدم ۹: SSL رایگان با Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### قدم ۱۰: نصب روی گوشی
آدرس `https://yourdomain.com` رو روی گوشی باز کنید و مثل قبل نصب کنید

---

## 📦 روش سوم: ساخت APK (فقط برای برنامه‌نویس‌ها)

اگه حتماً فایل `.apk` میخواید:

### پیش‌نیازها:
```bash
# Java
sudo apt install default-jdk

# Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-9476646_latest.zip
mkdir -p ~/android-sdk/cmdline-tools
unzip commandlinetools-linux-*.zip -d ~/android-sdk/cmdline-tools
~/android-sdk/cmdline-tools/bin/sdkmanager --sdk_root=~/android-sdk "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Bubblewrap
npm install -g @nicolo-ribaudo/bubblewrap
```

### ساخت:
```bash
bubblewrap init --manifest https://your-app.vercel.app/manifest.json
bubblewrap build
```

فایل `app-release-signed.apk` ساخته میشه ⚠️
**نکته:** این فقط یک پوسته اندرویدRound;; دور برنامه وب هست

---

## ✅ خلاصه

| روش | هزینه | سختی | کیفیت |
|------|--------|-------|---------|
| **Vercel + PWA** | رایگان | ⭐ آسان | ⭐⭐⭐ بهترین |
| **سرور شخصی** | ماهانه ~$۵ | ⭐⭐ متوسط | ⭐⭐⭐ خوب |
| **APK با Bubblewrap** | رایگان | ⭐⭐⭐ سخت | ⭐⭐ قابل قبول |

**🏆 پیشنهاد:** روش اول (Vercel + PWA) رو امتحان کنید — رایگانه و بهترین نتیجه رو میده!
