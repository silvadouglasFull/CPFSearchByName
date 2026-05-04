"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonResultsRepository = void 0;
const constants_1 = require("../../filterByCpf/domain/constants");
const fs_1 = __importDefault(require("fs"));
class JsonResultsRepository {
    constructor(filePath) {
        this.filePath = filePath;
    }
    getAll() {
        const content = fs_1.default.readFileSync(this.filePath, constants_1.FILE_ENCODING_UTF8);
        return JSON.parse(content);
    }
}
exports.JsonResultsRepository = JsonResultsRepository;
