#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const rcfile = require('rcfile');
const cwlog = require('chowa-log');
const packageJson = require('../package.json');
const { build, development, options } = require('../es');
const { configFileName } = require('../es/config');
const create = require('./create');

function loadCustomOptions() {
    let options = {};
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
        const createPath = path.resolve(process.cwd(), dir);

        create(createPath);
    });

program
    .command('build')
    .description('Build the project')
    .action(() => {
        build();
    });

program
    .command('dev')
    .description('Development')
    .action(() => {
        development();
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

program.parse(process.argv);
