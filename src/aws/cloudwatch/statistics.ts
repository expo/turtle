import { IMetric, MetricWithStats } from 'turtle/aws/cloudwatch/types';

export default function calculateStatistics(metrics: IMetric[]) {
  if (!metrics.length) {
    return [];
  }

  const reduced = metrics.reduce((acc: MetricWithStats | null, i: IMetric) => {
    let result = acc;
    if (!result) {
      result = Object.assign({}, i, {
        StatisticValues: {
          Maximum: -Infinity,
          Minimum: Infinity,
          SampleCount: 0,
          Sum: 0.0,
        },
        Value: undefined,
      });
    }

    result.StatisticValues.Maximum = Math.max(result.StatisticValues.Maximum, i.Value);
    result.StatisticValues.Minimum = Math.min(result.StatisticValues.Minimum, i.Value);
    result.StatisticValues.SampleCount += 1;
    result.StatisticValues.Sum += i.Value;
    return result;
  }, null);
  return [reduced];
}
