const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const AdminRequest = require("../models/AdminRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PractitionerCredential = require("../models/PractitionerCredential");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

           // Check account status
        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status}`
            });
        }

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
            status: status,
             added_by: req.user.id
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

        const slug = [
        first_name,
        middle_name,
        last_name
        ]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

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
        const status = "active";


        const admin = await User.create({
            first_name,
            last_name,
            middle_name,
            email,
            mobile,
            password: hashedPassword,
            role: 3,
            status: status,
            added_by: req.user.id
        });

        const userDetails = await UserDetails.create({
        user_id: admin._id,
        url: slug,
        refer_code: null,
        refer_by: null
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

const approveAdminRequest = async (req, res) => {
    try {
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can approve requests"
            });
        }

        const { requestId } = req.params;

        const request = await AdminRequest.findOne({
            _id: requestId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending admin request not found"
            });
        }

        const admin = await User.findById(request.admin_id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Activate Admin
        admin.status = "active";
        await admin.save();

        // Update request
        request.status = "approved";
        request.approved_by = req.user.id;
        request.approved_at = new Date();

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Admin request approved successfully",
            data: {
                admin_id: admin._id,
                email: admin.email,
                status: admin.status,
                request_status: request.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Find user
        const user = await User.findById(
            id,
            { password: 0 }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find user details
        const userDetails = await UserDetails.findOne({
            user_id: id
        }).populate(
            "refer_by",
            "first_name middle_name last_name email"
        );

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: {
                user: user,
                details: userDetails
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getAdminRequests = async (req, res) => {
    try {
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can view admin requests"
            });
        }

        const requests = await AdminRequest.find({
            status: "pending"
        })
        .populate(
            "admin_id",
            "first_name last_name email role status"
        )
        .populate(
            "requested_by",
            "first_name last_name email"
        )
        .sort({ createdAt: -1 });


          // Total pending requests
        const totalRequests = await AdminRequest.countDocuments({
            status: "pending"
        });

        // Unread pending requests
        const unreadRequests = await AdminRequest.countDocuments({
            status: "pending",
            is_read: false
        });

        return res.status(200).json({
            success: true,
            message: "Admin requests fetched successfully",
             count: {
                total: totalRequests,
                unread: unreadRequests
            },
            data: requests
           
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const rejectAdminRequest = async (req, res) => {
    try {
        // Only Super Admin
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can reject requests"
            });
        }

        const { requestId } = req.params;

        const request = await AdminRequest.findOne({
            _id: requestId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending admin request not found"
            });
        }

        const admin = await User.findById(request.admin_id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Keep admin inactive after rejection
        admin.status = "deactivate";
        await admin.save();

        // Update request
        request.status = "rejected";
        request.rejected_by = req.user.id;
        request.rejected_at = new Date();

        // Notification has been handled/read
        request.is_read = true;

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Admin request rejected successfully",
            data: {
                admin_id: admin._id,
                email: admin.email,
                status: admin.status,
                request_status: request.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const markAdminRequestAsRead = async (req, res) => {
    try {
        // Only Super Admin
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can read admin requests"
            });
        }

        const { requestId } = req.params;

        const request = await AdminRequest.findOne({
            _id: requestId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending admin request not found"
            });
        }

        request.is_read = true;
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Admin request marked as read",
            data: {
                request_id: request._id,
                is_read: request.is_read
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const activateAdmin = async (req, res) => {
    try {
        // Only Super Admin can deactivate admin
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can deactivate admin"
            });
        }

        const { adminId } = req.params;

        const admin = await User.findOne({
            _id: adminId
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Update status
        admin.status = "active";
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin activated successfully",
            data: {
                admin_id: admin._id,
                email: admin.email,
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
const deactivateAdmin = async (req, res) => {
    try {
        // Only Super Admin can deactivate admin
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can deactivate admin"
            });
        }

        const { adminId } = req.params;

        const admin = await User.findOne({
            _id: adminId
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Update status
        admin.status = "deactivate";
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin deactivated successfully",
            data: {
                admin_id: admin._id,
                email: admin.email,
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

const editAdmin = async (req, res) => {
    try {
        // Only Super Admin can edit Admin details
        // if (req.user.role !== 1) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Only Super Admin can edit Admin details"
        //     });
        // }

        const { id } = req.params;

        const {
            first_name,
            last_name,
            middle_name,
            mobile
        } = req.body;

        // Find Admin
        const admin = await User.findOne({
            _id: id,
            role: 2
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Validate required fields
        if (!first_name) {
            return res.status(400).json({
                success: false,
                message: "First name is required"
            });
        }

        // Check email already used by another user
        const existingUser = await User.findOne({
           
            _id: { $ne: id }
        });

        // if (existingUser) {
        //     return res.status(409).json({
        //         success: false,
        //         message: "Email already registered"
        //     });
        // }

        // Update details
        admin.first_name = first_name;
        admin.last_name = last_name || "";
        admin.middle_name = middle_name || "";
        admin.mobile = mobile || "";

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin details updated successfully",
            data: {
                id: admin._id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                mobile: admin.mobile,
                middle_name: admin.middle_name
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updatePractitionerUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;

        // Validate URL
        if (!url || !url.trim()) {
            return res.status(400).json({
                success: false,
                message: "Practitioner URL is required"
            });
        }

        // Clean URL
        const cleanUrl = url
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-");

        // Check user exists
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check URL already exists
        const existingUrl = await UserDetails.findOne({
            url: cleanUrl,
            user_id: { $ne: id }
        });

        if (existingUrl) {
            return res.status(409).json({
                success: false,
                message: "Practitioner URL already exists"
            });
        }

        // Update URL
        const userDetails = await UserDetails.findOneAndUpdate(
            { user_id: id },
            {
                $set: {
                    url: cleanUrl
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Practitioner URL updated successfully",
            data: {
                user_id: id,
                url: userDetails.url
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const savePractitioner = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            first_name,
            middle_name,
            last_name,
            email,
            mobile,
            url,
            refer_code,
            refer_by
        } = req.body;

        // Find practitioner/user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Practitioner not found"
            });
        }

        // -----------------------------
        // Validate required fields
        // -----------------------------

        if (!first_name || !last_name || !email || !mobile) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email and mobile are required"
            });
        }

        // -----------------------------
        // Check email already exists
        // -----------------------------

        const existingEmail = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: id }
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // -----------------------------
        // Check practitioner URL
        // -----------------------------

        let cleanUrl = url;

        if (url) {
            cleanUrl = url
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .replace(/-+/g, "-");

            const existingUrl = await UserDetails.findOne({
                url: cleanUrl,
                user_id: { $ne: id }
            });

            if (existingUrl) {
                return res.status(409).json({
                    success: false,
                    message: "Practitioner URL already exists"
                });
            }
        }

        // -----------------------------
        // Update User
        // -----------------------------

        user.first_name = first_name;
        user.middle_name = middle_name || "";
        user.last_name = last_name;
        user.email = email.toLowerCase();
        user.mobile = mobile;

        await user.save();

        // -----------------------------
        // Update User Details
        // -----------------------------

        const userDetails = await UserDetails.findOneAndUpdate(
            {
                user_id: id
            },
            {
                $set: {
                    url: cleanUrl || "",
                    refer_code: refer_code || "",
                    refer_by: refer_by || null
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(200).json({
            success: true,
            message: "Practitioner details updated successfully",

            data: {
                user: {
                    id: user._id,
                    first_name: user.first_name,
                    middle_name: user.middle_name,
                    last_name: user.last_name,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    status: user.status
                },

                details: {
                    id: userDetails._id,
                    url: userDetails.url,
                    refer_code: userDetails.refer_code,
                    refer_by: userDetails.refer_by
                }
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const uploadPath = path.join(
            __dirname,
            "../uploads/credentials"
        );

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, {
                recursive: true
            });
        }

        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {

        const extension = path.extname(file.originalname);

        const fileName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            extension;

        cb(null, fileName);
    }
});

const uploadCredential = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, JPG, JPEG and PNG files are allowed"
                )
            );
        }
    }
});
const addCredential = async (req, res) => {
    try {

        const { practitioner_id } = req.params;

        const {
            credential_type,
            credential_name
        } = req.body;

        // Check practitioner
        const practitioner = await User.findById(
            practitioner_id
        );

        if (!practitioner) {
            return res.status(404).json({
                success: false,
                message: "Practitioner not found"
            });
        }

        // Validate fields
        if (!credential_type || !credential_name) {
            return res.status(400).json({
                success: false,
                message:
                    "Credential type and credential name are required"
            });
        }

        // Check file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload a certificate or credential document"
            });
        }

        // Maximum 10 credentials
        const credentialCount =
            await PractitionerCredential.countDocuments({
                practitioner_id: practitioner_id
            });

        if (credentialCount >= 10) {

            // Delete uploaded file because limit reached
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message:
                    "Maximum 10 credentials are allowed"
            });
        }

        // Document URL
        const documentUrl =
    `${req.protocol}://${req.get("host")}/uploads/credentials/${req.file.filename}`;
        // const documentUrl =
        //     `/uploads/credentials/${req.file.filename}`;

        // ALWAYS pending
        const credential =
            await PractitionerCredential.create({

                practitioner_id: practitioner_id,

                credential_type: credential_type,

                credential_name: credential_name,

                document: documentUrl,

                status: "pending",

                uploaded_by: req.user.id
            });

        return res.status(201).json({

            success: true,

            message:
                "Credential added successfully and sent for approval",

            data: {
                id: credential._id,
                practitioner_id:
                    credential.practitioner_id,

                credential_type:
                    credential.credential_type,

                credential_name:
                    credential.credential_name,

                document:
                    credential.document,

                status:
                    credential.status,

                uploaded_by:
                    credential.uploaded_by,

                createdAt:
                    credential.createdAt
            }
        });

    } catch (error) {

        // Delete uploaded file if database operation fails
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getCredentials = async (req, res) => {
    try {
        const { practitioner_id } = req.params;

        // Check practitioner exists
        const practitioner = await User.findById(practitioner_id);

        if (!practitioner) {
            return res.status(404).json({
                success: false,
                message: "Practitioner not found"
            });
        }

        // Get all credentials
        const credentials = await PractitionerCredential.find({
            practitioner_id: practitioner_id
        })
            .populate(
                "uploaded_by",
                "first_name middle_name last_name email"
            )
            .populate(
                "approved_by",
                "first_name middle_name last_name email"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Certificates fetched successfully",
            data: credentials
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const viewCredential = async (req, res) => {
    try {
        const { credential_id } = req.params;

        const credential = await PractitionerCredential.findById(
            credential_id
        )
            .populate(
                "practitioner_id",
                "first_name middle_name last_name email mobile"
            )
            .populate(
                "uploaded_by",
                "first_name middle_name last_name email"
            )
            .populate(
                "approved_by",
                "first_name middle_name last_name email"
            );

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: "Credential not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Credential details fetched successfully",
            data: {
                id: credential._id,

                practitioner: credential.practitioner_id,

                kind: credential.kind,

                credential_name: credential.credential_name,

                issuer: credential.issuer,

                issued_at: credential.issued_at,

                supporting_document: credential.document,

                exclude_from_search:
                    credential.exclude_from_search,

                status: credential.status,

                uploaded_by: credential.uploaded_by,

                approved_by: credential.approved_by,

                approved_at: credential.approved_at,

                createdAt: credential.createdAt,
                updatedAt: credential.updatedAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateAndApproveCredential = async (req, res) => {
    try {
        // Only Super Admin can approve credentials
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can approve credentials"
            });
        }

        const { credential_id } = req.params;

        const {
            credential_type,
            credential_name,
            issuer,
            issued_at,
            exclude_from_search
        } = req.body;

        // Find credential
        const credential = await PractitionerCredential.findById(
            credential_id
        );

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: "Credential not found"
            });
        }

        // Validate required fields
        if (!credential_type || !credential_name) {
            return res.status(400).json({
                success: false,
                message: "Kind and credential name are required"
            });
        }

        // Update credential information
        credential.credential_type = credential_type;
        credential.credential_name = credential_name;
        credential.issuer = issuer || "";
        credential.issued_at = issued_at || null;
        credential.exclude_from_search =
            exclude_from_search === true ||
            exclude_from_search === "true";

        // Approve credential
        credential.status = "approved";
        credential.approved_by = req.user.id;
        credential.approved_at = new Date();

        await credential.save();

        // Get updated data with user details
        const updatedCredential =
            await PractitionerCredential.findById(credential._id)
                .populate(
                    "practitioner_id",
                    "first_name middle_name last_name email mobile"
                )
                .populate(
                    "uploaded_by",
                    "first_name middle_name last_name email"
                )
                .populate(
                    "approved_by",
                    "first_name middle_name last_name email"
                );

        return res.status(200).json({
            success: true,
            message: "Credential updated and approved successfully",
            data: updatedCredential
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const rejectCredential = async (req, res) => {
    try {
        // Only Super Admin can reject credentials
        if (req.user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can reject credentials"
            });
        }

        const { credential_id } = req.params;
        const { rejection_reason } = req.body;

        // Find credential
        const credential =
            await PractitionerCredential.findById(credential_id);

        if (!credential) {
            return res.status(404).json({
                success: false,
                message: "Credential not found"
            });
        }

        // Optional: reason required
        if (!rejection_reason || !rejection_reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        // Update rejection details
        credential.status = "rejected";
        credential.rejected_by = req.user.id;
        credential.rejected_at = new Date();
        credential.rejection_reason = rejection_reason.trim();

        // Clear approval details if previously present
        credential.approved_by = null;
        credential.approved_at = null;

        await credential.save();

        // Fetch updated credential
        const updatedCredential =
            await PractitionerCredential.findById(credential._id)
                .populate(
                    "practitioner_id",
                    "first_name middle_name last_name email mobile"
                )
                .populate(
                    "uploaded_by",
                    "first_name middle_name last_name email"
                )
                .populate(
                    "rejected_by",
                    "first_name middle_name last_name email"
                );

        return res.status(200).json({
            success: true,
            message: "Credential rejected successfully",
            data: updatedCredential
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
    rejectCredential,
      login,
      addAdmin,
      addUser,
      listUsers,
      listUsers1,
      approveAdminRequest,
      getAdminRequests,
      rejectAdminRequest,
      deactivateAdmin,
      markAdminRequestAsRead,
      editAdmin,
      activateAdmin,
      getUserDetails,
      updatePractitionerUrl,
      savePractitioner,
      addCredential,
      uploadCredential,
      getCredentials,
      viewCredential,
      updateAndApproveCredential
};