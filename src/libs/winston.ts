import winston from 'winston';

/**
 * Redactor format to mask sensitive information before logging
 * Covers Point 10 of the Security Audit 🛡️
 */
const redactSensitiveData = winston.format((info) => {
  // قائمة الحقول الحساسة التي يجب إخفاؤها
  const SENSITIVE_FIELDS = ['authorization', 'password', 'token', 'refreshToken', 'otp'];

  const redact = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach((key) => {
      // تحويل المفتاح لـ lowercase للتأكد من صيده مهما كانت طريقة كتابته
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    });
  };

  // تطبيق المسح على الرسالة والبيانات الإضافية (metadata)
  if (info.metadata) redact(info.metadata);
  if (info.headers) redact(info.headers);
  
  return info;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    redactSensitiveData(), // 👈 تفعيل الفلتر الأمني هنا
    winston.format.json()
  ),
  transports: [
    // طباعة الـ Logs في الكونسول أثناء التطوير
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // تسجيل كافة الأحداث في ملف موحد
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // تسجيل الأخطاء فقط في ملف منفصل لسهولة المراجعة
    new winston.transports.File({ 
      filename: 'logs/errors.log', 
      level: 'error' 
    }),
  ],
});