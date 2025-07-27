"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const MONGO_URL = index_1.default.db.mongoURL || '';
mongoose_1.default.connect(MONGO_URL, {
    bufferCommands: false,
}).catch(console.error);
const db = mongoose_1.default.connection;
exports.default = db;
