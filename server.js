require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const path = require("path");


const app = express();

const cors = require('cors');

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


app.use(cors({
    origin: [
        'https://keymindstechnology.com',
        'https://www.keymindstechnology.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


connectDB();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Node.js API is working"
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});


