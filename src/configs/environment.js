/**
 * @fileoverview Environment Configuration - Application environment variables and settings
 * @module configs/environment
 */

import "dotenv/config";

const nodeEnv = process.env.NODE_ENV || "development";

const backend = {
  port: parseInt(process.env.PORT, 10),
};
const frontend = {
  url: process.env.FRONTEND_URL,
};

const database = {
  url: process.env.DATABASE_URL,
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
  ssl: process.env.DB_SSL === "true",
};

const redis = {
  url: process.env.REDIS_URL,
  ttl: parseInt(process.env.REDIS_TTL) || 3600,
};

const jwt = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "24h",
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  login: {
    secret: process.env.JWT_LOGIN_SECRET,
    expiresIn: process.env.JWT_LOGIN_EXPIRES_IN || "7d",
  },
  register: {
    secret: process.env.JWT_REGISTER_SECRET,
    expiresIn: process.env.JWT_REGISTER_EXPIRES_IN || "7d",
  },
};

const api = {
  baseUrl: process.env.API_BASE_URL,
  version: process.env.API_VERSION || "v1",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
};

const logging = {
  level: process.env.LOGGING_LEVEL || "info",
  enableFileLogs: process.env.ENABLE_FILE_LOGS === "true",
};

const cloudinary = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
}


const whatsapp = {
  apiKey: process.env.WHATSAPP_API_KEY,
};

const otps = {
  expiresIn: parseInt(process.env.OTP_EXPIRES_IN ) || 15 * 60, // 15 minutes
  cooldownConstant: parseInt(process.env.OTP_COOLDOWN_CONSTANT) || 60, // 60 seconds
};
const twilio = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  virtualNumber: process.env.TWILIO_VIRTUAL_NUMBER,
}
// configs/environment.js  — add these fields

const rateLimit= {
  windowMs:          parseInt(process.env.RATE_LIMIT_WINDOW_MS)          || 15 * 60 * 1000,
  max:               parseInt(process.env.RATE_LIMIT_MAX)                || 100,
  sensitiveWindowMs: parseInt(process.env.RATE_LIMIT_SENSITIVE_WINDOW_MS)|| 15 * 60 * 1000,
  sensitiveMax:      parseInt(process.env.RATE_LIMIT_SENSITIVE_MAX)      || 10,
}
const environment = {
  nodeEnv,
  backend,
  frontend,
  redis,
  database,
  jwt,
  api,
  logging,
  cloudinary,
  whatsapp,
  otps,
  twilio,
  rateLimit
};

Object.freeze(environment);
export default environment;
