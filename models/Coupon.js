const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["fixed", "percentage"],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        service_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            }
        ],

        expires_at: {
            type: Date,
            default: null
        },

        redemption_limit: {
            type: Number,
            default: null,
            min: 1
        },

        used_count: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Coupon", couponSchema);