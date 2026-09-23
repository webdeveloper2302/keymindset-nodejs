const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        url: {
            type: String,
            unique: true,
            required: true
        },

        refer_code: {
            type: String,
            unique: true,
            sparse: true
        },

        refer_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model("UserDetails", userDetailsSchema);