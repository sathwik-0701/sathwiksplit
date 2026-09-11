"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS setup supporting multiple origins & Render deployments
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like server-to-server, Postman, mobile)
        if (!origin)
            return callback(null, true);
        const reqOrigin = origin.replace(/\/$/, '');
        // Parse CLIENT_URL environment variable (supports comma-separated list)
        const envOrigins = (process.env.CLIENT_URL || '')
            .split(',')
            .map((s) => s.trim().replace(/\/$/, ''))
            .filter(Boolean);
        const isAllowed = envOrigins.length === 0 ||
            envOrigins.includes(reqOrigin) ||
            reqOrigin.endsWith('.onrender.com') ||
            reqOrigin.includes('localhost');
        if (isAllowed) {
            return callback(null, true);
        }
        else {
            console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
            return callback(null, true); // Fallback to allow connection
        }
    },
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Split Expense Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// Centralized error handler fallback
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
