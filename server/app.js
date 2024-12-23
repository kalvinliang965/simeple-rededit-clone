// app.js

const express = require("express");
const { registerGlobalMiddleware, sessionStore } = require("./middleware");

const userRoutes = require("./routes/userRoutes.js");
const communityRoutes = require("./routes/communityRoutes");
const postRoutes = require("./routes/postRoutes.js");
const linkFlairRoutes = require("./routes/linkFlairRoutes.js");
const commentRoutes = require("./routes/commentRoutes.js");


const app = express();

registerGlobalMiddleware(app);

// prepend api to specify we are not toggling pages
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/linkflairs", linkFlairRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});

module.exports = { app, sessionStore };
