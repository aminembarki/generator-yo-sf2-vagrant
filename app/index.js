'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var yaml = require('js-yaml');
var fs = require('fs');

var YoSf2VagrantGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },


  askSymfonyStandard: function () {
    var done = this.async();
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the magnificent YoSf2Vagrant generator!'
    ));

    this.SymfonyStandardDistribution = {
      username: 'symfony',
      repository: 'symfony-standard',
      commit: '2.6'
    };

    var prompts = [{
      type: 'confirm',
      name: 'symfonyStandard',
      message: 'Would you like to use the Symfony "Standard Edition" distribution ' + this.SymfonyStandardDistribution.commit,
      default: true
    }];

    this.prompt(prompts, function(answers) {

      if (answers.symfonyStandard) {
        this.symfonyDistribution = this.SymfonyStandardDistribution;
      } else {
        this.symfonyDistribution = null;
      }

      done();
    }.bind(this));
  },

  askSymfonyCustom: function () {
    if (this.symfonyDistribution === null) {
      var done = this.async();

      console.log('Please provide GitHub details of the Symfony distribution you would like to use.');
      console.log('e.g. http://github.com/symfony/symfony-standard/tree/[commit].');

      var prompts = [{
        type: 'list',
        name: 'symfonyCommit',
        message: 'Commit (commit/branch/tag)',
        default: '2.6',
        choices: ['2.3', '2.5', '2.6']
      }];

      this.prompt(prompts, function(answers) {

        var repo = 'https://github.com/' + 'symfony' + '/' + 'symfony-standard' + '/tree/' + answers.symfonyCommit;
        console.log('Thanks! I\'ll use ' + repo);
        console.log('');

        this.symfonyDistribution = {
          username: 'symfony',
          repository: 'symfony-standard',
          commit: answers.symfonyCommit
        };

        done();
      }.bind(this));
    }
  },


  askVagrant: function () {
    var done = this.async();

    this.VagrantTemplate = {
      username: 'aminembarki',
      repository: 'puphpet-vagrant',
      commit: '0.1.2'
    };

    var prompts = [{
      type: 'confirm',
      name: 'hasVagrant',
      message: 'Would you like to use vagrant to build your web development environment ',
      default: true
    }];

    this.prompt(prompts, function(answers) {

      if (answers.hasVagrant) {
        this.VagrantRepo = this.VagrantTemplate;
      } else {
        this.VagrantRepo = null;
      }

      done();
    }.bind(this));
  },


  askVagrantCustom: function () {
    if (this.VagrantRepo !== null) {
      var done = this.async();



      var prompts = [{
          type: 'String',
          name: 'host',
          default: 'domain.dev',
          message: 'Please provide Vagrant host:'
        },
        {
          type: 'String',
          name: 'database_name',
          default: 'dbname',
          message: 'Please provide MySql database name:'
        },
        {
          type: 'String',
          name: 'database_user',
          default: 'dbuser',
          message: 'Please provide MySql database user:'
        }
        ,
        {
          type: 'String',
          name: 'database_password',
          default: '123',
          message: 'Please provide MySql database password:'
        }

      ];

      this.prompt(prompts, function(answers) {


        this.VagrantConfig = {
          host: answers.host,
          database_name: answers.database_name,
          database_user: answers.database_user,
          database_password: answers.database_password
        };

        done();
      }.bind(this));
    }
  },

  askGulpCustom: function() {

      var done = this.async();

      var prompts = [{
        type: 'checkbox',
        name: 'gulpCustom',
        message: 'Customize Gulpfile',
        choices: [
          {
            name: 'gulp-ruby-sass',
            value: 'gulpRubySass',
            checked: true
          },
          {
            name: 'gulp-copy',
            value: 'gulpCopy',
            checked: false
          },
          {
            name: 'gulp-concat',
            value: 'gulpConcat',
            checked: false
          }
        ]
      }];

      this.prompt(prompts, function (answers) {
        function hasFeature(feat) {
          return answers.gulpCustom.indexOf(feat) !== -1;
        }

        this.gulpRubySass = hasFeature('gulpRubySass');
        this.gulpCopy = hasFeature('gulpCopy');
        this.gulpConcat = hasFeature('gulpConcat');

        done();
      }.bind(this));

  },

  askBowerStandard: function() {
    var done = this.async();

    var prompts = [{
      type: 'confirm',
      name: 'bowerStandard',
      message: 'Would you like to use "BootStrap 3.3"?',
      default: true
    }];

    this.prompt(prompts, function (answers) {
      this.bowerStandard = answers.bowerStandard;
      done();
    }.bind(this));
  },

  symfonyBase: function() {
    var done = this.async();
    var appPath = this.destinationRoot();

    this.remote(
      this.symfonyDistribution.username,
      this.symfonyDistribution.repository,
      this.symfonyDistribution.commit,
      function (err, remote) {
        if (err) {
          return done(err);
        }
        remote.directory('.', path.join(appPath, '.'));
        done();
      }
    );
  },

  vagrantBase: function() {
    if (this.VagrantRepo !== null) {
      var done = this.async();
      var appPath = this.destinationRoot();

      this.remote(
        this.VagrantTemplate.username,
        this.VagrantTemplate.repository,
        this.VagrantTemplate.commit,
        function (err, remote) {
          if (err) {
            return done(err);
          }
          remote.directory('.', path.join(appPath, '.'));
          done();
        }
      );
    }
  },
  askbundle: function() {
    var done = this.async();

    var prompts = [{
      type: 'checkbox',
      name: 'addBundle',
      message: 'Which bundle would you like to use?',
      choices: [
        {
          name: 'DoctrineFixturesBundle',
          value: 'fixturebundle',
          checked: true
        },
        {
          name: 'DoctrineMigrationsBundle',
          value: 'migrationbundle',
          checked: false
        },
        {
          name: 'DoctrineMongoDBBundle',
          value: 'mongoDBbundle',
          checked: false
        }
      ]

    }];

    this.prompt(prompts, function(answers){
      function hasFeature(feat){
        return answers.addBundle.indexOf(feat) !== -1;
      }

      this.fixturebundle = hasFeature('fixturebundle');
      this.migrationbundle = hasFeature('migrationbundle');
      this.mongoDBbundle = hasFeature('mongoDBbundle');
      done();
    }.bind(this));

  },


  writing: {
    app: function () {
      this.template('_Gulpfile.js', 'Gulpfile.js');
      this.fs.copy(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('_bowerrc'),
        this.destinationPath('.bowerrc')
      );
      this.template('_bower.json', 'bower.json');
      this.template('_package.json', 'package.json');
      this.template('_config.yaml', './puphpet/config.yaml');
      this.template('_parameters.yml.dist', './app/config/parameters.yml.dist');
      this.template('_Vagrantfile', 'Vagrantfile');
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('_config.rb'),
        this.destinationPath('config.rb')
      );
      this.fs.copy(
        this.templatePath('_gitattributes'),
        this.destinationPath('.gitattributes')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  },

  end: {

    cleanComposer: function () {
      var done = this.async();

      var composerContents = this.readFileAsString('composer.json');
      var composerParse = JSON.parse(composerContents);
      delete composerParse.require['symfony/assetic-bundle'];
      var data = JSON.stringify(composerParse, null, 4);
      fs.writeFileSync('composer.json', data);

      done();
    },

    cleanConfig: function () {
      var done = this.async();

      var confDev = yaml.safeLoad(fs.readFileSync('app/config/config_dev.yml'));
      delete confDev.assetic;
      var newConfDev = yaml.dump(confDev, {indent: 4});
      fs.writeFileSync('app/config/config_dev.yml', newConfDev);

      var conf = yaml.safeLoad(fs.readFileSync('app/config/config.yml'));
      delete conf.assetic;
      var newConf = yaml.dump(conf, {indent: 4});
      fs.writeFileSync('app/config/config.yml', newConf);

      done();
    },

    updateAppKernel: function () {
      console.log('This will add the custom bundles to Symfony\'s AppKernel');
      var appKernelPath = 'app/AppKernel.php';
      var appKernelContents = this.readFileAsString(appKernelPath);

      var newAppKernelContents = appKernelContents.replace('new Symfony\\Bundle\\AsseticBundle\\AsseticBundle(),', '');
      fs.writeFileSync(appKernelPath, newAppKernelContents);
    },

    addBundleComposer: function(){
      if (this.fixturebundle) {
        this.spawnCommand('composer', ['require', 'doctrine/doctrine-fixtures-bundle', '--no-update']);
      }
      if (this.migrationbundle) {
        this.spawnCommand('composer', ['require', 'doctrine/migrations', '@dev',  '--no-update']);
        this.spawnCommand('composer', ['require', 'doctrine/doctrine-migrations-bundle', '@dev',  '--no-update']);
      }
      if (this.mongoDBbundle) {
        this.spawnCommand('composer', ['require', 'doctrine/mongodb-odm', '@dev', '--no-update']);
        this.spawnCommand('composer', ['require', 'doctrine/mongodb-odm-bundle', '@dev', '--no-update']);
      }

      this.spawnCommand('composer', ['install']);
    }
  }
});

module.exports = YoSf2VagrantGenerator;
