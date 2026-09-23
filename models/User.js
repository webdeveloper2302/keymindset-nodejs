const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        role: {
            type: Number,
            required: true
        },
         mobile: {
            type: String,
            required: true
        },
        middle_name:{
             type: String

        },
         status:{
            type: String,
            enum: ["active", "pending", "deactivate"],
            default: "pending"

        },

          email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },
            added_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
            },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);