"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator = __importStar(require("../validator"));
const testValidator = (fixturePath) => {
    const data = require(fixturePath);
    expect(() => validator.sanitizeJob(data)).not.toThrow();
};
test('Passes valid manifest for Android', () => {
    testValidator('turtle/__tests__/fixtures/androidJob.json');
});
test('Passes valid manifest for ios', () => {
    testValidator('turtle/__tests__/fixtures/iosJob.json');
});
//# sourceMappingURL=validator.test.js.map