"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const turboRoutes_1 = __importDefault(require("./turboRoutes"));
const pendingOrderRoutes_1 = __importDefault(require("./pendingOrderRoutes"));
const emailRoutes_1 = __importDefault(require("./emailRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use(turboRoutes_1.default);
router.use(pendingOrderRoutes_1.default);
router.use('/email', emailRoutes_1.default);
exports.default = router;
