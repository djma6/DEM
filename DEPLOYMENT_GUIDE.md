# 📦 راهنمای کامل: آپلود روی GitHub + استقرار روی Vercel

## 📋 چیزایی که نیاز دارید

| چیز | از کجا | هزینه |
|-----|--------|--------|
| حساب GitHub | github.com | رایگان |
| حساب Vercel | vercel.com | رایگان |
| Git | git-scm.com | رایگان |
| کامپیوتر | — | — |

⏱️ **زمان تقریبی: ۱۵-۲۰ دقیقه**

---

## قدم ۱: نصب Git روی کامپیوتر

### Windows:
1. به سایت **[git-scm.com/download/win](https://git-scm.com/download/win)** برید
2. فایل `.exe` رو دانلود کنید
3. نصب کنید — همه گزینه‌ها رو پیش‌فرض بذارید
4. **Restart** کنید

### Mac:
ترمینال رو باز کنید (Cmd+Space → Terminal):
```bash
brew install git
```
(اگه Brew ندارید: از **[git-scm.com/download/mac](https://git-scm.com/download/mac)** دانلود کنید)

### Linux:
```bash
sudo apt install git -y
```

### ✅ بررسی نصب:
ترمینال/Command Prompt رو باز کنید:
```bash
git --version
```
باید خروجی مثل این بده:
```
git version 2.43.0
```

---

## قدم ۲: تنظیم Git

یک بار برای همیشه:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```
(ایمیل واقعی تون رو بذارید — بهتره همون ایمیل GitHub رو بذارید)

---

## قدم ۳: ساخت حساب GitHub

1. به **[github.com/signup](https://github.com/signup)** برید
2. **Email** رو وارد کنید → **Continue**
3. **Password** بسازید → **Continue**
4. **Username** انتخاب کنید (مثلاً `my-d5;yourname`) → **Continue**
5. ترجیحات رو انتخاب کنید → **Continue**
6. کد تایید ایمیل رو وارد کنید
7. ✅ حساب ساخته شد!

---

## قدم ۴: ساخت Repository

1. وارد GitHub بشید
2. دکمه **"+"** (سمت راست بالا، کنار آواتار) رو بزنید
3. **"New repository"** رو انتخاب کنید

4. فرم رو پر کنید:

```
Repository name:     igig
Description:         DJ Event Manager - برنامه چیه
Visibility:          ✅ Public  (برای Vercel رایگان باید Public باشه)
```

5. ⚠️ **هیچ‌کدوم** از اینا رو تیک نزنید:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

   (چون ما خودمون فایل‌ها رو داریم)

6. دکمه **"Create repository"** رو بزنید
7. ✅ Repository ساخته شد! یک صفحه سبز با دستورالعمل‌های Git می‌بینید

**آدرس Repository رو یادداشت کنید:**
```
https://github.com/YOUR-USERNAME/igig
```

---

## قدم ۵: دانلود کد برنامه روی کامپیوتر

### روش A: دانلود مستقیم (ساده‌ترین)

اگه کد برنامه رو به عنوان فایل زیپ (ZIP) دارید:

1. یک پوشه روی کامپیوتر بسازید: مثلاً `C:\Projects\igig` یا `/home/user/projects/igig`
2. فایل‌های برنامه رو اونجا Extract کنید
3. Command Prompt یا Terminal رو اونجا باز کنید

### روش B: Clone از Repository فعلی

اگه کد برنامه روی یک سرور یا سندباکس هست:

```bash
mkdir -p ~/projects/igig
cd ~/projects/igig
# فایل‌ها رو کپی کنید یا scp بزنید
```

---

## قدم ۶: راه‌اندازی Git در پوشه برنامه

ترمینال رو در پوشه برنامه باز کنید و بزنید:

```bash
cd /path/to/igig
git init
git branch -m main
```

این‌ها یک مخزن Git محلی می‌سازن.

---

## قدم ۷: اضافه کردن فایل‌ها

```bash
git add -A
```

این همه فایل‌های برنامه رو به Git اضافه می‌کنه (به جز فایل‌هایی که در `.gitignore` هستن)

بررسی کنید:
```bash
git status
```
باید لیست فایل‌های سبز (added) رو ببینید

---

## قدم ۸: اولین Commit

```bash
git commit -m "🎉 Initial commit: iGig DJ Event Manager"
```

این یک "نقطه ذخیره" از کل برنامه می‌سازه.

---

## قدم ۹: اتصال به GitHub

آدرس Repository رو از قدم ۴ یادتونه؟ بذارید:
```bash
git remote add origin https://github.com/YOUR-USERNAME/igig.git
```

مثلاً اگه username شما `alireza` هست:
```bash
git remote add origin https://github.com/alireza/igig.git
```

---

## قدم ۱۰: Push (آپلود) به GitHub

```bash
git push -u origin main
```

⚠️ **اولین بار** GitHub ازتون username و password می‌خواد:

- **Username:** username GitHub تون
- **Password:** ❌ پسورد معمولی کار نمی‌کنه!

### ساخت Personal Access Token (به جای پسورد):

1. در GitHub → **Settings** (بالا سمت راست، روی آواتار)
2. سمت چپ، آخرین منو: **"Developer settings"**
3. **"Personal access tokens"** → **"Tokens (classic)"**
4. **"Generate new token (classic)"**
5. Note: `igig-deploy`
6. Expiration: **No expiration** (یا 90 days)
7. تیک‌ها:
   - ✅ **repo** (کامل — همه زیرگزینه‌ها)
8. **"Generate token"** رو بزنید
9. ⚠️ **TOKEN رو کپی کنید** — دیگه دیده نمیشه!

حالا دوباره `git push` رو بزنید:
- Username: `YOUR-USERNAME`
- Password: `TOKEN` (همون توکنی که کپی کردید)

✅ وقتی پیام شبیه این ببینید یعنی موفق بود:
```
To https://github.com/YOUR-USERNAME/igig.git
 * [new branch]      main -> main
```

بررسی: به صفحه GitHub برید — فایل‌ها ظاهر شدن! 🎉

---

## قدم ۱۱: ساخت حساب Vercel

1. به **[vercel.com/signup](https://vercel.com/signup)** برید
2. **"Continue with GitHub"** رو بزنید
3. authorize Vercel رو تایید کنید
4. ✅ حساب ساخته شد!

---

## قدم ۱۲: استقرار برنامه

### روش A: از وب‌سایت Vercel (ساده‌ترین)

1. به **[vercel.com/new](https://vercel.com/new)** برید
2. **"Import Git Repository"** رو انتخاب کنید
3. Repository **`igig`** رو پیدا و انتخاب کنید
4. تنظیمات:
   - Framework Preset: **Next.js** (خودکار شناسایی میشه)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. ⚠️ **Environment Variables** رو اضافه کنید:
   - Name: `DATABASE_URL`
   - Value: آدرس PostgreSQL (از قدم ۱۳)
6. دکمه **"Deploy"** رو بزنید
7. ⏳ صبر کنید... ۱-۲ دقیقه
8. ✅ 🎉 برنامه استقرار داده شد!

### روش B: از CLI

```bash
npm install -g vercel
vercel login
cd /path/to/igig
vercel
```

به سوالات Enter بزنید (پیش‌فرض خوبه)

---

## قدم ۱۳: تنظیم دیتابیس PostgreSQL

### روش ساده: Supabase (رایگان)

1. به **[supabase.com](https://supabase.com)** برید
2. **"Start your project"** → با GitHub وارد بشید
3. **"New project"**:
   - Name: `igig`
   - Database Password: یک پسورد قوی بسازید و یادداشت کنید
   - Region: نزدیک‌ترین به کاربرانتون
4. صبر کنید تا پروژه ساخته بشه
5. به **Settings → Database** برید
6. آدرس اتصال (Connection string) رو کپی کنید
   - شبیه: `postgresql://postgres.XXX:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
7. پسورد واقعی رو جای `[password]` بذارید

### اضافه کردن به Vercel:

1. در **[vercel.com](https://vercel.com)** → پروژه `igig`
2. **Settings → Environment Variables**
3. اضافه کنید:
   - Name: `DATABASE_URL`
   - Value: آدرس Supabase (از بالا)
4. **Deployments →latest → ⋯ → Redeploy** رو بزنید

---

## قدم ۱۴: نصب برنامه روی گوشی 📱

### Android:
1. برنامه **Chrome** رو باز کنید
2. آدرس Vercel رو تایپ کنید:
   ```
   https://igig-xxx.vercel.app
   ```
   (آدرس واقعی تون رو از Vercel بگیرید)
3. صبر کنید تا کامل لود بشه
4. **بنر "نصب برنامه"** ظاهر میشه → کلیک کنید
   
   **یا:** منوی **⋮** → **"Install app"**
5. تایید کنید
6. ✅ آیکون روی صفحه اصلی! برنامه مثل یک اپ واقعی باز میشه

### iPhone:
1. **Safari** رو باز کنید (فقط Safari!)
2. آدرس رو تایپ کنید
3. دکمه **اشتراک** (مربع با فلش بالا ↑) رو بزنید
4. **"Add to Home Screen"** رو انتخاب کنید
5. تایید کنید
6. ✅ نصب شد!

---

## قدم ۱۵: عوض کد → خودکار استقرار 🔄

از این به بعد، هر بار کد عوض بشه:

```bash
# عوض کد...
git add -A
git commit -m "تغییرات جدید"
git push
```

**Vercel خودکار دوباره بیلد و استقرار می‌کنه!** ✅

---

## ⚠️ مشکلات رایج

### "Permission denied" موقع push:
- Personal Access Token درست بسازید (قدم ۱۰)

### "Build Failed" در Vercel:
- `DATABASE_URL` رو چک کنید در Environment Variables هست
- لاگ رو از بخش Deployments ببینید

### برنامه روی گوشی باز نمیشه:
- مطمئن بشید آدرس درست رو تایپ کردید
- مرورگر رو ببندید و دوباره باز کنید

### دیتابیس وصل نمیشه:
- آدرس Supabase رو چک کنید
- پسورد رو درست وارد کرده باشید

---

## 🏆 خلاصه

```
GitHub Repository  →  Vercel Auto-Deploy  →  PWA روی گوشی
     ↑                                         ↓
   کد برنامه                            مثل اپ واقعی!
```

**همه چیز رایگانه!** 🎉
