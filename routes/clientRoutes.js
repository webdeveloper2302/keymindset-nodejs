const express = require("express");

const router = express.Router();

const {
    addClient,updateClient,
    listClients
} = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");


// Add client
router.post(
    "/clients",
    authMiddleware,
    addClient
);


router.put(
    "/clients/:id",
    authMiddleware,
    updateClient
);

router.get(
    "/clients",
    authMiddleware,
    listClients
    
);
module.exports = router;