const Review = require("../models/Review");
const User = require("../models/User");
const Service = require("../models/Service");

const addReview = async (req, res) => {
    try {

        // Only Super Admin and Admin
        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin and Admin can add reviews"
            });
        }

        const {
            practitioner_id,
            first_name,
            last_name,
            email,
            phone,
            rating,
            review,
            created_date
        } = req.body;

        // Validation
        if (!practitioner_id) {
            return res.status(400).json({
                success: false,
                message: "Practitioner ID is required"
            });
        }

        if (!first_name) {
            return res.status(400).json({
                success: false,
                message: "First name is required"
            });
        }

        if (!rating) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Check practitioner
        const practitioner = await User.findOne({
            _id: practitioner_id,
            role: 3
        });

        if (!practitioner) {
            return res.status(404).json({
                success: false,
                message: "Practitioner not found"
            });
        }

    

        const newReview = await Review.create({
            practitioner_id,
            first_name,
            last_name,
            email,
            phone,
            rating,
            review,
            created_date: created_date || new Date(),
            created_by: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: newReview
        });

    } catch (error) {

        console.error("Add review error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listReviews = async (req, res) => {
    try {

        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const { practitioner_id, rating, search } = req.query;

        const filter = {};

        if (practitioner_id) {
            filter.practitioner_id = practitioner_id;
        }

        if (rating) {
            filter.rating = Number(rating);
        }

        if (search) {
            filter.$or = [
                {
                    first_name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    last_name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    review: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const reviews = await Review.find(filter)
            .populate(
                "practitioner_id",
                "first_name middle_name last_name email"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            count: reviews.length,
            data: reviews
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const viewReview = async (req, res) => {
    try {

        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const { id } = req.params;

        const review = await Review.findById(id)
            .populate(
                "practitioner_id",
                "first_name middle_name last_name email"
            )
          
            .populate(
                "created_by",
                "first_name last_name email role"
            );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review fetched successfully",
            data: review
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateReview = async (req, res) => {
    try {

        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin and Admin can edit reviews"
            });
        }

        const { id } = req.params;

        const {
            practitioner_id,
            first_name,
            last_name,
            email,
            phone,
            rating,
            review,
            created_date
        } = req.body;

        const existingReview = await Review.findById(id);

        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }
        }

        // If practitioner is changed, verify practitioner
        if (practitioner_id) {

            const practitioner = await User.findOne({
                _id: practitioner_id,
                role: 3
            });

            if (!practitioner) {
                return res.status(404).json({
                    success: false,
                    message: "Practitioner not found"
                });
            }

            existingReview.practitioner_id = practitioner_id;
        }

    

        if (first_name !== undefined)
            existingReview.first_name = first_name;

        if (last_name !== undefined)
            existingReview.last_name = last_name;

        if (email !== undefined)
            existingReview.email = email;

        if (phone !== undefined)
            existingReview.phone = phone;

        if (rating !== undefined)
            existingReview.rating = rating;

        if (review !== undefined)
            existingReview.review = review;

        if (created_date !== undefined)
            existingReview.created_date = created_date;

        await existingReview.save();

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: existingReview
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteReview = async (req, res) => {
    try {

        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin and Admin can delete reviews"
            });
        }

        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        await Review.deleteOne({
            _id: id
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addReview,
    listReviews,
    viewReview,
    updateReview,
    deleteReview
};