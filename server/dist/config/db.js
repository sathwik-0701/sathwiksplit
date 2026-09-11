"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error('❌ MONGODB_URI environment variable is not defined in .env file.');
        return;
    }
    try {
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('👉 Make sure your IP is whitelisted on MongoDB Atlas (Network Access -> 0.0.0.0/0) and database credentials are correct.');
    }
};
exports.connectDB = connectDB;
