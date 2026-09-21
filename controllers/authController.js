const User = require("../models/User");
const AdminRequest = require("../models/AdminRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {

        const { first_name, last_name, mobile , role ,  email, password } = req.body;

        // 1. Validate required fields
        if (!first_name ||  !last_name || !mobile || !role || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // 2. Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            first_name,
            last_name,
            mobile,
            role,
            email,
            password: hashedPassword
        });

        // 5. Response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // // Check Super Admin
        // if (user.role !== 1) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Access denied. Super Admin only."
        //     });
        // }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        if (user.role == 1) {
            var Message="Super Admin login successful";
        }else if(user.role == 2){
            var Message="Admin login successful";

        }else{
             var Message="User login successful";

        }

        return res.status(200).json({
            success: true,
            message: Message,
            data: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            },
            token: token
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const addAdmin = async (req, res) => {
    try {

        // Only Super Admin and Admin can add Admin
        if (![1, 2].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to add Admin"
            });
        }

        // Only Super Admin can create Admin
        // if (req.user.role !== 1) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Only Super Admin can add Admin"
        //     });
        // }

        const {
            first_name,
            last_name,
            middle_name,
            email,
            mobile,
            password
        } = req.body;

        if (!first_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Super Admin → active
        // Admin → pending
        const status = req.user.role === 1
            ? "active"
            : "pending";


        const admin = await User.create({
            first_name,
            last_name,
            middle_name,
            email,
            mobile,
            password: hashedPassword,
            role: 2,
            status: status
        });

           // If Admin creates Admin,
        // create approval request for Super Admin
        if (req.user.role === 2) {

            await AdminRequest.create({
                admin_id: admin._id,
                requested_by: req.user.id,
                request_type: "admin_creation",
                status: "pending"
            });
        }
        return res.status(201).json({
            success: true,
               message: req.user.role === 1
                ? "Admin added successfully"
                : "Admin request sent to Super Admin for approval",
            data: {
                id: admin._id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                middle_name:admin.middle_name,
                mobile:admin.mobile,
                email: admin.email,
                role: admin.role,
                status: admin.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addUser = async (req, res) => {
    try {
        // Only Super Admin can create Admin
        // if (req.user.role !== 1) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Only Super Admin can add Admin"
        //     });
        // }

        const {
            first_name,
            last_name,
            middle_name,
            email,
            mobile,
            password
        } = req.body;

        if (!first_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            first_name,
            last_name,
            middle_name,
            email,
            mobile,
            password: hashedPassword,
            role: 3
        });

        return res.status(201).json({
            success: true,
            message: "User added successfully",
            data: {
                id: admin._id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                middle_name:admin.middle_name,
                mobile:admin.mobile,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const listUsers = async (req, res) => {
    try {
        const users = await User.find(
            { role: 2 },
            {
                password: 0
            }
        ).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Admin list fetched successfully",
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listUsers1 = async (req, res) => {
    try {
        const users = await User.find(
            { role: 3 },
            {
                password: 0
            }
        ).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "User list fetched successfully",
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
      login,
      addAdmin,
      addUser,
      listUsers,
      listUsers1
};