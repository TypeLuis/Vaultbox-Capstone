import express from "express";
import * as rowdy from "rowdy-logger";
import globalerror from "./middleware/globalError.js";
import notFound from "./middleware/notFound.js";
import logReq from "./middleware/logReq.js";
import connectDB from "./database/conn.js";
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { PORT } from "./utilities/config.js";
import cors from "cors";
import helmet from "helmet";
import deviceRouter from "./routes/deviceRoutes.js";
import appRouter from "./routes/appRoutes.js";
import fileRouter from "./routes/fileRoutes.js";
import { ensureBucket } from "./config/minioClient.js";

// Setup
const app = express()
const routesReport = rowdy.begin(app)

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMinio(attempts = 20, delay = 1500) {
    let lastError: unknown;

    for (let i = 1; i <= attempts; i++) {
        try {
            await ensureBucket();
            console.log(`✅ MinIO ready (attempt ${i})`);
            return;
        } catch (error) {
            lastError = error;
            console.log(`⏳ Waiting for MinIO... (${i}/${attempts})`);
            await sleep(delay);
        }
    }

    throw lastError;
}


// Middleware
app.use(helmet()); // Adds security-related HTTP headers to help protect the app from common web vulnerabilities
app.use(cors()) // Allows controlled cross-origin requests so frontend apps on other domains can access this API
app.use(express.json()) // allows to use json like getting req.body
app.use(logReq);


// Routes
app.get('/', (_req, res, _next) => {
    res.send('Hello!')
})

app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/device', deviceRouter)
app.use('/api/app', appRouter)
app.use('/api/file', fileRouter)

// Error Middleware
app.use(notFound)
app.use(globalerror)


async function startServer() {
    try {
        await connectDB();
        console.log("✅ MongoDB connected");

        await waitForMinio();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`server is running on PORT: ${PORT}`);
            routesReport.print();
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();