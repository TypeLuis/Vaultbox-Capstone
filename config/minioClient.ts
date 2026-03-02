/*
Minio is a server that allows you to upload/downloads file on the web,
Minio has to be installed in order for it to be used,
for this project using scripts to install minio instead of creating dockerfile,
incase Docker isn't installed on project
to access the web of Minio -> http://IPADDRESS:9001
MINIO_ACCESS_KEY & MINIO_SECRET_KEY is username and password -> default is minioadmin for both
consider buckets like projects to contain the files
*/

import { Client } from "minio";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!;
const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
const MINIO_USE_SSL = String(process.env.MINIO_USE_SSL || "false") === "true";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY!;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY!;
export const MINIO_BUCKET = process.env.MINIO_BUCKET || "vaultbox";
const MINIO_REGION = process.env.MINIO_REGION || "us-east-1";

export const minio = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// Call once at server startup
export async function ensureBucket() {
  const exists = await minio.bucketExists(MINIO_BUCKET).catch(() => false);
  if (!exists) {
    await minio.makeBucket(MINIO_BUCKET, MINIO_REGION);
  }
}