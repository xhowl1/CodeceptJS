const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;

const runner = path.join(__dirname, '/../../bin/codecept.js');
// eslint-disable-next-line camelcase
const codecept_dir = path.join(__dirname, '/../data/sandbox');

describe('list/def commands', () => {
  it('list should print actions', (done) => {
    // eslint-disable-next-line camelcase
    exec(`${runner} list ${codecept_dir}`, (err, stdout) => {
      stdout.should.include('FileSystem'); // helper name
      stdout.should.include('FileSystem I.amInPath(openPath)'); // action name
      stdout.should.include('FileSystem I.seeFile(name)');
      assert(!err);
      done();
    });
  });

  it('def should create definition file', (done) => {
    try {
      // eslint-disable-next-line camelcase
      require('fs').unlinkSync(`${codecept_dir}/steps.d.ts`);
    } catch (e) {
      // continue regardless of error
    }
    // eslint-disable-next-line camelcase
    exec(`${runner} def ${codecept_dir}`, (err, stdout) => {
      stdout.should.include('Definitions were generated in steps.d.ts');
      stdout.should.include('<reference path="./steps.d.ts" />');
      // eslint-disable-next-line no-unused-expressions,camelcase
      require('fs').existsSync(`${codecept_dir}/steps.d.ts`).should.be.ok;
      assert(!err);
      done();
    });
  });

  it('def should create definition file given a config file', (done) => {
    try {
      // eslint-disable-next-line camelcase
      require('fs').unlinkSync(`${codecept_dir}/steps.d.ts`);
    } catch (e) {
      // continue regardless of error
    }
    // eslint-disable-next-line camelcase
    exec(`${runner} def --config ${codecept_dir}/codecept.ddt.json`, (err, stdout) => {
      stdout.should.include('Definitions were generated in steps.d.ts');
      stdout.should.include('<reference path="./steps.d.ts" />');
      // eslint-disable-next-line no-unused-expressions,camelcase
      require('fs').existsSync(`${codecept_dir}/steps.d.ts`).should.be.ok;
      assert(!err);
      done();
    });
  });
});
