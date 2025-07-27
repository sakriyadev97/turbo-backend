"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const turboRoutes_1 = __importDefault(require("./turboRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use(turboRoutes_1.default);
exports.default = router;
