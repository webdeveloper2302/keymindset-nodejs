const express = require("express");
const router = express.Router();

const addOnController = require("../controllers/addOnController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/addons",
    authMiddleware,
    addOnController.addAddOn
);

router.get(
    "/addons",
    authMiddleware,
    addOnController.listAddOns
);

router.get(
    "/addons/:id",
    authMiddleware,
    addOnController.viewAddOn
);

router.put(
    "/addons/:id",
    authMiddleware,
    addOnController.updateAddOn
);

router.delete(
    "/addons/:id",
    authMiddleware,
    addOnController.deleteAddOn
);

module.exports = router;