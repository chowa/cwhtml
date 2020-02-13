#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const rcfile = require('rcfile');
const cwlog = require('chowa-log');
const del = require('del');
const json2yaml = require('json2yaml');
const { execSync } = require('child_process');
const packageJson = require('../package.json');
const { build, development, options, utils } = require('../es');
const { configFileName } = require('../es/config');

function loadCustomOptions() {
    const configFilePath = path.join(process.cwd(), configFileName);

    if (utils.isFile(configFilePath)) {
        options.set(rcfile('cwhtml'));
    }
}

program.version(packageJson.version);

program
    .command('create <dir>')
    .description('Create cwhtml project')
    .action((dir) => {
        const createDir = path.resolve(process.cwd(), dir);

        const gitOpts = { cwd: createDir };

        try {
            execSync('git init', gitOpts);
            execSync('git remote add origin https://github.com/chowa/cwhtml-demo.git', gitOpts);
            execSync('git pull origin master', gitOpts);
            del.sync(path.join(createDir, '.git'));
        } catch (e) {
            cwlog.error('Please make sure the creation directory is empty');
            process.exit();
        }

        cwlog.info(`Generate a configuration file on ${configFileName}`);
        cwlog.warning('Configuration options detail on https://github.com/chowa/cwhtml#options');
        fs.writeFileSync(path.join(createDir, configFileName), json2yaml.stringify(options.all()));

        cwlog.success('Project created successfully');
    });

program
    .command('build')
    .description('Build the project')
    .action(() => {
        loadCustomOptions();
        build();
    });

program
    .command('dev')
    .description('Development')
    .action(() => {
        loadCustomOptions();
        development();
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

program.parse(process.argv);
