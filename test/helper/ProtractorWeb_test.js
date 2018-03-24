const TestHelper = require('../support/TestHelper');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const fileExists = require('../../lib/utils').fileExists;
const Protractor = require('../../lib/helper/Protractor');
const AssertionFailedError = require('../../lib/assert/error');
const webApiTests = require('./webapi');

let I;
let browser;
const should = require('chai').should();

const siteUrl = TestHelper.siteUrl();
const formContents = require('../../lib/utils').test.submittedData(path.join(__dirname, '/../data/app/db'));

describe('Protractor-NonAngular', function () {
  this.retries(3);
  this.timeout(35000);

  before(() => {
    global.codecept_dir = path.join(__dirname, '/../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {
      // continue regardless of error
    }

    I = new Protractor({
      url: siteUrl,
      browser: 'chrome',
      windowSize: '500x700',
      angular: false,
      restart: false,
      seleniumAddress: TestHelper.seleniumAddress(),
      waitForTimeout: 5000,
      capabilities: {
        loggingPrefs: {
          driver: 'INFO',
          browser: 'INFO',
        },
        chromeOptions: {
          args: ['--window-size=1280,1024'],
        },
      },
    });
    return I._init().then(() => I._beforeSuite().then(() => {
      browser = I.browser;
    }));
  });

  beforeEach(() => {
    webApiTests.init({
      I,
      siteUrl,
    });
    return I._before();
  });

  after(() => I._after());

  webApiTests.tests();

  describe('SmartWait', () => {
    before(() => I.options.smartWait = 3000);
    after(() => I.options.smartWait = 0);

    it('should wait for element to appear', () => I.amOnPage('/form/wait_element')
      .then(() => I.dontSeeElement('h1'))
      .then(() => I.seeElement('h1')));

    it('should wait for clickable element appear', () => I.amOnPage('/form/wait_clickable')
      .then(() => I.dontSeeElement('#click'))
      .then(() => I.click('#click'))
      .then(() => I.see('Hi!')));

    it('should wait for clickable context to appear', () => I.amOnPage('/form/wait_clickable')
      .then(() => I.dontSeeElement('#linkContext'))
      .then(() => I.click('Hello world', '#linkContext'))
      .then(() => I.see('Hi!')));

    it('should wait for text context to appear', () => I.amOnPage('/form/wait_clickable')
      .then(() => I.dontSee('Hello world'))
      .then(() => I.see('Hello world', '#linkContext')));
  });

  describe('#grabBrowserLogs', () => {
    it('should grab browser logs', () => I.amOnPage('/')
      .then(() => I.executeScript(() => {
        console.log('Test log entry');
      }))
      .then(() => I.grabBrowserLogs())
      .then((logs) => {
        const matchingLogs = logs.filter(log => log.message.indexOf('Test log entry') > -1);
        assert.equal(matchingLogs.length, 1);
      }));

    it('should grab browser logs across pages', () => I.amOnPage('/')
      .then(() => I.executeScript(() => {
        console.log('Test log entry 1');
      }))
      .then(() => I.openNewTab())
      .then(() => I.amOnPage('/info'))
      .then(() => I.executeScript(() => {
        console.log('Test log entry 2');
      }))
      .then(() => I.grabBrowserLogs())
      .then((logs) => {
        const matchingLogs = logs.filter(log => log.message.indexOf('Test log entry') > -1);
        assert.equal(matchingLogs.length, 2);
      }));
  });

  describe('#_locateClickable', () => {
    it('should locate a button to click', async () => {
      await I.amOnPage('/form/checkbox');
      const els = await I._locateClickable('Submit');
      assert.equal(els == null, false);
    });

    it('should not locate a non-existing checkbox using _locateClickable', async () => {
      await I.amOnPage('/form/checkbox');
      try {
        const els = await I._locateClickable('I disagree');
        throw Error('Should not get this far');
      } catch (e) {
        e.message.should.include = 'No element found using locator:';
      }
    });
  });

  describe('#_locateCheckable', () => {
    it('should locate a checkbox', async () => {
      await I.amOnPage('/form/checkbox');
      const els = await I._locateCheckable('I Agree');
      assert.equal(els == null, false);
    });

    it('should not locate a non-existing checkbox', async () => {
      await I.amOnPage('/form/checkbox');
      try {
        const els = await I._locateCheckable('I Agree');
        throw Error('Should not get this far');
      } catch (e) {
        e.message.should.include = 'No element found using locator:';
      }
    });
  });

  describe('#_locateFields', () => {
    it('should locate a field', async () => {
      await I.amOnPage('/form/field');
      const els = await I._locateFields('Name');
      assert.equal(els == null, false);
    });

    it('should not locate a non-existing field', async () => {
      await I.amOnPage('/form/field');
      try {
        const els = await I._locateFields('Mother-in-law');
        throw Error('Should not get this far');
      } catch (e) {
        e.message.should.include = 'No element found using locator:';
      }
    });
  });
});
