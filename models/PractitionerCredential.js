const mongoose = require("mongoose");

const practitionerCredentialSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        credential_type: {
            type: String,
            enum: [
                "License",
                "Degree",
                "Certification"
            ],
            required: true
        },

        credential_name: {
            type: String,
            required: true,
            trim: true
        },

        document: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected"
            ],
            default: "pending"
        },

        uploaded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
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

module.exports = mongoose.model(
    "PractitionerCredential",
    practitionerCredentialSchema
);