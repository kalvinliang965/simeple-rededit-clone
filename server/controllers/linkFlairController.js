// linkflairController.js

const linkFlairUtils = require("../utils/linkFlairUtils");
const LinkFlair = require("../models/linkflairs");

async function getLinkFlairByID(req, res) {
    console.log("\n[INFO] getLinkFlairByID");
    try {
        const id = req.params.id;
        const linkFlair = await linkFlairUtils.findLinkFlairById(id, true);    
        res.json(linkFlair);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

async function getAllLinkFlairs(req, res) {
    console.log("\n[INFO] getAllLinkFlairs");
    try {
        const linkFlairs = await LinkFlair.find();
        res.json(linkFlairs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// given linkFlair content, we want to generate ID if it does not already exist
async function getLinkFlairIdByContent(req, res) {
    const { linkFlairContent } = req.query;
    console.log("[INFO] Recieved linkflair content: " + linkFlairContent);
    
    try {
        let linkFlair = await linkFlairUtils.findLinkFlairByContent(linkFlairContent);
        if (!linkFlair) {
            linkFlair = await linkFlairUtils.createLinkFlair({content: linkFlairContent});
        } 
        console.log(linkFlair);
        return res.status(200).json(linkFlair._id); 
    } catch (error) {
        res.status(500).json("Internel Server issue");
    }

}

module.exports = {
    getLinkFlairByID,
    getAllLinkFlairs,
    getLinkFlairIdByContent,
};
