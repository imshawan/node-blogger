import chalk from 'chalk';

interface ILogger {
    prefix?: string
}

export class Logger {
    private prefix?: string
    
    constructor(options: ILogger = {}) {
        this.prefix = options.prefix;
    }

    private timeStamp() {
        return `[${new Date(Date.now()).toLocaleString()}]`;
    }

    /**
     * @date 26-11-2023
     * @returns Caller name (equivalent to arguments.callee.name)
     */
    private method() {
        let error = new Error('Error');
        let funcErrorStack = error.stack && error.stack.split('\n')[2].split(' ');
        let callerPrevIndex = funcErrorStack && funcErrorStack.indexOf('at');
        let callerName = (funcErrorStack && callerPrevIndex) && funcErrorStack[callerPrevIndex + 1];

        return callerName ? callerName.split('.')[1] :  undefined;
    }

    private color(code: string) {
        switch (code) {
            case 'error':
                return 'redBright';
            case 'warn':
                return 'yellow';
            default:
                return 'greenBright';
        }
    }

    private parseMessage(message: Array<any>, prefix: string | undefined) {
        var parsedMessage;
        prefix = this.prefix || prefix;

        if (message && Array.isArray(message) && message.length) {
            parsedMessage = message.map(elem => {
                if (typeof elem === 'object') {
                    return JSON.stringify(elem, null, 4);
                } else return elem;
            }).join(' ');
        }
        
        return prefix ? `${chalk[this.color(prefix)](`[${this.prefix || prefix}]`)} ${parsedMessage}` : parsedMessage;
    }

    log = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        console.log(this.timeStamp(), parsedMessage);
    }

    info = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        console.info(this.timeStamp(), chalk.rgb(255,250,224)(parsedMessage));
    }

    warn = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        console.warn(this.timeStamp(), chalk.yellow(parsedMessage));
    }

    error = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        console.error(this.timeStamp(), chalk.redBright(parsedMessage));
    }

    success = (...message: Array<any>) => {
        const parsedMessage = this.parseMessage(message, this.method());
        console.info(this.timeStamp(), chalk.greenBright(parsedMessage));
    }
}