const Client = require("../models/Client");

const listClients = async (req, res) => {
    try {

        const clients = await Client.find({
            practitioner_id: req.user.id
        }).sort({
            createdAt: -1
        });


        return res.status(200).json({
            success: true,
            message: "Clients fetched successfully",
            data: clients
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// Add Client
const addClient = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            email,
            phone
        } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "First name and last name are required"
            });
        }

        const client = await Client.create({
            practitioner_id: req.user.id,
            first_name,
            last_name,
            email,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Client created successfully",
            data: client
        })
        
        
        
        
        
        
    }catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const updateClient = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            first_name,
            middle_name,
            last_name,
            email,
            mobile,
            date_of_birth,
            gender,
            address,
            city,
            state,
            country,
            postal_code,
            notes,
            status
        } = req.body;


        const client = await Client.findOneAndUpdate(
            {
                _id: id,
                practitioner_id: req.user.id
            },
            {
                first_name,
                middle_name,
                last_name,
                email,
                mobile,
                date_of_birth,
                gender,
                address,
                city,
                state,
                country,
                postal_code,
                notes,
                status
            },
            {
                new: true,
                runValidators: true
            }
        );


        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Client updated successfully",
            data: client
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
module.exports = {
    addClient,
    listClients,
    updateClient
};