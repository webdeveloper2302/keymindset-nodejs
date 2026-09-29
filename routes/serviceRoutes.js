const express = require("express");

const router = express.Router();

const {
    addService,
    listServices,
    viewService,
    updateService
} = require("../controllers/serviceController");

const authMiddleware =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/serviceUpload");


// Add service
router.post(
    "/services",
    authMiddleware,
    upload.single("photo"),
    addService
);


// List services
router.get(
    "/services",
    authMiddleware,
    listServices
);


// View service
router.get(
    "/services/:id",
    authMiddleware,
    viewService
);


// Update service
router.put(
    "/services/:id",
    authMiddleware,
    upload.single("photo"),
    updateService
);


module.exports = router;