const express = require("express");

const router = express.Router();

const { register, login , addAdmin, addUser, listUsers, listUsers1} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post(
    "/add-admin",
    authMiddleware,
    addAdmin
);

router.post(
    "/add-user",
    authMiddleware,
    addUser
);

router.get(
    "/list-admin",
    authMiddleware,
    listUsers
);

router.get(
    "/list-user",
    authMiddleware,
    listUsers1
);






module.exports = router;