const TestHelper = require('../support/TestHelper');

const Nightmare = require('../../lib/helper/Nightmare');

let I;
let browser;
const siteUrl = TestHelper.siteUrl();
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const AssertionFailedError = require('../../lib/assert/error');
require('co-mocha')(require('mocha'));
const webApiTests = require('./webapi');

describe('Nightmare', function () {
  this.retries(3);
  this.timeout(35000);

  before(() => {
    global.codecept_dir = path.join(__dirname, '/../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {
      // continue regardless of error
    }

    I = new Nightmare({
      url: siteUrl,
      windowSize: '500x700',
      show: false,
      waitForTimeout: 5000,
    });
    I._init();
    return I._beforeSuite();
  });

  beforeEach(() => {
    webApiTests.init({ I, siteUrl });
    return I._before().then(() => browser = I.browser);
  });

  afterEach(() => I._after());

  webApiTests.tests();

  describe('scripts Inject', () => {
    it('should reinject scripts after navigating to new page', () => I.amOnPage('/')
      .then(() => I.click("//div[@id='area1']/a"))
      .then(() => I.waitForVisible("//input[@id='avatar']")));
  });

  describe('#locate', () => {
    it('should use locate to check element', () => {
      const attribute = 'qa-id';
      return I.amOnPage('/')
        .then(() => I._locate({
          css: '.notice',
        }).then((els) => {
          // we received an array with IDs of matched elements
          // now let's execute client-side script to get attribute for the first element
          assert.ok(!!els.length);
          return browser.evaluate((el, attribute) => window.codeceptjs.fetchElement(el).getAttribute(attribute), els[0], attribute);
        }).then((attributeValue) => {
          // get attribute value and back to server side
          // execute an assertion
          assert.equal(attributeValue, 'test');
        }));
    });
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
