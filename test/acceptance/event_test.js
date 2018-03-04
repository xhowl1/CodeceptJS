/* global Feature BeforeSuite Before Scenario After AfterSuite */

const event = require('../../lib').event;
const assert = require('assert');
const expect = require('chai').expect;
const eventHandlers = require('../data/sandbox/eventHandlers');

eventHandlers.init();

const expectedEvents = [];

Feature('Events', { retries: 0 });

BeforeSuite(() => {
  expectedEvents.push(...[
    event.all.before,
    event.suite.before,
  ]);
  expect(eventHandlers.events).to.deep.equal(expectedEvents);
});

Before(() => {
  expectedEvents.push(...[
    event.test.before,
  ]);
  expect(eventHandlers.events).to.deep.equal(expectedEvents);
});

After(() => {
  expectedEvents.push(...[
    event.test.passed,
    // event.test.after, // Does not fire until after After()
  ]);
  expect(eventHandlers.events).to.deep.equal(expectedEvents);
});

AfterSuite(() => {
  expectedEvents.push(...[
    event.test.after,
    // event.suite.after, // Does not fire until after AfterSuite()
    // event.all.result, // Does not fire until after AfterSuite()
    // event.all.after, // Does not fire until after AfterSuite()
  ]);

  expect(eventHandlers.events).to.deep.equal(expectedEvents);

  expectedEvents.forEach((name) => {
    assert.equal(eventHandlers.counter[name], 1, `${name} should have been fired`);
  });
});

Scenario('Event Hooks @WebDriverIO @Protractor @Nightmare @Puppeteer', () => {
  expectedEvents.push(...[
    event.test.started,
  ]);
  expect(eventHandlers.events).to.deep.equal(expectedEvents);
  assert.ok(true);
});
