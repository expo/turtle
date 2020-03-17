"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
exports.TYPE_DIMENSIONS = (type) => [
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'type', Value: type },
    ],
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'type', Value: type },
        { Name: 'host', Value: config_1.default.hostname },
    ],
];
exports.PRIORITY_DIMENSIONS = (type, priority) => [
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'priority', Value: priority },
    ],
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'type', Value: type },
    ],
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'type', Value: type },
        { Name: 'priority', Value: priority },
    ],
    [
        { Name: 'env', Value: config_1.default.deploymentEnv },
        { Name: 'platform', Value: config_1.default.platform },
        { Name: 'type', Value: type },
        { Name: 'host', Value: config_1.default.hostname },
    ],
];
//# sourceMappingURL=dimensions.js.map