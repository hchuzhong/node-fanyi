#!/usr/bin/env node
import * as commander from 'commander'
const program = new commander.Command();
import { translate } from './main';

program.version('0.0.1')
    .name('fy')
    .usage('<english>')
    .arguments('<english>')
    .action(function (english) {
        translate(english);
    })
    ;
program.parse(process.argv);