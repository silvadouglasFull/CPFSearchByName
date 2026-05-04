"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonGeneratedCpfWriter = void 0;
const constants_1 = require("../../generatorCpf/domain/constants");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class JsonGeneratedCpfWriter {
    constructor(outputFilePath = path_1.default.join(process.cwd(), constants_1.DEFAULT_OUTPUT_FILE_NAME)) {
        this.outputFilePath = outputFilePath;
    }
    save(records) {
        fs_1.default.writeFileSync(this.outputFilePath, JSON.stringify(records, null, constants_1.JSON_OUTPUT_INDENT_SPACES), constants_1.FILE_ENCODING_UTF8);
        return this.outputFilePath;
    }
}
exports.JsonGeneratedCpfWriter = JsonGeneratedCpfWriter;
