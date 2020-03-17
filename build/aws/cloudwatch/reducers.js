"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sum(metrics) {
    if (metrics.length === 0) {
        return [];
    }
    const reduced = metrics.reduce((acc, i) => {
        let result = acc;
        if (!result) {
            result = { ...i };
        }
        else {
            result.Value += i.Value;
        }
        return result;
    }, null);
    return [reduced];
}
exports.sum = sum;
function avg(metrics) {
    if (!metrics.length) {
        return [];
    }
    const metric = sum(metrics)[0];
    metric.Value = metric.Value / metrics.length;
    return [metric];
}
exports.avg = avg;
//# sourceMappingURL=reducers.js.map