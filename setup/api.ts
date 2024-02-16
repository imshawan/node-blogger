import express, {Request, Response, NextFunction} from 'express';
import {Db, MongoClient} from 'mongodb';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import {Logger, getISOTimestamp, generateUUID, slugify, password as Passwords, sanitizeString} from '../src/utilities';
import { IUser, MutableObject } from "../src/types";
import { Collections } from "../src/constants";
import {utils} from '../src/user';
import {utilities as dbUtils} from '../src/database/utils';
import defults from './data/defaults.json'

const router = express.Router();
const logger = new Logger({prefix: 'setup'});
const tempFilesDir = path.join(__dirname, 'temp');
const tempFiles = ['database.json', 'account.json'];
const configFileLocation = path.join(__dirname, '../config.json');
const userFields = ['username', 'email', 'password', 'confirmPassword'];
const connectionOptions = {
    connectTimeoutMS: 90000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

router.post('/database', database);
router.post('/account', setupAdministrator);
router.post('/complete', complete);

async function database(req: Request, res: Response, next: NextFunction) {
    const {uri, dbName, blogUrl, testDbName} = req.body;

    try {
        if (!blogUrl) {
            throw new Error('Blog URL is required.');
        }

        new URL(blogUrl); // Will throw error if is invalid.
    } catch (err) {
        return res.status(400).json({message: err.message, field: 'blogUrl'});
    }

    try {
        await setupDatabaseConnection(uri, dbName);       
        logger.info('Database connection successful') 

    } catch (err) {
        return res.status(400).json({message: err.message, field: 'database'});  
    }

    const data = {uri, dbName, blogUrl, testDbName: testDbName || dbName + '-test'};
    if (!fs.existsSync(tempFilesDir)) {
        fs.mkdirSync(tempFilesDir);
    }

    fs.writeFileSync(path.join(tempFilesDir, 'database.json'), JSON.stringify(data, null, 4));

    res.status(200).json({message: 'OK'})
}

async function setupAdministrator(req: Request, res: Response, next: NextFunction) {
    const {username, email, password, confirmPassword} = req.body;
    const missing: string[] = [];

    userFields.forEach(key => {
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

    const userData: MutableObject = {}
    userFields.forEach(field => userData[field] = req.body[field]);

    if (!fs.existsSync(tempFilesDir)) {
        fs.mkdirSync(tempFilesDir);
    }

    fs.writeFileSync(path.join(tempFilesDir, 'account.json'), JSON.stringify(userData, null, 4));

    res.status(200).json({message: 'Ok'});
}

async function complete(req: Request, res: Response, next: NextFunction) {
    const missing = tempFiles.filter(file => !fs.existsSync(path.join(tempFilesDir, file)));
    const config: MutableObject = {};
    
    try {
        if (missing.length) {
            throw new Error(`Looks like you havenn't configured ${missing.map(e => e.split('.json')).join(', ')} yet. Please restart the setup process.`);
        }

        const baseConf = JSON.parse(fs.readFileSync(path.join(tempFilesDir, 'database.json'), {encoding: 'utf-8'}));
        const userData: IUser = JSON.parse(fs.readFileSync(path.join(tempFilesDir, 'account.json'), {encoding: 'utf-8'}));
        const database = await setupDatabaseConnection(baseConf.uri, baseConf.dbName);

        config.host = baseConf.blogUrl;
        config.port = 3000;
        config.mongodb = {
            uri: baseConf.uri,
            db: baseConf.dbName
        }
        config.test = {
            timeout: 2000,
            mongodb: {
                uri: baseConf.uri,
                db: baseConf.testDbName
            }
        }
        config.secret = generateUUID();
        config.env = "development";

        const globalCounter = {
            _key: 'global:counters',
            user: 1
        }
        
        await Promise.all([
            database.collection(Collections.DEFAULT).insertOne(globalCounter),
            createFirstUser(userData, database)
        ])

    } catch (err) {
        return res.status(400).json({message: err.message})
    }
    
    // Write to config.json
    fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 4));

    // Clean up the temp folder
    let previousTempFiles = fs.readdirSync(tempFilesDir);
    if (previousTempFiles) {
        previousTempFiles.forEach(file => fs.unlinkSync(path.join(tempFilesDir,  file)));
    }
    
    res.status(200).json({message: 'OK'});

    setTimeout(() => {
        logger.info('Stopping Web Installer');
        process.exit(0);
    }, 500);
}

async function setupDatabaseConnection(uri: string, dbName: string) {
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

    return db;
}

async function createFirstUser(userdata: IUser, dbConnection: Db) {
    const {email='', username='', password=''} = userdata;
    const timestamp = getISOTimestamp();
    const now = Date.now();

    const user: IUser = {
        _scheme: 'user:userid'
    };

    const passwordHash = await Passwords.hash({password, rounds: 12});
    const userid = 1;
    const key = 'user:' + userid;

    user._key = key;
    user.userid = userid;
    user.username = username;
    user.email = email;
    user.slug = slugify(username);
    user.passwordHash = passwordHash;
    user.emailConfirmed = true;
    user.roles = {
        administrator: 1,
        moderator: 1,
        globalModerator: 1
    }
    user.gdprConsent = false;
    user.acceptedTnC = false;
    user.joiningDate = timestamp;
    user.isOnline = true;
    user.createdAt = timestamp;
    user.updatedAt = timestamp;

    const uniqueUUID = generateUUID();
    const newUserRegData = {
        _key: 'user:' + userid + ':registeration',
        _scheme: 'user:userid:registeration',
        token: uniqueUUID,
        consentCompleted: false,
        consent: {
            emails: false,
            data: false
        },
        userid: userid,
        createdAt: timestamp,
    };
    const bulkAddSets = [
        ['user:userid', key, now],
        ['user:slug:' + sanitizeString(user.slug), key, now],
        ['user:userid:' + userid, key, now],
        ['user:username:' + sanitizeString(username), key, now],
        ['user:email:' + email, key, now],
        ['user:username', String(sanitizeString(username)).toLowerCase() + ':' + userid, now],
    ];

    const sets = dbUtils.prepareSortedSetKeys(bulkAddSets);
    const writeData = [user].concat([newUserRegData], sets)

    await dbConnection.collection(Collections.DEFAULT).insertMany(writeData);
}

export default router;
