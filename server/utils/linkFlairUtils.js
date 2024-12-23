// linkFlairUtils.js

const mongoose = require("mongoose");
const LinkFlair = require("../models/linkflairs");
const mongoUtils = require("./mongoUtils.js");

// This module contains function to be use in linkflair controller

/**
 * Finds a link flair by ID.
 * @param {string} id - The ID of the link flair to find.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the link flair is not found.
 * @returns {Object|null} The found link flair, or null if not found.
 * @throws Will throw an error if the ID is invalid or if the link flair is not found and throwOnNotFound is true.
 */
async function findLinkFlairById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing findLinkFlairById`);
    try {
        const linkFlair = await mongoUtils.findById(LinkFlair, id, throwOnNotFound);
        return linkFlair;
    } catch (error) {
        console.error(`[ERROR] Failed to find linkFlair with id: ${id}`);
        throw error;
    }
}


/**
 * Finds a link flair by its content.
 * @param {string} content - The content of the link flair to find.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the link flair is not found.
 * @returns {Object|null} The found link flair, or null if not found.
 * @throws Will throw an error if the link flair is not found and throwOnNotFound is true.
 */
async function findLinkFlairByContent(content, throwOnNotFound = false) {
    console.log(`[INFO] Executing findLinkFlairByContent`);
    console.log(`[INFO] Searching LinkFlair with content: "${content}"`);
    
    try {
        const linkFlair = await LinkFlair.findOne({content: content});
        
        if (!linkFlair) {
            console.log(`[INFO] LinkFlair not found for content: "${content}"`);
            if (throwOnNotFound) {
                throw new Error("linkFlair not found");
            }
        } else {
            console.log(`[INFO] LinkFlair found for content: "${content}"`);
        }
        return linkFlair
    } catch (error) {
        console.error(`[ERROR] Failed to find LinkFlair with content: "${content}"`);
        throw error;
    }
}

/**
 * Creates a new link flair.
 * @param {Object} linkFlairObj - The data for the new link flair.
 * @returns {Object} The created link flair.
 * @throws Will throw an error if the creation fails.
 */
async function createLinkFlair(linkFlairObj) {
    console.log(`[INFO] Executing createLinkFlair`);
    try {
        const linkFlair = await mongoUtils.createDocument(LinkFlair, linkFlairObj);
        console.log(`[INFO] createLinkFlair success`);
        return linkFlair;
    } catch (error) {
        console.error(`[ERROR] Failed to create new linkFlair: `, error);
        throw error;
    }
}

/**
 * Deletes a link flair by ID.
 * @param {string} id - The ID of the link flair to delete.
 * @param {boolean} [throwOnNotFound=false] - Whether to throw an error if the link flair is not found.
 * @returns {Object|null} The deleted link flair, or null if not found.
 * @throws Will throw an error if the deletion fails.
 */
async function deleteLinkFlairById(id, throwOnNotFound = false) {
    console.log(`[INFO] Executing deleteLinkFlair`);
    try {
        const linkFlair = await mongoUtils.deleteById(LinkFlair, id, throwOnNotFound);
        return linkFlair;
    } catch (error) {
        console.error(`[ERROR] Failed to delete linkFlair with ID: ${id}`, error);
        throw error;
    }
}


module.exports = {
    findLinkFlairById,
    findLinkFlairByContent,
    createLinkFlair,
    deleteLinkFlairById,
};