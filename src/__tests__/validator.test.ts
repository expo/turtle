import * as validator from 'turtle/validator';

const testValidator = (fixturePath: string) => {
  const data = require(fixturePath);
  expect(() => validator.sanitizeJob(data)).not.toThrow();
};

test('Passes valid manifest for Android', () => {
  testValidator('turtle/__tests__/fixtures/androidJob.json');
});

test('Passes valid manifest for ios', () => {
  testValidator('turtle/__tests__/fixtures/iosJob.json');
});
