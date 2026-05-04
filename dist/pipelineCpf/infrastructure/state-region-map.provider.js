"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStateRegionMap = loadStateRegionMap;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadStateRegionMap() {
    const filePath = path_1.default.join(process.cwd(), 'identifyByState.json');
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}
