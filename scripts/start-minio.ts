import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import si from "systeminformation";

// ─── Parse .env ───────────────────────────────────────────────────────────────

const envPath = path.resolve(process.cwd(), ".env");

if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found. Run `npm run env` first.");
    process.exit(1);
}

const env: Record<string, string> = {};
fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) return;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (key) env[key] = value;
    });

const user = env.MINIO_ACCESS_KEY;
const password = env.MINIO_SECRET_KEY;
const port = env.MINIO_PORT || "9000";

if (!user || !password) {
    console.error("❌ MINIO_ACCESS_KEY or MINIO_SECRET_KEY missing in .env");
    process.exit(1);
}

if (password.length < 8) {
    console.error("❌ MINIO_SECRET_KEY must be at least 8 characters");
    process.exit(1);
}

// ─── Find MinIO binary dynamically ───────────────────────────────────────────

function findMinioWindows(): string | null {
    // check common locations using dynamic user profile
    const candidates = [
        path.join(process.env.USERPROFILE || "", "minio.exe"),
        path.join(process.env.LOCALAPPDATA || "", "minio.exe"),
        "C:\\ProgramData\\minio\\minio.exe",
        "C:\\minio\\minio.exe",
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    // last resort: search entire Users directory
    try {
        const result = execSync(
            `where minio 2>nul || dir /s /b C:\\Users\\minio.exe 2>nul`,
            { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }
        ).trim();
        const first = result.split("\n")[0]?.trim();
        if (first && fs.existsSync(first)) return first;
    } catch {}

    return null;
}

function findMinioUnix(): string | null {
    // check $PATH first (covers homebrew, apt installs, etc.)
    try {
        const result = execSync("which minio", { encoding: "utf-8" }).trim();
        if (result && fs.existsSync(result)) return result;
    } catch {}

    // check common install locations
    const candidates = [
        "/usr/local/bin/minio",
        "/usr/bin/minio",
        "/opt/homebrew/bin/minio",        // Apple Silicon homebrew
        "/home/linuxbrew/.linuxbrew/bin/minio",
        path.join(process.env.HOME || "", ".local/bin/minio"),
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const osInfo = await si.osInfo();
    const platform = osInfo.platform.toLowerCase();
    const isWindows = platform === "win32" || platform === "windows";

    console.log(`\n🚀 Starting MinIO on ${osInfo.distro || osInfo.platform}...`);

    const minioPath = isWindows ? findMinioWindows() : findMinioUnix();

    if (!minioPath) {
        console.error("❌ MinIO binary not found. Run `npm run install:minio` first.");
        process.exit(1);
    }

    console.log(`   Binary:  ${minioPath}`);
    console.log(`   API:     http://localhost:${port}`);
    console.log(`   Console: http://localhost:9001`);
    console.log(`   User:    ${user}\n`);

    const dataDir = isWindows ? "C:\\minio\\data" : "/var/lib/minio/data";

    // ensure data dir exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`   Created data dir: ${dataDir}`);
    }

    const args = ["server", dataDir, "--console-address", ":9001"];

    spawnSync(minioPath, args, {
        stdio: "inherit",
        env: {
            ...process.env,
            MINIO_ROOT_USER: user,
            MINIO_ROOT_PASSWORD: password,
        },
    });
}

main().catch((e) => {
    console.error(`\n❌ ${e.message || e}`);
    process.exit(1);
});