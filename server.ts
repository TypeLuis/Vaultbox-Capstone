import express from "express"
import * as rowdy from "rowdy-logger"
import globalerror from "./middleware/globalError.js";
import notFound from "./middleware/notFound.js";
import logReq from "./middleware/logReq.js";
import connectDB from "./database/conn.js";
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { PORT } from "./utilities/config.js";
import cors from "cors";
import helmet from "helmet";
import si from "systeminformation";
import deviceRouter from "./routes/deviceRoutes.js";
import appRouter from "./routes/appRoutes.js";
import fileRouter from "./routes/fileRoutes.js";
import { ensureBucket } from "./config/minioClient.js";

// Setup
const app = express()
connectDB()
const routesReport = rowdy.begin(app)
await ensureBucket(); // make sure minio is running


// Middleware
app.use(helmet()); // Adds security-related HTTP headers to help protect the app from common web vulnerabilities
app.use(cors()) // Allows controlled cross-origin requests so frontend apps on other domains can access this API
app.use(express.json()) // allows to use json like getting req.body
app.use(logReq);

const cpu    = await si.cpu();        // manufacturer, brand, speed, cores
const mem    = await si.mem();        // total, used, free RAM
const osInfo = await si.osInfo();     // platform, distro, arch, hostname
const fsSize = await si.fsSize();     // per-drive size, used, available

/*

Version 5.30.0: processes() added user (windows) - needed to be reverted
Version 5.29.0: osInfo() added OS code name (windows)
Version 5.28.0: cpuTemperature() added suppurt for macos-temperature-sensor (macOS)
Version 5.27.0: mem() added reclaimable memory
Version 5.26.0: getStatic(), getAll() added usb, audio, bluetooth, printer
Version 5.25.0: versions() added homebrew
Version 5.24.0: versions() added bun and deno
Version 5.23.0: usb() added serial number (linux)
Version 5.22.0: wifiConnections() added signal quality
Version 5.21.0: graphics() added subVendor (linux)
Version 5.20.0: mem() added writeback and dirty (linux)
Version 5.19.0: currentLoad() added steal and guest time (linux)
Version 5.18.0: fsSize() added optional drive parameter
Version 5.17.0: graphics() added positionX, positionY (macOS)
Version 5.16.0: fsSize() added rw property
Version 5.15.0: blockDevices() added device
Version 5.14.0: blockDevices() added raid group member (linux)
Version 5.13.0: networkConnections() added process name (macOS)
Version 5.12.0: cpu() added performance and efficiency cores
Version 5.11.0: networkInterfaces() added default property and default parameter
Version 5.10.0: basic android support
Version 5.9.0: graphics() added properties (macOS)
Version 5.8.0: disksIO() added waitTime, waitPercent (linux)
Version 5.7.0: diskLayout() added S.M.A.R.T for Windows (if installed)
Version 5.6.0: cpuTemperature() added socket and chipset temp (linux)
Version 5.5.0: dockerVolumes() added
Version 5.4.0: dockerImages() added
Version 5.3.0: osInfo() added remoteSession (win only)
Version 5.2.0: wifiInterfaces() and wifiConnections() added
Version 5.1.0: memLayout() added ECC flag, bios() added language, features (linux)

*/

// Routes
app.get('/', (_req, res, _next) => {
    res.send('Hello!')
})

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/device', deviceRouter)
app.use('/api/app', appRouter)
app.use('/api/file', fileRouter)

// Error Middleware
app.use(notFound)
app.use(globalerror)

// Listener
app.listen(PORT, "0.0.0.0", ()=> {
    console.log(`server is running on PORT: ${PORT}`)
    console.log(cpu)
    console.log(mem)
    console.log(osInfo)
    console.log(fsSize)
    routesReport.print()
})