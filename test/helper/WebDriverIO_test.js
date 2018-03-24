const TestHelper = require('../support/TestHelper');

const WebDriverIO = require('../../lib/helper/WebDriverIO');

let wd;
const siteUrl = TestHelper.siteUrl();
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const fileExists = require('../../lib/utils').fileExists;
const webApiTests = require('./webapi');

describe('WebDriverIO', function () {
  this.retries(1);
  this.timeout(35000);

  before(() => {
    global.codecept_dir = path.join(__dirname, '/../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {
      // continue regardless of error
    }

    wd = new WebDriverIO({
      url: siteUrl,
      browser: 'chrome',
      windowSize: '500x700',
      smartWait: 0, // just to try
      host: TestHelper.seleniumHost(),
      port: TestHelper.seleniumPort(),
      waitForTimeout: 5000,
      desiredCapabilities: {
        chromeOptions: {
          args: ['--window-size=1280,1024'],
        },
      },
    });
  });

  beforeEach(() => {
    webApiTests.init({ I: wd, siteUrl });
    return wd._before();
  });

  afterEach(() => wd._after());

  // load common test suite
  webApiTests.tests();

  describe('#switchToNextTab, #switchToPreviousTab, #openNewTab, #closeCurrentTab, #closeOtherTabs, #grabNumberOfOpenTabs', () => {
    it('should only have 1 tab open when the browser starts and navigates to the first page', () => wd.amOnPage('/')
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 1)));

    it('should switch to next tab', () => wd.amOnPage('/info')
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 1))
      .then(() => wd.click('New tab'))
      .then(() => wd.switchToNextTab())
      .then(() => wd.waitInUrl('/login'))
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 2)));

    it('should assert when there is no ability to switch to next tab', () => wd.amOnPage('/')
      .then(() => wd.click('More info'))
      .then(() => wd.wait(1)) // Wait is required because the url is change by previous statement (maybe related to #914)
      .then(() => wd.switchToNextTab(2))
      .then(() => assert.equal(true, false, 'Throw an error if it gets this far (which it should not)!'))
      .catch((e) => {
        assert.equal(e.message, 'There is no ability to switch to next tab with offset 2');
      }));

    it('should close current tab', () => wd.amOnPage('/info')
      .then(() => wd.click('New tab'))
      .then(() => wd.switchToNextTab())
      .then(() => wd.seeInCurrentUrl('/login'))
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 2))
      .then(() => wd.closeCurrentTab())
      .then(() => wd.seeInCurrentUrl('/info'))
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 1)));

    it('should close other tabs', () => wd.amOnPage('/')
      .then(() => wd.openNewTab())
      .then(() => wd.seeInCurrentUrl('about:blank'))
      .then(() => wd.amOnPage('/info'))
      .then(() => wd.click('New tab'))
      .then(() => wd.switchToNextTab())
      .then(() => wd.seeInCurrentUrl('/login'))
      .then(() => wd.closeOtherTabs())
      .then(() => wd.seeInCurrentUrl('/login'))
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 1)));

    it('should open new tab', () => wd.amOnPage('/info')
      .then(() => wd.openNewTab())
      .then(() => wd.waitInUrl('about:blank'))
      .then(() => wd.grabNumberOfOpenTabs())
      .then(numPages => assert.equal(numPages, 2)));

    it('should switch to previous tab', () => wd.amOnPage('/info')
      .then(() => wd.openNewTab())
      .then(() => wd.waitInUrl('about:blank'))
      .then(() => wd.switchToPreviousTab())
      .then(() => wd.waitInUrl('/info')));

    it('should assert when there is no ability to switch to previous tab', () => wd.amOnPage('/info')
      .then(() => wd.openNewTab())
      .then(() => wd.waitInUrl('about:blank'))
      .then(() => wd.switchToPreviousTab(2))
      .then(() => wd.waitInUrl('/info'))
      .catch((e) => {
        assert.equal(e.message, 'There is no ability to switch to previous tab with offset 2');
      }));
  });

  describe('SmartWait', () => {
    before(() => wd.options.smartWait = 3000);
    after(() => wd.options.smartWait = 0);

    it('should wait for element to appear', () => wd.amOnPage('/form/wait_element')
      .then(() => wd.dontSeeElement('h1'))
      .then(() => wd.seeElement('h1')));

    it('should wait for clickable element appear', () => wd.amOnPage('/form/wait_clickable')
      .then(() => wd.dontSeeElement('#click'))
      .then(() => wd.click('#click'))
      .then(() => wd.see('Hi!')));

    it('should wait for clickable context to appear', () => wd.amOnPage('/form/wait_clickable')
      .then(() => wd.dontSeeElement('#linkContext'))
      .then(() => wd.click('Hello world', '#linkContext'))
      .then(() => wd.see('Hi!')));

    it('should wait for text context to appear', () => wd.amOnPage('/form/wait_clickable')
      .then(() => wd.dontSee('Hello world'))
      .then(() => wd.see('Hello world', '#linkContext')));

    it('should work with grabbers', () => wd.amOnPage('/form/wait_clickable')
      .then(() => wd.dontSee('Hello world'))
      .then(() => wd.grabAttributeFrom('#click', 'id'))
      .then(res => assert.equal(res, 'click')));
  });

  describe('#_locateClickable', () => {
    it('should locate a button to click', () => wd.amOnPage('/form/checkbox')
      .then(() => wd._locateClickable('Submit'))
      .then((res) => {
        res.length.should.be.equal(1);
      }));

    it('should not locate a non-existing checkbox', () => wd.amOnPage('/form/checkbox')
      .then(() => wd._locateClickable('I disagree'))
      .then(res => res.length.should.be.equal(0)));
  });

  describe('#_locateCheckable', () => {
    it('should locate a checkbox', () => wd.amOnPage('/form/checkbox')
      .then(() => wd._locateCheckable('I Agree'))
      .then(res => res.length.should.be.equal(1)));

    it('should not locate a non-existing checkbox', () => wd.amOnPage('/form/checkbox')
      .then(() => wd._locateCheckable('I disagree'))
      .then(res => res.length.should.be.equal(0)));
  });

  describe('#_locateFields', () => {
    it('should locate a field', () => wd.amOnPage('/form/field')
      .then(() => wd._locateFields('Name'))
      .then(res => res.length.should.be.equal(1)));

    it('should not locate a non-existing field', () => wd.amOnPage('/form/field')
      .then(() => wd._locateFields('Mother-in-law'))
      .then(res => res.length.should.be.equal(0)));
  });

  describe('#grabBrowserLogs', () => {
    it('should grab browser logs', () => wd.amOnPage('/')
      .then(() => wd.executeScript(() => {
        console.log('Test log entry');
      }))
      .then(() => wd.grabBrowserLogs())
      .then((logs) => {
        const matchingLogs = logs.filter(log => log.message.indexOf('Test log entry') > -1);
        assert.equal(matchingLogs.length, 1);
      }));

    it('should grab browser logs across pages', () => wd.amOnPage('/')
      .then(() => wd.executeScript(() => {
        console.log('Test log entry 1');
      }))
      .then(() => wd.openNewTab())
      .then(() => wd.amOnPage('/info'))
      .then(() => wd.executeScript(() => {
        console.log('Test log entry 2');
      }))
      .then(() => wd.grabBrowserLogs())
      .then((logs) => {
        const matchingLogs = logs.filter(log => log.message.indexOf('Test log entry') > -1);
        assert.equal(matchingLogs.length, 2);
      }));
  });
});
