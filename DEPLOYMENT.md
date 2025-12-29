# مختصر الروابط - وقف تك / WaqfTech Link Shortener

> خدمة اختصار الروابط باللغة العربية مبنية على منصة Cloudflare Workers

> Arabic Link Shortener Service built on Cloudflare Workers Platform

## 🌟 الميزات / Features

### العربية
- **واجهة عربية كاملة** مع دعم RTL (من اليمين إلى اليسار)
- **ذكاء اصطناعي** مدمج للمحادثة وإنشاء الروابط المختصرة
- **تحليلات متقدمة** لتتبع النقرات حسب البلد والموقع
- **حماية بـ JWT** لواجهة الإدارة
- **تصميم متجاوب** يدعم جميع الشاشات

### English
- **Full Arabic Interface** with RTL (Right-to-Left) support
- **AI Integration** for chat and smart link creation
- **Advanced Analytics** for tracking clicks by country and location
- **JWT Security** for admin interface
- **Responsive Design** supporting all screen sizes

## 🎨 ألوان التصميم / Design Colors

```css
/* الألوان الأساسية / Primary Colors */
--warm-amber: #E8934A      /* العنبر الدافئ */
--soft-coral: #D47A5E      /* المرجاني الناعم */
--golden-peach: #F2B85C    /* الخوخي الذهبي */

/* الألوان الثانوية / Secondary Colors */
--warm-charcoal: #3A3731   /* الفحمي الدافئ */
--cream-base: #F0EDE5      /* القاعدة الكريمية */
--rich-terracotta: #B8593D /* التراكوتا الغني */

/* ألوان التمييز / Accent Colors */
--bright-highlight: #FA9F47 /* التمييز الساطع */
--subtle-shadow: #8B7A6B   /* الظل الخفيف */
```

## 🚀 التثبيت والنشر / Installation & Deployment

### المتطلبات الأساسية / Prerequisites

```bash
# تثبيت pnpm (مطلوب) / Install pnpm (required)
npm install -g pnpm

# تثبيت wrangler (CLI لـ Cloudflare) / Install wrangler (Cloudflare CLI)  
pnpm add -g wrangler
```

### إعداد المشروع / Project Setup

1. **نسخ المتغيرات البيئية / Copy environment variables:**
```bash
cp .dev.vars.example .dev.vars
```

2. **تحديث متغيرات البيئة / Update environment variables:**
```bash
# .dev.vars
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token-with-analytics-read"
JWT_SECRET="your-secret-key-for-admin-auth"
```

3. **تثبيت التبعيات / Install dependencies:**
```bash
pnpm install
```

4. **إنشاء KV Namespace:**
```bash
wrangler kv:namespace create URLS
# نسخ معرف الـ namespace إلى wrangler.toml
# Copy the namespace ID to wrangler.toml
```

5. **إنشاء Analytics Engine Dataset:**
```bash
wrangler analytics-engine dataset create link_clicks
```

### النشر / Deployment

```bash
# نشر على Cloudflare Workers / Deploy to Cloudflare Workers
pnpm run deploy
```

### التطوير المحلي / Local Development

```bash
# تشغيل الخادم المحلي / Start local development server
pnpm run dev
```

## 📱 الواجهات / Interfaces

### الواجهة الرئيسية / Main Interface
- الرابط: `https://your-domain.com/`
- الوصف: صفحة الترحيب الرئيسية باللغة العربية
- Description: Main Arabic welcome page

### واجهة الإدارة / Admin Interface  
- الرابط: `https://your-domain.com/admin/`
- الوصف: واجهة المحادثة مع الذكاء الاصطناعي لإنشاء الروابط
- Description: AI chat interface for link creation

## 🔧 إعداد Cloudflare / Cloudflare Configuration

### المطلوب / Required:

1. **KV Namespace:** لحفظ الروابط المختصرة
2. **Analytics Engine:** لتتبع النقرات والإحصائيات  
3. **Workers AI:** للمحادثة الذكية
4. **Custom Domain:** (اختياري) لربط النطاق الخاص

### إعدادات الأمان / Security Settings:

```toml
# wrangler.toml
[env.production.vars]
# لا تضع هنا المتغيرات الحساسة / Don't put sensitive vars here
# استخدم wrangler secret put بدلاً من ذلك / Use wrangler secret put instead

# لإضافة المتغيرات السرية / To add secret variables:
# wrangler secret put JWT_SECRET
# wrangler secret put CLOUDFLARE_API_TOKEN  
```

## 📊 المميزات التقنية / Technical Features

- **إطار العمل:** Hono.js (سريع وخفيف للـ Workers)
- **اللغة:** TypeScript مع أنواع البيانات الكاملة
- **الخطوط:** Noto Sans Arabic للنص العربي الواضح
- **الاستضافة:** Cloudflare Workers (الحافة العالمية)
- **التخزين:** Cloudflare KV (قاعدة بيانات مفاتيح/قيم)
- **التحليلات:** Analytics Engine (تحليلات فورية)

## 🌐 الاستخدام / Usage

### إنشاء رابط مختصر عبر API / Create Short Link via API:

```bash
curl -X POST https://your-domain.com/api/url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "example",
    "url": "https://example.com",
    "override": false
  }'
```

### الحصول على تقرير النقرات / Get Click Report:

```bash
curl -X POST https://your-domain.com/api/report/example \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 الأمان / Security

- **JWT Authentication:** لحماية واجهة API
- **CORS Protection:** حماية من الطلبات غير المصرح بها  
- **Rate Limiting:** (قريباً) منع إساءة الاستخدام
- **Input Validation:** فحص المدخلات لمنع الثغرات

## 📈 المراقبة / Monitoring

- **Real-time Analytics:** تحليلات فورية للنقرات
- **Geographic Tracking:** تتبع النقرات حسب البلد
- **Performance Metrics:** مراقبة أداء الخدمة
- **Error Logging:** تسجيل الأخطاء والمشاكل

## 🤝 المساهمة / Contributing

نرحب بمساهماتك! / We welcome your contributions!

1. Fork المستودع / Fork the repository
2. إنشاء branch للميزة / Create feature branch
3. إرسال Pull Request / Submit Pull Request

## 📄 الرخصة / License

MIT License - استخدم بحرية / Use freely

## 🆘 الدعم / Support

- GitHub Issues: للمشاكل التقنية / For technical issues
- المجتمع: [وقف تك](https://waqf.app) / Community: [WaqfTech](https://waqf.app)

---

تم التطوير بـ 🧡 في المملكة العربية السعودية  
Developed with 🧡 in Saudi Arabia
