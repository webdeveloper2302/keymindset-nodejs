const Service = require("../models/Service");
const fs = require("fs");
const path = require("path");

const addService = async (req, res) => {

    try {

        const {
            name,
            description,
            cancellation_policy,
            pricing_options,
            public_on_website,
            locations,
            availability_enabled,
            availability
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Service name is required"
            });
        }

        if (!pricing_options) {
            return res.status(400).json({
                success: false,
                message: "Pricing options are required"
            });
        }

        let parsedPricing = pricing_options;

        let parsedLocations = locations || [];
        let parsedAvailability = availability || [];

        // Multipart form-data sends arrays as strings
        if (typeof pricing_options === "string") {
            parsedPricing = JSON.parse(pricing_options);
        }

        if (typeof locations === "string") {
            parsedLocations = JSON.parse(locations);
        }

        if (typeof availability === "string") {
            parsedAvailability = JSON.parse(availability);
        }

        let photo = null;

        if (req.file) {
            photo = `/uploads/services/${req.file.filename}`;
        }

        const service = await Service.create({

            practitioner_id: req.user.id,

            photo: photo,

            name: name,

            description: description || "",

            cancellation_policy:
                cancellation_policy || "",

            pricing_options: parsedPricing,

            public_on_website:
                public_on_website === true ||
                public_on_website === "true",

            locations: parsedLocations,

            availability_enabled:
                availability_enabled === true ||
                availability_enabled === "true",

            availability: parsedAvailability

        });

        const serviceData = service.toObject();

        if (serviceData.photo) {
            serviceData.photo =
                `${req.protocol}://${req.get("host")}${serviceData.photo}`;
        }

        return res.status(201).json({

            success: true,

            message: "Service created successfully",

            data: serviceData
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};
const listServices = async (req, res) => {

    try {

        const services = await Service.find({
            practitioner_id: req.user.id
        }).sort({
            createdAt: -1
        });

        const data = services.map(service => {

            const item = service.toObject();

            if (item.photo) {
                item.photo =
                    `${req.protocol}://${req.get("host")}${item.photo}`;
            }

            return item;
        });

        return res.status(200).json({

            success: true,

            message: "Services fetched successfully",

            data: data
        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};const viewService = async (req, res) => {

    try {

        const { id } = req.params;

        const service = await Service.findOne({

            _id: id,

            practitioner_id: req.user.id

        });

        if (!service) {

            return res.status(404).json({

                success: false,

                message: "Service not found"
            });
        }

        const data = service.toObject();

        if (data.photo) {

            data.photo =
                `${req.protocol}://${req.get("host")}${data.photo}`;
        }

        return res.status(200).json({

            success: true,

            message: "Service fetched successfully",

            data: data
        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};const updateService = async (req, res) => {

    try {

        const { id } = req.params;

        const service = await Service.findOne({

            _id: id,

            practitioner_id: req.user.id

        });

        if (!service) {

            return res.status(404).json({

                success: false,

                message: "Service not found"
            });
        }

        const {
            name,
            description,
            cancellation_policy,
            pricing_options,
            public_on_website,
            locations,
            availability_enabled,
            availability,
            status
        } = req.body;


        if (name !== undefined) {
            service.name = name;
        }

        if (description !== undefined) {
            service.description = description;
        }

        if (cancellation_policy !== undefined) {
            service.cancellation_policy =
                cancellation_policy;
        }


        if (pricing_options !== undefined) {

            service.pricing_options =
                typeof pricing_options === "string"
                    ? JSON.parse(pricing_options)
                    : pricing_options;
        }


        if (public_on_website !== undefined) {

            service.public_on_website =
                public_on_website === true ||
                public_on_website === "true";
        }


        if (locations !== undefined) {

            service.locations =
                typeof locations === "string"
                    ? JSON.parse(locations)
                    : locations;
        }


        if (availability_enabled !== undefined) {

            service.availability_enabled =
                availability_enabled === true ||
                availability_enabled === "true";
        }


        if (availability !== undefined) {

            service.availability =
                typeof availability === "string"
                    ? JSON.parse(availability)
                    : availability;
        }


        if (status !== undefined) {
            service.status = status;
        }


        // New photo
        if (req.file) {

            // Delete old photo
            if (service.photo) {

                const oldPhoto = path.join(
                    __dirname,
                    "..",
                    service.photo
                );

                if (fs.existsSync(oldPhoto)) {
                    fs.unlinkSync(oldPhoto);
                }
            }

            service.photo =
                `/uploads/services/${req.file.filename}`;
        }


        await service.save();


        const data = service.toObject();

        if (data.photo) {

            data.photo =
                `${req.protocol}://${req.get("host")}${data.photo}`;
        }


        return res.status(200).json({

            success: true,

            message: "Service updated successfully",

            data: data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Find service belonging to logged-in practitioner
        const service = await Service.findOne({
            _id: id,
            practitioner_id: req.user.id
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Delete service
        await Service.deleteOne({
            _id: id
        });

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {

        console.error("Delete service error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    addService,
    listServices,
    viewService,
    updateService,
    deleteService
};