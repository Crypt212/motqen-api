/**
 * @fileoverview Success Response - Standardized success response handler with Phone Leak Protection
 * @module responses/successResponse
 */

// Regex لاكتشاف أنماط أرقام التليفونات المصرية (01x, +20, 00201x) - [Point 1 in S1.2]
const PHONE_PATTERN = /(\+20|0020|02)?01[0125]\d{8}/g;

/**
 * وظيفة مساعدة لمسح الكائنات (Objects) والقوائم (Arrays) بشكل متكرر
 * واستبدال أي أرقام تليفونات تظهر في القيم النصية.
 */
const maskPhoneNumbers = (data: any): any => {
  // إذا كانت القيمة نصية، نطبق الـ Regex مباشرة
  if (typeof data === 'string') {
    return data.replace(PHONE_PATTERN, '[PHONE_HIDDEN]');
  }

  // إذا كانت القيمة ليست كائناً أو كانت null، نرجعها كما هي
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // إذا كانت مصفوفة، نطبق الوظيفة على كل عنصر فيها
  if (Array.isArray(data)) {
    return data.map(maskPhoneNumbers);
  }

  // إذا كان كائناً (Object)، نمر على كل الخصائص
  const maskedData: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // تحسين الأداء: تخطي الحقول التي نعرف يقيناً أنها روابط صور أو ملفات
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('image') || lowerKey.includes('url') || lowerKey.includes('path')) {
        maskedData[key] = data[key];
      } else {
        maskedData[key] = maskPhoneNumbers(data[key]);
      }
    }
  }
  return maskedData;
};

/**
 * Class representing a success response
 * @class
 */
class SuccessResponse {
  public status = 'success';
  public message: string;
  public data: unknown;
  public statusCode: number;

  /**
   * Creates a new success response instance
   * @param {string} [message="Success"]
   * @param {*} [data=null]
   * @param {number} [statusCode=200]
   */
  constructor(message: string = 'Success', data: unknown = null, statusCode: number = 200) {
    this.status = 'success';
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  /**
   * Sends the success response to the client with data sanitization
   */
  send(res: import('express').Response): import('express').Response {
    // 🛡️ تفعيل الحماية وفحص البيانات قبل إرسالها للعميل [Point 1 in S1.2]
    const sanitizedData = maskPhoneNumbers(this.data);
    const sanitizedMessage = this.message.replace(PHONE_PATTERN, '[PHONE_HIDDEN]');

    return res.status(this.statusCode).json({
      status: this.status,
      message: sanitizedMessage,
      data: sanitizedData,
    });
  }
}

export default SuccessResponse;