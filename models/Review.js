const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        first_name: {
            type: String,
            required: true,
            trim: true
        },

        last_name: {
            type: String,
            default: "",
            trim: true
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            default: "",
            trim: true
        },

        created_date: {
            type: Date,
            default: Date.now
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Review", reviewSchema);