// linkFlairRoutes.js

const express = require("express");
const router = express.Router();
const linkFlairController = require("../controllers/linkFlairController");


router.get("/content", linkFlairController.getLinkFlairIdByContent);

router.get('/:id', linkFlairController.getLinkFlairByID);

router.get("/", linkFlairController.getAllLinkFlairs);



module.exports = router;