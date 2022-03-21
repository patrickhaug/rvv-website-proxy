"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserDetectionService = void 0;
exports.BrowserDetectionService = {
    isIE11() {
        return !!window.msCrypto;
    },
};
