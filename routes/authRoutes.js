const express = require("express");

const router = express.Router();

const {addCredential, uploadCredential,register, login ,savePractitioner,updatePractitionerUrl,
     getUserDetails,activateAdmin,addAdmin,editAdmin, addUser,
     deactivateAdmin, listUsers,rejectAdminRequest, markAdminRequestAsRead,
     listUsers1,getAdminRequests,approveAdminRequest} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post(
    "/add-admin",
    authMiddleware,
    addAdmin
);

router.post(
    "/practitioners/:practitioner_id/credentials",
    authMiddleware,
    uploadCredential.single("document"),
    addCredential
);
router.post(
    "/add-user",
    authMiddleware,
    addUser
);
router.put(
    "/practitioners/:id",
    authMiddleware,
    savePractitioner
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
router.get(
    "/users/:id/details",
    authMiddleware,
    getUserDetails
);
router.put(
    "/users/:id/practitioner-url",
    authMiddleware,
    updatePractitionerUrl
);


module.exports = router;