const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
    {
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        requested_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        request_type: {
            type: String,
            default: "admin_creation"
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approved_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AdminRequest", adminRequestSchema);