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
                "Certificate"
            ],
            required: true
        },

        credential_name: {
            type: String,
            required: true,
            trim: true
        },
            // Issuing organization/person
        issuer: {
            type: String,
            trim: true,
            default: ""
        },    // Date credential was issued
        issued_at: {
            type: Date,
            default: null
        },

        // Hide from search
        exclude_from_search: {
            type: Boolean,
            default: false
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
        },
        rejected_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},

rejected_at: {
    type: Date,
    default: null
},

rejection_reason: {
    type: String,
    trim: true,
    default: ""
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