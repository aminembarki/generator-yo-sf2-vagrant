/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('yo-sf2-vagrant:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompt({
        symfonyStandard: true,
        hasVagrant: true,
        host: 'domain.dev',
        database_name: 'dbname',
        database_user: 'dbuser',
        database_password: '123',
        gulpCustom: 'gulpRubySass',
        bowerStandard: true,
        addBundle: 'fixturebundle'
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'bower.json',
      'package.json',
      '.editorconfig',
      '.jshintrc'
    ]);
  });
});
