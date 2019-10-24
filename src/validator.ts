import * as schemas from 'turtle/jobsSchemas';

export async function sanitizeJob(job: any) {
  const schema = (schemas as any)[job.platform];
  if (!schema) {
    throw new Error(`Unsupported platform: ${job.platform}`);
  }
  const { error, value } = schema.validate(job, { stripUnknown: true });
  if (error) {
    throw error;
  } else {
    return value;
  }
}
