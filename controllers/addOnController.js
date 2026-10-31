const AddOn = require("../models/AddOn");
const Service = require("../models/Service");

// ADD ADD-ON
const addAddOn = async (req, res) => {
    try {
        const { name, price, description, service_id } = req.body;

        if (!name || price === undefined || !service_id) {
            return res.status(400).json({
                success: false,
                message: "Name, price and service are required"
            });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid price"
            });
        }

        const service = await Service.findOne({
            _id: service_id,
            practitioner_id: req.user.id
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Selected service not found"
            });
        }

        const addOn = await AddOn.create({
            practitioner_id: req.user.id,
            service_id,
            name,
            price: Number(price),
            description: description || ""
        });

        return res.status(201).json({
            success: true,
            message: "Add-on added successfully",
            data: addOn
        });

    } catch (error) {
        console.error("Add add-on error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// LIST ADD-ONS
const listAddOns = async (req, res) => {
    try {
        const { search, service_id } = req.query;

        const filter = {
            practitioner_id: req.user.id
        };

        if (service_id) {
            filter.service_id = service_id;
        }

        if (search && search.trim()) {
            filter.name = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        const addOns = await AddOn.find(filter)
            .populate("service_id", "name price")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Add-ons fetched successfully",
            count: addOns.length,
            data: addOns
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// VIEW SINGLE ADD-ON
const viewAddOn = async (req, res) => {
    try {
        const addOn = await AddOn.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        }).populate("service_id", "name price");

        if (!addOn) {
            return res.status(404).json({
                success: false,
                message: "Add-on not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Add-on details fetched successfully",
            data: addOn
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE ADD-ON
const updateAddOn = async (req, res) => {
    try {
        const { name, price, description, service_id } = req.body;

        const addOn = await AddOn.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        });

        if (!addOn) {
            return res.status(404).json({
                success: false,
                message: "Add-on not found"
            });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }

            addOn.name = name.trim();
        }

        if (price !== undefined) {
            if (!Number.isFinite(Number(price)) || Number(price) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid price"
                });
            }

            addOn.price = Number(price);
        }

        if (description !== undefined) {
            addOn.description = description;
        }

        if (service_id !== undefined) {
            const service = await Service.findOne({
                _id: service_id,
                practitioner_id: req.user.id
            });

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Selected service not found"
                });
            }

            addOn.service_id = service_id;
        }

        await addOn.save();

        await addOn.populate("service_id", "name price");

        return res.status(200).json({
            success: true,
            message: "Add-on updated successfully",
            data: addOn
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE ADD-ON
const deleteAddOn = async (req, res) => {
    try {
        const addOn = await AddOn.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        });

        if (!addOn) {
            return res.status(404).json({
                success: false,
                message: "Add-on not found"
            });
        }

        await AddOn.deleteOne({
            _id: addOn._id
        });

        return res.status(200).json({
            success: true,
            message: "Add-on deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    addAddOn,
    listAddOns,
    viewAddOn,
    updateAddOn,
    deleteAddOn
};