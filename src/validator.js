import * as schemas from 'turtle/jobsSchemas';

export async function sanitizeJob(job) {
  const schema = schemas[job.platform];
  const { error, value } = schema.validate(job, { stripUnknown: true });
  if (error) {
    throw error;
  } else {
    return value;
  }
}
