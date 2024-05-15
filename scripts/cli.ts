#!/usr/bin/env node

/**
 * @date 10-09-2023
 * @author imshawan <github@imshawan.dev>
 * @description Restart Node Process Script
 *
 * This script is designed to stop the current Node process with a given process ID and start a new one based on the current environment.
*/

import path from "path";
import yargs, { alias } from "yargs";
import child_process from "child_process";
import os from "os";
import pkg from "../package.json";

yargs
    .scriptName(path.basename(__filename))
    .usage(`\n$0 <process_id> <node_env>`)
    .command({
        command: 'restart',
        describe: 'Restarts the Node process with the given process ID',
        builder: {
            pid: {
                alias: 'pid',
                describe: 'Process id',
                demandOption: true,
                type: 'string',
            },
            node_env: {
                alias: 'env',
                describe: 'Node environment, either development or production',
                demandOption: true,
                type: 'string',
            },
        },
        handler: function handler(argv) {
            const processId = argv.pid;
            const nodeEnv = argv.node_env;

            const platform = os.platform(), cwd = path.join(__dirname, '../../'),
                npmArgs = nodeEnv === 'development' ? ['npm', 'run', 'dev'] : ['npm', 'start'];

            let taskkillExecScript = platform === 'win32' ? 'taskkill' : 'kill',
                taskkillArgs = platform === 'win32' ? ['/F', '/PID', processId] : ['-9', processId],
                terminalCommand, args;

            const killProcess = child_process.spawn(taskkillExecScript, taskkillArgs);
            // required so the parent can exit
            killProcess.unref()

            if (platform === 'win32') {
                terminalCommand = 'cmd.exe';
                args = ['/c', 'start', ...npmArgs];

            } else if (platform === 'darwin') {
                terminalCommand = 'Terminal';
                args = ['-e', ...npmArgs];

            } else {
                // For Linux and other Unix-like systems
                terminalCommand = 'x-terminal-emulator';
                args = ['-e', ...npmArgs];
            }

            const child = child_process.spawn(terminalCommand, args, {cwd});
            child.unref()
        },
    })
    .command({
        command: 'stop',
        describe: 'Stop the Node process with the given process ID',
        builder: {
            pid: {
                alias: 'pid',
                describe: 'Process id',
                demandOption: true,
                type: 'string',
            },
        },
        handler: function handler(argv) {
            const processId = argv.pid;

            const platform = os.platform();
            const taskkillExecScript = platform === 'win32' ? 'taskkill' : 'kill';
            const taskkillArgs = platform === 'win32' ? ['/F', '/PID', processId] : ['-9', processId];

            const killProcess = child_process.spawn(taskkillExecScript, taskkillArgs);
            killProcess.unref();
        },
    })
    .version(pkg.version)
    .help();

yargs.parse();