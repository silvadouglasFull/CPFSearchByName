"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugifyName = slugifyName;
function slugifyName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
