// middleware.js

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require('path');

const session_addr = "mongodb://127.0.0.1:27017/session";
const sessionStore = MongoStore.create({ mongoUrl: session_addr });

function registerGlobalMiddleware(app) {
    console.log(`[INFO] Registering global middleware`)
    
    const minute = 60 * 1000;

    // Serve the images directory as static files
    app.use('/images', express.static(path.join(__dirname, '../images')));

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use((req, res, next) => {
        console.log(`[INFO] Session middleware start: ${new Date().toISOString()}`);
        console.log(`[INFO] Incoming request: ${req.method} ${req.url}`);
        next();
    });
    app.use(session({
        secret: "do work!!",
        cookie: { 
            httpOnly: true, 
            maxAge: 60 * minute, // an hour
            sameSite: "lax" 
        },
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
    }));
    app.use((req, res, next) => {
        console.log(`[INFO] Session middleware end: ${new Date().toISOString()}`);
        next();
    });
}

module.exports = { registerGlobalMiddleware, sessionStore };