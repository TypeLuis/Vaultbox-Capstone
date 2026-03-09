import { execSync, spawnSync, spawn } from "child_process";
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

const port = env.MONGODB_PORT || "27017";
const directory = env.DIRECTORY;

function pathExists(p: string): boolean {
    return fs.existsSync(p);
}

// ─── Find mongod binary dynamically ──────────────────────────────────────────

function findMongodWindows(): string | null {
    const userProfile = process.env.USERPROFILE || "";
    const candidates = [
        path.join(userProfile, "mongodb", "bin", "mongod.exe"),
        "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
        "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    try {
        const result = execSync(
            `where mongod 2>nul || dir /s /b "C:\\Program Files\\MongoDB\\mongod.exe" 2>nul`,
            { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }
        ).trim();
        const first = result.split("\n")[0]?.trim();
        if (first && fs.existsSync(first)) return first;
    } catch { }

    return null;
}

function findMongodUnix(): string | null {
    try {
        const result = execSync("which mongod", { encoding: "utf-8" }).trim();
        if (result && fs.existsSync(result)) return result;
    } catch { }

    const candidates = [
        "/usr/bin/mongod",
        "/usr/local/bin/mongod",
        "/opt/homebrew/bin/mongod",                  // Apple Silicon homebrew
        "/home/linuxbrew/.linuxbrew/bin/mongod",
        path.join(process.env.HOME || "", ".local/bin/mongod"),
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

    const pathExist = pathExists("/mnt/data");
    const directoryExist = directory && pathExists(directory);

    console.log(`\n🚀 Starting MongoDB on ${osInfo.distro || osInfo.platform}...`);

    // On Linux/Mac, prefer the managed service if it's available
    if (!isWindows) {
        const isMac = platform === "darwin";
        const svcCmd = isMac
            ? "brew services start mongodb/brew/mongodb-community"
            : "systemctl start mongod";
        const checkCmd = isMac
            ? "brew services list | grep mongodb-community | grep started"
            : "systemctl is-active --quiet mongod";

        try {
            execSync(checkCmd, { stdio: "ignore" });
            console.log("   MongoDB is already running — skipping start.\n");
            console.log(`   Connection: mongodb://localhost:${port}`);
            console.log(`   Console:    mongosh mongodb://localhost:${port}\n`);
            return;
        } catch {
            // not running — try to start via service manager
            try {
                execSync(svcCmd, { stdio: "inherit" });
                console.log(`\n   Connection: mongodb://localhost:${port}`);
                console.log(`   Console:    mongosh mongodb://localhost:${port}\n`);
                return;
            } catch {
                // service manager unavailable — fall through to manual binary start
            }
        }
    }

    // ── Manual binary start (Windows always, Unix fallback) ──────────────────
    const mongodPath = isWindows ? findMongodWindows() : findMongodUnix();

    if (!mongodPath) {
        console.error("❌ mongod binary not found. Run `npm run install:mongodb` first.");
        process.exit(1);
    }

    // Resolve data directory using the same priority as start-minio.ts:
    //   DIRECTORY env var → /mnt/data → cwd
    let dataDir: string;

    if (directoryExist) dataDir = path.join(directory, "mongodb-data");
    else if (isWindows) dataDir = "C:\\data\\db";
    else if (pathExist) dataDir = path.join("/mnt/data", "mongodb-data");
    else dataDir = path.join(process.cwd(), "mongodb-data");

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`   Created data dir: ${dataDir}`);
    }

    // Check if mongod is already listening on the port before spawning
    try {
        const checkPort = isWindows
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} | grep LISTEN`;
        execSync(checkPort, { stdio: "ignore" });
        console.log("   MongoDB is already running — skipping start.\n");
        console.log(`   Connection: mongodb://localhost:${port}\n`);
        return;
    } catch {
        // nothing listening — safe to start
    }

    console.log(`   Binary:     ${mongodPath}`);
    console.log(`   Data dir:   ${dataDir}`);
    console.log(`   Connection: mongodb://localhost:${port}`);
    console.log(`   Console:    mongosh mongodb://localhost:${port}\n`);

    const args = [
        "--dbpath", dataDir,
        "--port", port,
        "--bind_ip", "0.0.0.0",     // all interfaces — accessible on local network
    ];

    // spawnSync(mongodPath, args, { stdio: "inherit" });
    const child = spawn(mongodPath, args, { stdio: "inherit" });

    child.on("error", (err) => {
        console.error(`\n❌ Failed to start mongod: ${err.message}`);
        process.exit(1);
    });
}

main().catch((e) => {
    console.error(`\n❌ ${e.message || e}`);
    process.exit(1);
});