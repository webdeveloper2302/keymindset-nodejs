const express = require("express");

const router = express.Router();

const { register, login , activateAdmin,addAdmin,editAdmin, addUser,deactivateAdmin, listUsers,rejectAdminRequest, markAdminRequestAsRead,listUsers1,getAdminRequests,approveAdminRequest} = require("../controllers/authController");
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

router.get(
    "/admin-requests",
    authMiddleware,
    getAdminRequests
);


router.put(
    "/admin-requests/:requestId/approve",
    authMiddleware,
    approveAdminRequest
);

router.put(
    "/admin-requests/:requestId/read",
    authMiddleware,
    markAdminRequestAsRead
);

router.put(
    "/admin-requests/:requestId/reject",
    authMiddleware,
    rejectAdminRequest
);
router.put(
    "/admins/:adminId/deactivate",
    authMiddleware,
    deactivateAdmin
);
router.put(
    "/admins/:adminId/activate",
    authMiddleware,
    activateAdmin
);
router.put(
    "/admins/:id",
    authMiddleware,
    editAdmin
);



module.exports = router;