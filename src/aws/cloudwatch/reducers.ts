import { Metric } from 'turtle/aws/cloudwatch/types';

export function sum(metrics: Array<Metric>) {
  if (metrics.length === 0) {
    return [];
  }
  const reduced = metrics.reduce((acc: Metric | null, i: Metric) => {
    let result = acc;
    if (!result) {
      result = {...i};
    } else {
      result.Value += i.Value;
    }
    return result;
  }, null);
  return [reduced];
}

export function avg(metrics: Array<Metric>) {
  if (!metrics.length) {
    return [];
  }

  const metric = sum(metrics)[0] as Metric;
  metric.Value = metric.Value / metrics.length;
  return [metric];
}
