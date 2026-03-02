import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found. Run `npm run env` first.");
    process.exit(1);
}

// parse .env manually (no dotenv dependency needed)
const env: Record<string, string> = {};
fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) return; // skip lines without =
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (key) env[key] = value;
    });

const user = env.MINIO_ACCESS_KEY;
const password = env.MINIO_SECRET_KEY;
const port = env.MINIO_PORT || "9000";
const minioExe = "C:\\Users\\typel\\minio.exe";

if (!user || !password) {
    console.error("❌ MINIO_ACCESS_KEY or MINIO_SECRET_KEY missing in .env");
    process.exit(1);
}

if (password.length < 8) {
    console.error("❌ MINIO_SECRET_KEY must be at least 8 characters");
    process.exit(1);
}

console.log(`\n🚀 Starting MinIO...`);
console.log(`   API:     http://localhost:${port}`);
console.log(`   Console: http://localhost:9001`);
console.log(`   User:    ${user}\n`);

process.env.MINIO_ROOT_USER = user;
process.env.MINIO_ROOT_PASSWORD = password;

execSync(`"${minioExe}" server C:\\minio\\data --console-address :9001`, {
    stdio: "inherit",
    env: { ...process.env },
});