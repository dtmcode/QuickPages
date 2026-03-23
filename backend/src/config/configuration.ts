// backend/src/config/configuration.ts
export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  isDevelopment: process.env.NODE_ENV === 'development',
});
