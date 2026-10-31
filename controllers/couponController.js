const crypto = require("crypto");
const Coupon = require("../models/Coupon");
const Service = require("../models/Service");

// Generate unique coupon code
const generateCouponCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = "HEAL" + crypto.randomBytes(3).toString("hex").toUpperCase();

        exists = await Coupon.findOne({ code });
    }

    return code;
};


// Validate selected services
const validateServices = async (serviceIds, practitionerId) => {
    if (!serviceIds || serviceIds.length === 0) {
        return true;
    }

    if (!Array.isArray(serviceIds)) {
        return false;
    }

    const uniqueIds = [...new Set(serviceIds.map(String))];

    if (uniqueIds.length !== serviceIds.length) {
        return false;
    }

    const count = await Service.countDocuments({
        _id: { $in: uniqueIds },
        practitioner_id: practitionerId
    });

    return count === uniqueIds.length;
};


// ADD COUPON
const addCoupon = async (req, res) => {
    try {
        const {
            code,
            type,
            amount,
            service_ids,
            expires_at,
            redemption_limit
        } = req.body;

        if (!type || amount === undefined || amount === "") {
            return res.status(400).json({
                success: false,
                message: "Coupon type and amount are required"
            });
        }

        if (!["fixed", "percentage"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be fixed or percentage"
            });
        }

        const discount = Number(amount);

        if (!Number.isFinite(discount) || discount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        if (type === "percentage" && discount > 100) {
            return res.status(400).json({
                success: false,
                message: "Percentage cannot exceed 100"
            });
        }

        if (
            redemption_limit !== undefined &&
            redemption_limit !== null &&
            redemption_limit !== ""
        ) {
            if (
                !Number.isInteger(Number(redemption_limit)) ||
                Number(redemption_limit) < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Redemption limit must be a positive whole number"
                });
            }
        }

        let selectedServices = service_ids || [];

        if (!Array.isArray(selectedServices)) {
            return res.status(400).json({
                success: false,
                message: "service_ids must be an array"
            });
        }

        const servicesValid = await validateServices(
            selectedServices,
            req.user.id
        );

        if (!servicesValid) {
            return res.status(400).json({
                success: false,
                message: "One or more selected services are invalid"
            });
        }

        if (expires_at) {
            const expiry = new Date(expires_at);

            if (isNaN(expiry.getTime()) || expiry <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Expiration date must be a valid future date"
                });
            }
        }

        let couponCode = code
            ? code.trim().toUpperCase()
            : await generateCouponCode();

        const existingCoupon = await Coupon.findOne({
            code: couponCode
        });

        if (existingCoupon) {
            return res.status(409).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        const coupon = await Coupon.create({
            practitioner_id: req.user.id,
            code: couponCode,
            type,
            amount: discount,
            service_ids: selectedServices,
            expires_at: expires_at || null,
            redemption_limit:
                redemption_limit === "" ||
                redemption_limit === undefined ||
                redemption_limit === null
                    ? null
                    : Number(redemption_limit),
            used_count: 0
        });

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: coupon
        });

    } catch (error) {
        console.error("Add coupon error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// LIST COUPONS
const listCoupons = async (req, res) => {
    try {
        const { search, status } = req.query;

        const filter = {
            practitioner_id: req.user.id
        };

        if (search && search.trim()) {
            filter.code = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        if (status) {
            filter.status = status;
        }

        const coupons = await Coupon.find(filter)
            .populate("service_ids", "name price")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Coupons fetched successfully",
            count: coupons.length,
            data: coupons
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// VIEW COUPON
const viewCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        }).populate("service_ids", "name price");

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon fetched successfully",
            data: coupon
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE COUPON
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        const {
            code,
            type,
            amount,
            service_ids,
            expires_at,
            redemption_limit,
            status
        } = req.body;

        if (type !== undefined) {
            if (!["fixed", "percentage"].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Type must be fixed or percentage"
                });
            }

            coupon.type = type;
        }

        if (amount !== undefined) {
            const discount = Number(amount);

            if (!Number.isFinite(discount) || discount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Amount must be greater than zero"
                });
            }

            coupon.amount = discount;
        }

        if (
            coupon.type === "percentage" &&
            coupon.amount > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Percentage cannot exceed 100"
            });
        }

        if (code !== undefined) {
            const cleanCode = code.trim().toUpperCase();

            if (!cleanCode) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code cannot be empty"
                });
            }

            const existingCoupon = await Coupon.findOne({
                code: cleanCode,
                _id: { $ne: coupon._id }
            });

            if (existingCoupon) {
                return res.status(409).json({
                    success: false,
                    message: "Coupon code already exists"
                });
            }

            coupon.code = cleanCode;
        }

        if (service_ids !== undefined) {
            if (!Array.isArray(service_ids)) {
                return res.status(400).json({
                    success: false,
                    message: "service_ids must be an array"
                });
            }

            const servicesValid = await validateServices(
                service_ids,
                req.user.id
            );

            if (!servicesValid) {
                return res.status(400).json({
                    success: false,
                    message: "One or more selected services are invalid"
                });
            }

            coupon.service_ids = service_ids;
        }

        if (expires_at !== undefined) {
            if (expires_at === null || expires_at === "") {
                coupon.expires_at = null;
            } else {
                const expiry = new Date(expires_at);

                if (isNaN(expiry.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid expiration date"
                    });
                }

                coupon.expires_at = expiry;
            }
        }

        if (redemption_limit !== undefined) {
            if (redemption_limit === null || redemption_limit === "") {
                coupon.redemption_limit = null;
            } else {
                const limit = Number(redemption_limit);

                if (!Number.isInteger(limit) || limit < 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Redemption limit must be a positive whole number"
                    });
                }

                if (limit < coupon.used_count) {
                    return res.status(400).json({
                        success: false,
                        message: "Redemption limit cannot be less than the number of times already used"
                    });
                }

                coupon.redemption_limit = limit;
            }
        }

        if (status !== undefined) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be active or inactive"
                });
            }

            coupon.status = status;
        }

        await coupon.save();

        await coupon.populate("service_ids", "name price");

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE COUPON
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            _id: req.params.id,
            practitioner_id: req.user.id
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        await Coupon.deleteOne({ _id: coupon._id });

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    addCoupon,
    listCoupons,
    viewCoupon,
    updateCoupon,
    deleteCoupon
};