// config.ts
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.JWTSECRET) {
    throw new Error("JWTSECRET is not defined in environment variables");
}
if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}
  
export const JWT_SECRET = process.env.JWTSECRET;

export const MONGODB_URI = process.env.MONGODB_URI

export const PORT = Number(process.env.PORT) || 3015;
