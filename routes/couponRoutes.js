const express = require("express");
const router = express.Router();

const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/coupons",
    authMiddleware,
    couponController.addCoupon
);

router.get(
    "/coupons",
    authMiddleware,
    couponController.listCoupons
);

router.get(
    "/coupons/:id",
    authMiddleware,
    couponController.viewCoupon
);

router.put(
    "/coupons/:id",
    authMiddleware,
    couponController.updateCoupon
);

router.delete(
    "/coupons/:id",
    authMiddleware,
    couponController.deleteCoupon
);

module.exports = router;