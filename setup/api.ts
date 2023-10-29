import express, {Request, Response, NextFunction} from 'express';
import {MongoClient, ServerApiVersion} from 'mongodb';
import _ from 'lodash';
import {Logger} from '../src/utilities';
import {utils} from '../src/user'
import server from './server';
import defults from './data/defaults.json'

const router = express.Router();
const logger = new Logger({prefix: 'setup'});
const connectionOptions = {
    connectTimeoutMS: 90000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

router.post('/database', database);
router.post('/account', setupAdministrator);
router.post('/complete', complete);

async function database(req: Request, res: Response, next: NextFunction) {
    const {uri, dbName} = req.body;

    try {
        if (!uri) {
            throw new Error('Database URI is required.');
        }
        if (!dbName) {
            throw new Error('A valid database name is required to connect.');
        }

        const client = new MongoClient(uri, _.merge(connectionOptions));
        await client.connect();  

        var db = client.db(dbName); 
        await db.command({ ping: 1 }); 

        logger.info('Database connection successful') 

    } catch (err) {
        return res.status(400).json({message: err.message});  
    }
    res.status(200).json({message: 'OK'})
}

async function setupAdministrator(req: Request, res: Response, next: NextFunction) {
    const {username, email, password, confirmPassword} = req.body;
    const missing: string[] = [];

    ['username', 'email', 'password', 'confirmPassword'].forEach(key => {
        if (!req.body[key]) {
            missing.push(key);
        }
    })

    if (missing.length) {
        return res.status(400).json({message: 'Required fields were missing from the request: ' + missing.join(', ')});
    }

    try {
        if (username.length <= defults.minUsernameLength) {
            throw new Error('username is too short.');
        }
        if (username.length > defults.maxUsernameLength) {
            throw new Error('username is too long.')
        }
    } catch (err) {
        return res.status(400).json({message: err.message, field: 'username'})
    }

    try {
        utils.validatePassword(password);
        utils.checkPasswordStrength(password);

        if (password != confirmPassword) {
            throw new Error('Passwords do not match.');
        }
    } catch (err) {
        return res.status(400).json({message: err.message, field: 'password'});   
    }

    if (!utils.isValidEmail(email)) {
        return res.status(400).json({message: 'Invalid email address supplied.', field: 'email'})
    }

    // TODO: Implement user creation

    res.status(200).json({message: 'Ok'});
}

async function complete(req: Request, res: Response, next: NextFunction) {
    // TODO: Write the configuration to config.json
    res.status(200).json({message: 'OK'})
}

export default router;
