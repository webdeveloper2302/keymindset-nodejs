
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addOnRoutes = require("./routes/addOnRoutes");
const app = express();

// 1. CORS configuration - MUST BE BEFORE ALL ROUTES
const corsOptions = {
    origin: [
        "https://keymindstechnology.com",
        "https://www.keymindstechnology.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept"
    ],
    credentials: true
};

app.use(cors(corsOptions));

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static uploads
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// 4. All API routes
app.use("/api", serviceRoutes);
app.use("/api", reviewRoutes);
app.use("/api", clientRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.use("/api", addOnRoutes);

// 5. Default route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Node.js API is working"
    });
});

// 6. Database connection
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
