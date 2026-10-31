
import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isProduction = process.env.NODE_ENV === 'production';

const vercelOrigins = [
  'VERCEL_URL',
  'VERCEL_BRANCH_URL',
  'VERCEL_PROJECT_PRODUCTION_URL'
]
  .map((key) => process.env[key])
  .filter(Boolean)
  .map((host) => host.startsWith('http') ? host : `https://${host}`);

const clientOrigins = [
  process.env.CLIENT_URL,
  ...vercelOrigins
].filter(Boolean);

if (!isProduction) {
  clientOrigins.push('http://localhost:5173');
}

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction && (!jwtSecret || !jwtRefreshSecret)) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be configured in production.'
  );
}

export const env = {
  PORT: toNumber(process.env.PORT, 5000),

  MONGO_URI:
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/core_banking_portal',

  JWT_SECRET:
    jwtSecret || 'dev_super_secret_jwt_key_change_in_production',

  JWT_REFRESH_SECRET:
    jwtRefreshSecret || 'dev_refresh_secret_change_in_production',

  CLIENT_URLS: [
    ...new Set(
      clientOrigins.length
        ? clientOrigins
        : ['http://localhost:5173']
    )
  ],

  // Resend email configuration
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  // SMTP configuration (preserved)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: toNumber(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',

  // Office configuration
  OFFICE_LATITUDE: toNumber(process.env.OFFICE_LATITUDE, 28.6139),
  OFFICE_LONGITUDE: toNumber(process.env.OFFICE_LONGITUDE, 77.209),
  OFFICE_RADIUS_KM: toNumber(process.env.OFFICE_RADIUS_KM, 0.75),
  OFFICE_START_HOUR: toNumber(process.env.OFFICE_START_HOUR, 9),
  OFFICE_END_HOUR: toNumber(process.env.OFFICE_END_HOUR, 18)
};
