const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");


// List reviews
router.get(
    "/reviews",
    authMiddleware,
    reviewController.listReviews
);
router.get(
    "/practitioners/:practitioner_id/reviews",
    authMiddleware,
    reviewController.getPractitionerReviews
);

// View single review
router.get(
    "/reviews/:id",
    authMiddleware,
    reviewController.viewReview
);


// Add review
router.post(
    "/reviews",
    authMiddleware,
    reviewController.addReview
);


// Edit review
router.put(
    "/reviews/:id",
    authMiddleware,
    reviewController.updateReview
);


// Delete review
router.delete(
    "/reviews/:id",
    authMiddleware,
    reviewController.deleteReview
);


module.exports = router;