const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AddOn", addOnSchema);