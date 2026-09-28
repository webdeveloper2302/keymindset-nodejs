const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        first_name: {
            type: String,
            required: true,
            trim: true
        },

        middle_name: {
            type: String,
            default: "",
            trim: true
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        mobile: {
            type: String,
            trim: true
        },

        date_of_birth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other"
        },

        address: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        country: {
            type: String,
            default: ""
        },

        postal_code: {
            type: String,
            default: ""
        },

        notes: {
            type: String,
            default: ""
        },

        // Payment/card information
        card_on_file: {
            type: Boolean,
            default: false
        },

        // Last appointment
        last_appointment_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        last_appointment_at: {
            type: Date,
            default: null
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

module.exports = mongoose.model("Client", clientSchema);