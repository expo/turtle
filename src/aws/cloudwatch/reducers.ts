import { IMetric } from 'turtle/aws/cloudwatch/types';

export function sum(metrics: IMetric[]) {
  if (metrics.length === 0) {
    return [];
  }
  const reduced = metrics.reduce((acc: IMetric | null, i: IMetric) => {
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

export function avg(metrics: IMetric[]) {
  if (!metrics.length) {
    return [];
  }

  const metric = sum(metrics)[0] as IMetric;
  metric.Value = metric.Value / metrics.length;
  return [metric];
}
