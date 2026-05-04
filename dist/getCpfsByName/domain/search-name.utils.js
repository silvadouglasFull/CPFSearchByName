"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchName = validateSearchName;
const errors_1 = require("../../getCpfsByName/domain/errors");
function validateSearchName(searchName) {
    if (!searchName.trim()) {
        throw new errors_1.InvalidSearchNameError();
    }
}
