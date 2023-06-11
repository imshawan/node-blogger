import chalk from 'chalk';

interface ILogger {
    prefix?: string
}

export class Logger {
    prefix?: string
    
    constructor(options: ILogger = {}) {
        this.prefix = options.prefix;
    }

    log = (...message: Array<any>) => {
        const parsedMessage = this.#parseMessage(message);
        console.log(this.#timeStamp(), parsedMessage);
    }

    info = (...message: Array<any>) => {
        const parsedMessage = this.#parseMessage(message);
        console.info(this.#timeStamp(), chalk.yellowBright(parsedMessage));
    }

    error = (...message: Array<any>) => {
        const parsedMessage = this.#parseMessage(message);
        console.error(this.#timeStamp(), chalk.redBright(parsedMessage));
    }

    #timeStamp() {
        return `[${new Date(Date.now()).toISOString()}]`;
    }

    #parseMessage(message: Array<any>) {
        var parsedMessage;
        if (message && Array.isArray(message) && message.length) {
            parsedMessage = message.map(elem => {
                if (typeof elem === 'object') {
                    return JSON.stringify(elem, null, 4);
                } else return elem;
            }).join(' ');
        }
        
        return this.prefix ? `${chalk.magentaBright(`[${this.prefix}]`)} ${parsedMessage}` : parsedMessage;
    }
}