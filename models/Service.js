const mongoose = require("mongoose");

const pricingOptionSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required: true,
            min: 0
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

const availabilitySchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            required: true
        },

        start_time: {
            type: String,
            required: true
        },

        end_time: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);

const serviceSchema = new mongoose.Schema(
    {
        practitioner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        photo: {
            type: String,
            default: null
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        cancellation_policy: {
            type: String,
            default: ""
        },

        pricing_options: {
            type: [pricingOptionSchema],
            required: true
        },

        public_on_website: {
            type: Boolean,
            default: false
        },

        locations: {
            type: [String],
            enum: ["virtual", "in_person"],
            default: []
        },

        availability_enabled: {
            type: Boolean,
            default: false
        },

        availability: {
            type: [availabilitySchema],
            default: []
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

module.exports = mongoose.model("Service", serviceSchema);