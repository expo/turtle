import * as context from 'turtle/turtleContext';

test('Initially should not exit', () => {
  expect(context.checkShouldExit()).toBe(false);
});
