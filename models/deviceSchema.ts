import mongoose from "mongoose";

export const driveSchema = new mongoose.Schema({
    fs: { type: String, required: true },        // e.g. 'overlay', '/dev/sdb1'
    type: { type: String, required: true },       // e.g. 'ext4', 'overlay'
    mount: { type: String, required: true },      // e.g. '/', '/config'
    sizeMB: { type: Number, required: true },
    usedMB: { type: Number, required: true },
    availableMB: { type: Number, required: true },
    usePercent: { type: Number, required: true }, // e.g. 1.4
    rw: { type: Boolean, default: false },        // read/write flag
}, { _id: false });

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true
    },
    name: {
        type: String,
        required: true
    },

    drives: {
        type: [driveSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Virtual — total across all drives in GB
deviceSchema.virtual("storageTotalGB").get(function () {
    return parseFloat((this.drives.reduce((sum, d) => sum + d.sizeMB, 0) / 1024).toFixed(2));
});

// Virtual — used across all drives in GB
deviceSchema.virtual("storageUsedGB").get(function () {
    return parseFloat((this.drives.reduce((sum, d) => sum + d.usedMB, 0) / 1024).toFixed(2));
});

// Virtual — used across all drives in GB
deviceSchema.virtual("availableGB").get(function () {
    return parseFloat((this.drives.reduce((sum, d) => sum + d.availableMB, 0) / 1024).toFixed(2));
});

export default mongoose.model("Device", deviceSchema)