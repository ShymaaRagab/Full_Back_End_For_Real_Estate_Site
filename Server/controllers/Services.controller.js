const Service = require('../models/services.model');

module.exports = {

    addService : async (req, res) => {
        try {
            // Call the `serviceImageUpload` middleware to handle the file upload
            serviceImageUpload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
        
            try {
                const { name, price, description, serviceType } = req.body;
                const { filename } = req.file;
        
                // Create a new service object
                const newService = new Service({
                    name,
                    price,
                    img: filename,
                    description,
                    serviceType
                });
        
                // Save the service to the database
                const savedService = await newService.save();
        
                res.status(201).json(savedService);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    searchServices : async (req, res) => {
        try {
            const { serviceType } = req.query;

          // Find services that match the serviceType
            const services = await Service.find({ serviceType });

            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllServices: async (req, res) => {
        try {
            const services = await Service.find();
        
            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    
    updateService: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, description, serviceType } = req.body;

            const updatedService = await Service.findByIdAndUpdate(
                id,
                { name, price, description, serviceType },
                { new: true }
            );

            if (!updatedService) {
                return res.status(404).json({ message: 'Service not found' });
            }

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteService: async (req, res) => {
        try {
            const { id } = req.params;
        
            const deletedService = await Service.findByIdAndDelete(id);
        
            if (!deletedService) {
                return res.status(404).json({ message: 'Service not found' });
            }
        
            res.status(200).json({ message: 'Service deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getServiceById: async (req, res) => {
        try {
            const { id } = req.params;
        
            const service = await Service.findById(id);
        
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
        
            res.status(200).json(service);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};