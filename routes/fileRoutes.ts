// import express, { type RequestHandler } from "express";
// import File from "../models/fileSchema.js";
// import mongoose from "mongoose";
// import msgError from "../utilities/msgError.js";
// import requireBody from "../middleware/requireBody.js";
// import { isValidId, toNumber } from "../utilities/functions.js";



// const fileRouter = express.Router();

// fileRouter
//     .route("/")

//     .post(
//         requireBody(["deviceId", "filename", "sizeMB", "fileType"]),
//         (async (req, res, next) => {
//             try {
//                 if (!isValidId(String(req.body.userId))) return next(msgError(400, "Invalid userId"));

//                 const created = await File.create(req.body)
//                 res.status(201).json(created)
//             } catch (err: any) {
//                 const error = err
//                 next(msgError(400, error.message))
//             }
//         }) as RequestHandler)

//     .get((async (req, res, next) => {
//         try {
//             const { min, max, deviceId, fileType, q } = req.query

//             const minSize = toNumber(min)
//             const maxSize = toNumber(max)

//             const filter: Record<string, any> = {}

//             // if (filename) filter.filename = String(filename);
//             if (fileType) filter.fileType = String(fileType);

//             if (deviceId) {
//                 if (!isValidId(String(deviceId))) return next(msgError(400, "Invalid deviceId"));
//                 filter.deviceId = String(deviceId)
//             }

//             if (minSize !== null || maxSize !== null) {
//                 filter.price = {}
//                 if (minSize !== null) filter.price.$gte = minSize
//                 if (maxSize !== null) filter.price.$lte = maxSize
//             }

//             // regex to find query in title, $options: "i" to make case insensitive
//             if (q) filter.filename = { $regex: String(q), $options: "i" };

//             // populates the deviceId with the username and displayName
//             const data = await File.find(filter)
//                 .sort({ createdAt: -1 })
//                 .populate("deviceId", "name status");

//             res.json(data)
//         } catch (err) {
//             next(err)
//         }
//     }) as RequestHandler)


// fileRouter
//     .route('/:id')

//     .put(((async (req, res, next) => {
//         const id = String(req.params.id)
//         if (!isValidId(id)) return next(msgError(400, "Invalid File id"));

//         try {
//             const updated = await File.findByIdAndUpdate(id, req.body, {
//                 new: true,
//                 runValidators: true
//             }).populate("deviceId", "name status")

//             if (!updated) return next(msgError(404, "File not found"));
//             res.json(updated)
//         } catch (err: any) {
//             next(msgError(400, err.message))
//         }
//     }) as RequestHandler))

//     .delete(((async (req, res, next) => {
//         const id = String(req.params.id)
//         if (!isValidId(id)) return next(msgError(400, "Invalid File id"));

//         try {
//             const deleted = await File.findByIdAndDelete(id)
//             if (!deleted) return next(msgError(404, "File not found"));
//             res.json(deleted)
//         } catch (err) {
//             next(err)
//         }
//     }) as RequestHandler))
// export default fileRouter;





import express, { type RequestHandler } from "express";
import crypto from "crypto";
import path from "path";
import File from "../models/fileSchema.js";
import Device from "../models/deviceSchema.js";
import msgError from "../utilities/msgError.js";
import { isValidId } from "../utilities/functions.js";
import { upload } from "../config/upload.js";
import { minio, MINIO_BUCKET } from "../config/minioClient.js";

const fileRouter = express.Router();

// /**
//  * If you already have JWT middleware that sets req.user, use that.
//  * Otherwise (like your current device routes), pass userId in query/body.
//  */
// function getRequesterUserId(req: any): string | null {
//   // Prefer auth middleware
//   if (req.user?.id) return String(req.user.id);

//   // Fallbacks to match your current pattern
//   if (req.body?.userId) return String(req.body.userId);
//   if (req.query?.userId) return String(req.query.userId);

//   return null;
// }

// async function assertOwnsDevice(userId: string, deviceId: string) {
//   const device = await Device.findById(deviceId).select("userId");
//   if (!device) throw msgError(404, "Device not found");
//   if (String(device.userId) !== String(userId)) throw msgError(403, "Forbidden");
// }

// /**
//  * Helper: build a safe key that won’t collide and is future-proof.
//  */
// function buildObjectKey(userId: string, deviceId: string, storedName: string) {
//   // You can change this later without breaking old files because objectKey is stored in DB.
//   return `user/${userId}/device/${deviceId}/files/${storedName}`;
// }

// /**
//  * Optional checksum (SHA256) for integrity tracking.
//  */
// function sha256(buffer: Buffer): string {
//   return crypto.createHash("sha256").update(buffer).digest("hex");
// }

// // --------------------
// // LIST FILES (metadata)
// // GET /api/files?deviceId=... [&userId=... if not using req.user]
// // --------------------
// fileRouter.get(
//   "/",
//   (async (req, res, next) => {
//     try {
//       const userId = getRequesterUserId(req);
//       const { deviceId } = req.query;

//       if (!userId) return next(msgError(401, "Missing user context"));
//       if (!deviceId) return next(msgError(400, "deviceId is required"));
//       if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
//       if (!isValidId(String(deviceId))) return next(msgError(400, "Invalid deviceId"));

//       await assertOwnsDevice(String(userId), String(deviceId));

//       const files = await File.find({ deviceId: String(deviceId) }).sort({ createdAt: -1 });
//       res.json(files);
//     } catch (err) {
//       next(err);
//     }
//   }) as RequestHandler
// );

// // --------------------
// // UPLOAD
// // POST /api/files/upload?deviceId=... [&userId=... if not using req.user]
// // multipart/form-data with field name: "file"
// // --------------------
// fileRouter.post(
//   "/upload",
//   upload.single("file"),
//   (async (req: any, res, next) => {
//     try {
//       const userId = getRequesterUserId(req);
//       const deviceId = String(req.query.deviceId || "");

//       if (!userId) return next(msgError(401, "Missing user context"));
//       if (!deviceId) return next(msgError(400, "deviceId is required"));
//       if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
//       if (!isValidId(deviceId)) return next(msgError(400, "Invalid deviceId"));

//       await assertOwnsDevice(String(userId), deviceId);

//       if (!req.file) return next(msgError(400, "No file uploaded (field name must be 'file')"));

//       const original = req.file.originalname as string;
//       const mimeType = req.file.mimetype as string;
//       const sizeBytes = Number(req.file.size || 0);

//       // Create a safe stored filename: uuid + original extension (optional)
//       const ext = path.extname(original).slice(0, 12); // avoid weird long extensions
//       const storedBase = crypto.randomUUID();
//       const filenameStored = ext ? `${storedBase}${ext}` : storedBase;

//       const objectKey = buildObjectKey(String(userId), deviceId, filenameStored);
//       const storagePath = `minio://${MINIO_BUCKET}/${objectKey}`;

//       const buffer: Buffer = req.file.buffer;

//       // Optional checksum
//       const checksum = sha256(buffer);

//       // Upload to MinIO
//       // putObject(bucket, objectName, stream/buffer, size, meta)
//       const meta = {
//         "Content-Type": mimeType,
//         "x-amz-meta-originalname": original,
//         "x-amz-meta-deviceid": deviceId,
//         "x-amz-meta-userid": String(userId),
//       };

//       const putResult = await minio.putObject(MINIO_BUCKET, objectKey, buffer, sizeBytes, meta);

//       // Save metadata to MongoDB
//       const created = await File.create({
//         deviceId,
//         uploadedByUserId: userId,
//         filenameOriginal: original,
//         filenameStored,
//         mimeType,
//         sizeBytes,
//         storageDriver: "minio",
//         bucket: MINIO_BUCKET,
//         objectKey,
//         storagePath,
//         checksum,
//         // putResult.etag may exist depending on minio client version
//         etag: (putResult as any)?.etag,
//       });

//       res.status(201).json(created);
//     } catch (err: any) {
//       next(msgError(400, err.message));
//     }
//   }) as RequestHandler
// );

// // --------------------
// // DOWNLOAD (stream from MinIO)
// // GET /api/files/:id/download [&userId=... if not using req.user]
// // --------------------
// fileRouter.get(
//   "/:id/download",
//   (async (req: any, res, next) => {
//     try {
//       const userId = getRequesterUserId(req);
//       const fileId = String(req.params.id);

//       if (!userId) return next(msgError(401, "Missing user context"));
//       if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
//       if (!isValidId(fileId)) return next(msgError(400, "Invalid file id"));

//       const fileDoc = await File.findById(fileId);
//       if (!fileDoc) return next(msgError(404, "File not found"));

//       await assertOwnsDevice(String(userId), String(fileDoc.deviceId));

//       // Get object stream from MinIO
//       const stream = await minio.getObject(fileDoc.bucket, fileDoc.objectKey);

//       // Set headers so browser downloads with original name
//       res.setHeader("Content-Type", fileDoc.mimeType || "application/octet-stream");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${encodeURIComponent(fileDoc.filenameOriginal)}"`
//       );
//       res.setHeader("Content-Length", String(fileDoc.sizeBytes));

//       stream.on("error", (e) => next(msgError(500, `MinIO stream error: ${String((e as any)?.message || e)}`)));

//       stream.pipe(res);
//     } catch (err) {
//       next(err);
//     }
//   }) as RequestHandler
// );

// // --------------------
// // DELETE (MinIO object + Mongo record)
// // DELETE /api/files/:id [&userId=... if not using req.user]
// // --------------------
// fileRouter.delete(
//   "/:id",
//   (async (req: any, res, next) => {
//     try {
//       const userId = getRequesterUserId(req);
//       const fileId = String(req.params.id);

//       if (!userId) return next(msgError(401, "Missing user context"));
//       if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
//       if (!isValidId(fileId)) return next(msgError(400, "Invalid file id"));

//       const fileDoc = await File.findById(fileId);
//       if (!fileDoc) return next(msgError(404, "File not found"));

//       await assertOwnsDevice(String(userId), String(fileDoc.deviceId));

//       // Delete from MinIO first (so we don't orphan storage)
//       await minio.removeObject(fileDoc.bucket, fileDoc.objectKey);

//       // Delete from DB
//       await File.findByIdAndDelete(fileId);

//       res.json({ ok: true, deletedId: fileId });
//     } catch (err: any) {
//       next(msgError(400, err.message));
//     }
//   }) as RequestHandler
// );

export default fileRouter;