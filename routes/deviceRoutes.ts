import express, { type RequestHandler } from "express";
import Device from "../models/deviceSchema.js";
import mongoose from "mongoose";
import msgError from "../utilities/msgError.js";
import requireBody from "../middleware/requireBody.js";
import { isValidId, toNumber } from "../utilities/functions.js";
import si from "systeminformation";


type Drives = {
    fs: string,
    type: string,
    size: number,
    used: number,
    available: number,
    use: number,
    mount: string,
    rw: boolean
}


const deviceRouter = express.Router();

deviceRouter
    .route("/")

    .post(
        requireBody(["userId", "q"]),
        (async (req, res, next) => {
            const { userId, q } = req.body
            try {
                if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
                const getDriveInfo = (drives: Drives[]) => {
                    return drives.map((drive) => ({
                        fs: drive.fs,
                        type: drive.type,
                        mount: drive.mount,
                        sizeMB: parseFloat((drive.size / 1e6).toFixed(2)),
                        usedMB: parseFloat((drive.used / 1e6).toFixed(2)),
                        availableMB: parseFloat((drive.available / 1e6).toFixed(2)),
                        usePercent: drive.use,
                        rw: drive.rw,
                    }))
                }
                let deviceData;
                const useSystemInfo = q.toLowerCase() === "yes";

                if (useSystemInfo) {
                    const [osInfo, fsSize] = await Promise.all([
                        si.osInfo(),
                        si.fsSize(),
                    ]);

                    // normalize rw: boolean: null -> false
                    const normalizedDrives: Drives[] = fsSize.map((d) => ({
                        ...d,
                        rw: d.rw ?? false,
                    }));
                    deviceData = {
                        userId,
                        name: osInfo.hostname,
                        drives: getDriveInfo(normalizedDrives),
                        status: "online",
                    };
                } else {
                    const { name, drives } = req.body;
                    if (!name) return next(msgError(400, "name is required when not using system info"));
                    if (!drives || !Array.isArray(drives) || drives.length === 0)
                        return next(msgError(400, "drives array is required when not using system info"));

                    deviceData = { userId, name, drives, status: "online" };
                }

                const created = await Device.create(deviceData)
                res.status(201).json(created)
            } catch (err: any) {
                const error = err
                next(msgError(400, error.message))
            }
        }) as RequestHandler)

    .get((async (req, res, next) => {
        try {
            const { userId, status, q } = req.query

            const VALID_STATUSES = ["online", "offline"]
            const filter: Record<string, any> = {}

            if (status) {
                const normalizedStatus = String(status).toLowerCase()
                if (!VALID_STATUSES.includes(normalizedStatus)) {
                    return next(msgError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`))
                }
                filter.status = normalizedStatus
            }

            if (userId) {
                if (!isValidId(String(userId))) return next(msgError(400, "Invalid deviceId"));
                filter.deviceId = String(userId)
            }

            // regex to find query in title, $options: "i" to make case insensitive
            if (q) filter.name = { $regex: String(q), $options: "i" };

            // populates the userId with the username and displayName
            const data = await Device.find(filter)
                .sort({ createdAt: -1 })
                .populate("userId", "name email");

            res.json(data)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler);


deviceRouter
    .route('/:id')

    .put(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid device id"));

        try {
            const updated = await Device.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).populate("userId", "name email")

            if (!updated) return next(msgError(404, "device not found"));
            res.json(updated)
        } catch (err: any) {
            next(msgError(400, err.message))
        }
    }) as RequestHandler))

    .delete(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid Device id"));

        try {
            const deleted = await Device.findByIdAndDelete(id)
            if (!deleted) return next(msgError(404, "Device not found"));
            res.json(deleted)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler))

export default deviceRouter;