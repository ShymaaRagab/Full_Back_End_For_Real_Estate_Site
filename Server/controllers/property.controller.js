const propertyData = require("../models/property.model");
const userData = require('../models/user.model');
const { propertyImageUpload } = require('./multer.controller');
const createError = require("http-errors");
const mongoose = require("mongoose");

module.exports = {
  getAllProperties: async (req, res, next) => {
    try {
      //query  projection
      const result = await propertyData
      .find({ siteStatus: 'Approved'})
      .populate('owner', 'name email profileImage telephone');
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  },
  getAllPropertiesForSale: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 3; // Default to 3 properties per page if not provided
  
      const skip = (page - 1) * limit;
  
      const [properties, totalCount] = await Promise.all([
        propertyData
          .find({ siteStatus: 'Approved', status: "sale" })
          .populate("owner", "name email profileImage telephone")
          .skip(skip)
          .limit(limit),
        propertyData.countDocuments({ siteStatus: 'Approved' , status: "sale" }),
      ]);
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.send({
        properties,
        totalPages,
      });
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  },
  getAllPropertiesForRent: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 3; // Default to 3 properties per page if not provided
  
      const skip = (page - 1) * limit;
  
      const [properties, totalCount] = await Promise.all([
        propertyData
          .find({ siteStatus: 'Approved', status: "rent" })
          .populate("owner", "name email profileImage telephone")
          .skip(skip)
          .limit(limit),
        propertyData.countDocuments({ siteStatus: 'Approved', status: "rent" }),
      ]);
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.send({
        properties,
        totalPages,
      });
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  },

  getPropertyById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const property = await propertyData
        .findOne({ _id: id })
        .populate('owner', 'name email profileImage telephone');
      if (!property) {
        throw createError(404, "property not found");
      }
      res.send(property);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(error);
    }
  },
  addNewProperty: async (req, res, next) => {
    try {
      // Multer middleware to upload multiple images
      propertyImageUpload.fields([
        { name: 'images' },
        { name: 'video', maxCount: 1 }

      ])(req,res, async(err) =>{
        if (err) {
          console.log('Inside propertyImageUpload.fields middleware');
  console.log('req.files:', req.files);
          throw createError(404, "Error uploading files");
        }
        // Check if there are at least 5 images uploaded
        if (!req.files.images) {
          throw createError(400, "images are required");
        }
        // Save property details to the database
        const newProperty = new propertyData({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          location: req.body.location,
          address: req.body.address,
          images: req.files.images.map((file) => file.filename),
          video: req.files.video ? req.files.video[0].path : undefined,
          owner: req.user.id, // set owner to ID of currently authenticated user
          type: req.body.type,
          status: req.body.status,
          rooms: req.body.rooms,
          size: req.body.size,
          baths: req.body.baths
        });
        const result = await newProperty.save();
        const user = await userData.findById(req.user.id);
        user.telephone = req.body.telephone;
        await user.save();
        res.send(result);
      });
    } catch (error) {
      console.error(error);
      next(createError(400, error.message));
    }
  },

  deletePropertyById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await propertyData.findByIdAndDelete(id);
      if (!result) {
        throw createError(404, "property not found");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(error);
    }
  },

  updatePropertyById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const options = { new: true };

      const result = await propertyData.findByIdAndUpdate(id, updates, options);
      if (!result) {
        throw createError(404, "property does not exist");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(createError(400, error.message));
    }
  },

  approvePropertyById: async (req, res, next) => {
    try {
      const propertyId = req.params.id;
      const siteStatus = req.body;
      const options = { new: true };

      const result = await propertyData.findByIdAndUpdate(
        propertyId,
        siteStatus,
        options
      );
      if (!result) {
        throw createError(404, "property does not exist");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(createError(400, error.message));
    }
  },

  rejectPropertyById: async (req, res, next) => {
    try {
      const propertyId = req.params.id;
      const siteStatus = req.body;
      const options = { new: true };

      const result = await propertyData.findByIdAndUpdate(
        propertyId,
        siteStatus,
        options
      );
      if (!result) {
        throw createError(404, "property does not exist");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(createError(400, error.message));
    }
  },
  getAppending:async (req, res, next) => {
    try {
      //query  projection
      const result = await propertyData
      .find({ siteStatus: "Appending" })
      .populate('owner', 'name email profileImage telephone');;
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  },
  addFeaturedById: async (req, res, next) => {
    try {
      const propertyId = req.params.id;
      const isFeatured = req.body;
      const options = { new: true };

      const result = await propertyData.findByIdAndUpdate(
        propertyId,
        isFeatured,
        options
      );
      if (!result) {
        throw createError(404, "property does not exist");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, error.message));
        return;
      }
      next(createError(400, error.message));
    }
  },
  getFeatured:async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 3; // Default to 3 properties per page if not provided
  
      const skip = (page - 1) * limit;
  
      const [properties, totalCount] = await Promise.all([
        propertyData
          .find({ siteStatus: 'Approved', isFeatured : true })
          .populate("owner", "name email profileImage telephone")
          .skip(skip)
          .limit(limit),
        propertyData.countDocuments({ siteStatus: 'Approved', isFeatured : true }),
      ]);
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.send({
        properties,
        totalPages,
      });
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  }, 
  addPropertyLike : async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.propertyId;
  
        const user = await userData.findById(userId);
        if (!user) {
          throw createError(404, "user not found");
        }
  
        const property = await propertyData.findById(propertyId);
        if (!property) {
          throw createError(404, "property not found");
        }
  
        const isLiked = user.likedProperties.includes(propertyId);
  
        if (isLiked) {
            // User has already liked the property, so remove their like
            user.likedProperties.pull(propertyId);
            property.likes -= 1;
        } else {
            // User has not liked the property, so add their like
            user.likedProperties.push(propertyId);
            property.likes += 1;
        }
  
        await user.save();
        await property.save();
  
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        throw createError(400, error.message);
    }
  },
  searchProperties: async (req, res) => {
    const { type, status, location, minPrice, maxPrice, minSize, maxSize } = req.query;
    const filters = {};
  
    if (type) {
      filters.type = type;
    }
  
    if (status) {
      filters.status = status;
    }
  
    if (location) {
      filters.location = location;
    }
  
    if (minPrice && maxPrice) {
      filters.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      filters.price = { $gte: minPrice };
    } else if (maxPrice) {
      filters.price = { $lte: maxPrice };
    }
  
    if (minSize && maxSize) {
      filters.size = { $gte: minSize, $lte: maxSize };
    } else if (minSize) {
      filters.size = { $gte: minSize };
    } else if (maxSize) {
      filters.size = { $lte: maxSize };
    }
  
    try {
      const properties = await Property.find(filters)
        .populate('owner', 'name email profileImage telephone');
  
      res.status(200).json({ properties });
    } catch (error) {
      console.error(error);
      next(createError(400, error.message));
    }
  },
  getPropertiesByOwner : async (req, res) => {
    try {
      const ownerId = req.user.id; // Retrieve owner's ID from the token
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3;
  
      // Query the properties with the owner's ID
      const properties = await propertyData.find({ owner: ownerId })
        .skip((page - 1) * limit)
        .limit(limit);
  
      // Count the total number of properties for pagination
      const totalProperties = await   propertyData.countDocuments({ owner: ownerId });
  
      res.json({
        properties,
        totalPages: Math.ceil(totalProperties / limit),
      });
    } catch (error) {
      console.log(error);
      next(createError(400, error.message));
    }
  },
  getAllPropertiesByLocation: async (req, res, next) => {
    try {
      const { location } = req.params;
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 3; // Default to 3 properties per page if not provided
  
      const skip = (page - 1) * limit;
  
      const [properties, totalCount] = await Promise.all([
        propertyData
          .find({ location: location, siteStatus: 'Approved' })
          .populate("owner", "name email profileImage telephone")
          .skip(skip)
          .limit(limit),
        propertyData.countDocuments({ location: location, isiteStatus: 'Approved' }),
      ]);
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.send({
        properties,
        totalPages,
      });
    } catch (error) {
      console.log(error.message);
      next(createError(400, error.message));
    }
  },
  addLocation : async function (location) {
    try {
        const existingLocation = await this.findOne({ location });

        if (existingLocation) {
            throw new Error('Location already exists');
        }

        this.schema.path('location').enumValues.push(location);

        await this.init();
    } catch (error) {
      next(createError(400, error.message));
    }
},

addType : async function (location) {
  try {
      const existingType = await this.findOne({ type });

      if (existingType) {
          throw new Error('Type already exists');
      }

      this.schema.path('type').enumValues.push(type);

      await this.init();
  } catch (error) {
    next(createError(400, error.message));
  }
},
  
};
  