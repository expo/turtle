import { EXTRA_DIMENSIONS, GROUP_HASH } from 'turtle/aws/cloudwatch/constants';

export interface Metric {
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
  [EXTRA_DIMENSIONS]: any,
  [GROUP_HASH]: string,
}

export type MetricWithStats = {
  StatisticValues: {
    Maximum: number;
    Minimum: number;
    SampleCount: number;
    Sum: number;
  }
} & Metric;

export interface MetricData {
  name: string;
  value: number;
  success?: boolean;
  explicitName?: boolean;
  extraDimensions?: any;
}

export interface MetricConfiguration {
  unit: string;
  statistics?: boolean;
  reducer?: any;
  addEmpty?: boolean;
  dimensions?: any;
};

export type MetricRegistrationObject = { metricName: string, explicitName?: boolean } & MetricConfiguration;

export interface MetricsChunk {
  Namespace: string;
  MetricData: Array<Metric>;
};
