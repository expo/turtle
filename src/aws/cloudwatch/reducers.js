export function sum(metrics) {
  const reduced = metrics.reduce((acc, i) => {
    let result = acc;
    if (!result) {
      result = i;
    } else {
      result.Value += i.Value;
    }
    return result;
  }, null);
  return [reduced];
}

export function avg(metrics) {
  if (!metrics.length) {
    return [];
  }

  const avgVal = sum(metrics) / metrics.length;
  return [avgVal];
}
