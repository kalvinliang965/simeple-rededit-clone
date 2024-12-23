// mongoUtils.js

const mongoose = require("mongoose");

// This module contains wrapper functions around MongoDB operations using Mongoose.


/**
 * Finds a document by ID in the database
 * @param {Object} model - Mongoose model to query 
 * @param {string} id - ObjectId of the document to find 
 * @param {boolean} [throwOnNotFound = false] - Whether to throw an error if the document is not found.
 * @returns {Object|null} The found document, or null if not found and throwOnNotFound is false.
 * @throws Will throw an error if the ID is invalid or if throwOnNotFound is true and the document is not found.
 */
async function findById(model, id, throwOnNotFound = false) {
    console.log("[INFO] findByID");
    console.log(`[INFO] Searching ${model.modelName} with ID: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error("[ERROR] Invalid id:", id);
        return res.status(400).json({ error: "Invalid id" });
    }

    // if not found, it will return null
    const document = await model.findById(id);

    // Handle the case where no document is found
    if (!document) {
        console.log(`[INFO] ${model.modelName} not found.`);
        if (throwOnNotFound) {
            throw new Error(`${model.modelName} not found`);
        }
    } else {
        console.log(`[INFO] ${model.modelName} found:`, document);    
    }
    
    return document;
}

/**
 * Creates a new document in the database.
 * @param {Object} model -Mongoose model to use for document creation.
 * @param {Object} data -Data for the new document.
 * @returns {Object}   The created document.
 * @throws Will throw an error if document creation fails
 */
async function createDocument(model, data) {
    console.log(`[INFO] Creating a new ${model.modelName}`);
    // console.log(`[INFO] Model is ${model}`);
    // console.log(`[INFO] Data is`, data);
    try {
        const newDocument = new model(data);
        const savedDocument = await newDocument.save();
        console.log(`[INFO] ${model.modelName} created successfully with ID: ${savedDocument._id}`);
        return savedDocument; 
    } catch (error) {
        console.error(`[ERROR] Failed to create ${model.modelName}:`, error);
        throw error;
    }
}



/**
 * Update an existing document in the database
 * @param {Object} model - Mongoose model to use for document update
 * @param {Object} id - ObjectId of the document
 * @param {Object} fieldsToUpdate - Field of the document to update.
 * @param {Object} options - Update options (e.g. {new: true, runValidators: true})
 * @param {boolean} [throwOnNotFound = false] - Whether to throw an error if the document is not found
 * @returns {Object|null} The updated document, or null if not found and throwOnNotFound is false.
 * @throws Will throw an error if the ID is invalid or if the update fails.
 */
async function updateById(model, id, fieldsToUpdate, options = { new: true, runValidators: true }, throwOnNotFound = false) {
    console.log(`[INFO] Updating ${model.modelName} with ID: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`[ERROR] Invalid ID format: ${id}`);
        throw new Error("Invalid ID format");
    }
    
    if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
        console.error("[ERROR] No fields to update provided.");
        throw new Error("No fields to update");
    }

    console.log(`[INFO] Fields to update ${JSON.stringify(fieldsToUpdate)}`);
    const update = { $set: fieldsToUpdate };

    try {
        const updatedDocument = await model.findByIdAndUpdate(id, update, options);
        if (!updatedDocument) {
            console.log(`[INFO] ${model.modelName} not found`);
            if (throwOnNotFound) {
                throw new Error(`${model.modelName} not found`);
            }

        } else {
            console.log(`[INFO] ${model.modelName} update successfully with ID: ${updatedDocument._id}`);
        }
        return updatedDocument;
    } catch (error) {
      console.error(`[ERROR] Failed to update ${model.modelName}: ${error}`);
      throw error;
    }
}

/**
 * Deletes a document by ID from the database.
 * @param {Object} model - Mongoose model to use for document deletion.
 * @param {Object} id - ObjectId of the document. 
 * @param {boolean} [throwOnNotFound = false] - Whether to throw an error if the document is not found
 * @returns {Object|null} The deleted document, or null if not found and throwOnNotFound is false.
 * @throws Will throw an error if the ID is invalid or if deletions fails. 
 */
async function deleteById(model, id, throwOnNotFound = false){
    console.log(`[INFO] Deleting ${model.modelName} with ID: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`[ERROR] Invalid ID format: ${id}`);
        throw new Error("Invalid ID format");
    }

    try {
      const deletedDocument = await model.findByIdAndDelete(id);
      if (!deletedDocument){
        console.log(`[INFO] ${model.modelName} not found.`);
        if (throwOnNotFound) {
            throw new Error(`${model.modelName} not found`);
        }
      } else {
        console.log(`[INFO] ${model.modelName} deleted successfully with ID: ${deletedDocument._id}`);
      }
      return deletedDocument;
    } catch (error) {
        console.error(`[ERROR] Failed to delete ${model.modelName}:`, error);
        throw error;
    }
};

module.exports = {
    findById,
    createDocument,
    updateById,
    deleteById,
}