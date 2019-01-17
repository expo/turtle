import { EXTRA_DIMENSIONS, GROUP_HASH } from 'turtle/aws/cloudwatch/constants';

export interface IMetric {
  MetricName: string;
  Unit: string;
  Value: number;
  Timestamp: Date;
  StatisticValues?: {
    Maximum: number;
    Minimum: number;
    SampleCount: number;
    Sum: number;
  };
  [EXTRA_DIMENSIONS]: any;
  [GROUP_HASH]: string;
}

export type MetricWithStats = {
  StatisticValues: {
    Maximum: number;
    Minimum: number;
    SampleCount: number;
    Sum: number;
  },
} & IMetric;

export interface IMetricData {
  name: string;
  value: number;
  success?: boolean;
  explicitName?: boolean;
  extraDimensions?: any;
}

export interface IMetricConfiguration {
  unit: string;
  statistics?: boolean;
  reducer?: any;
  addEmpty?: boolean;
  dimensions?: any;
}

export type MetricRegistrationObject = { metricName: string, explicitName?: boolean } & IMetricConfiguration;

export interface IMetricsChunk {
  Namespace: string;
  MetricData: IMetric[];
}
