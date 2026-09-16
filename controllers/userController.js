const User = require("../models/User");

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, role ,  mobile ,  email, password } = req.body;

        const user = await User.create({
            first_name,
            last_name,
            role,
            mobile,
            email,
            password
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    getUsers
};