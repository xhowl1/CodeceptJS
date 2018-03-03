const event = require('../../../lib').event;

const eventTypes = [
  // All Events
  event.all.before,
  event.all.result,
  event.all.after,

  // Suite events
  event.suite.before,
  event.suite.after,

  // Test events
  event.test.before,
  event.test.started,
  event.test.passed,
  event.test.failed,
  event.test.after,
];

let eventRecorder = [];
let eventTypeCounter = {};
const options = {
  logToConsole: false,
};

const newEventHandler = (name) => {
  event.dispatcher.on(name, () => {
    eventRecorder.push(name);
    eventTypeCounter[name] = (eventTypeCounter[name] || 0) + 1;
    if (options.logToConsole) {
      // eslint-disable-next-line no-console
      console.log(`Event:${name}`);
    }
  });
};


module.exports = {
  init: () => eventTypes.forEach(name => newEventHandler(name)),
  events: eventRecorder,
  counter: eventTypeCounter,
  clearEvents: () => {
    eventRecorder = [];
    eventTypeCounter = {};
  },
  setConsoleLogging: (on) => {
    options.logToConsole = !!on;
  },
};
