import { Express } from "express";
import { database } from "@src/database";
import session from "express-session";

interface SessionObject {
    _id: string
    expires: string
    session: string
}

/**
 * @date 24-08-2023
 * @author imshawan <hello@imshawan.dev>
 * @class PassportUserSessionStore
 * @description A Promisified version of SessionStore management with some extended functionalities
 */

export class PassportUserSessionStore {
    store: Express.SessionStore;

    constructor(store: Express.SessionStore) {
      this.store = store;

      this.validate = this.validate.bind(this);
      this.getAll = this.getAll.bind(this);
      this.getById = this.getById.bind(this);
      this.clear = this.clear.bind(this);
      this.destroy = this.destroy.bind(this);
      this.getAllSessionsByUserId = this.getAllSessionsByUserId.bind(this);
      this.getActiveSessionsByUserId = this.getActiveSessionsByUserId.bind(this);
      this.getCurrentUserSessions = this.getCurrentUserSessions.bind(this);

      this.validate();
    }

    private validate() {
        if (!this.store) {
            throw new Error('A valid session store object is required to initialize');
        }
    }

    public clear () {
        return new Promise((resolve, reject) => {
            if (this.store.clear) {
                this.store.clear(function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('Session stored cleared successfully');
                    }
                });
            }
        });
    }

    public destroy (sessionId: string) {
        if (!sessionId) {
            throw new Error('A valid session id (sid) is required');
        }

        return new Promise((resolve, reject) => {
            this.store.destroy(sessionId, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve('Session was destroyed successfully');
                }
            });
        });
    }

    public getAll (): Promise<session.SessionData[] | {[sid: string]: session.SessionData;} | null | undefined> {
        return new Promise((resolve, reject) => {
            if (this.store.all) {
                this.store.all(function (err, sessionDataArray) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(sessionDataArray);
                    }
                });
            } else resolve([]);
        });
    }

    public getById (sessionId: string): Promise<session.SessionData | null | undefined> {
        if (!sessionId) {
            throw new Error('A valid session id (sid) is required');
        }
        return new Promise((resolve, reject) => {
            this.store.get(sessionId, function (err, sessionData) {
                if (err) {
                    reject(err);
                } else {
                    resolve(sessionData);
                }
            });
        });
    }

    public async getCurrentUserSessions(userId: Number) {
        const sessions = await this.getActiveSessionsByUserId(userId);
        if (sessions && sessions.length) {
            return sessions.map(elem => {
                if (Object.hasOwnProperty.bind(elem.session)('passport')) {
                    // @ts-ignore
                    const {agent} = elem.session.passport;
                    return agent;
                } else return {};
            });
        } else {
            return [];
        }
    }

    public async getActiveSessionsByUserId(userId: Number) {
        const sessions = await this.getAllSessionsByUserId(userId);
        if (sessions && sessions.length) {
            return sessions.filter(elem => new Date(elem.expires) > new Date());
        } else {
            return [];
        }
    }

    public async getAllSessionsByUserId (userId: Number): Promise<Array<SessionObject> | null> {
        if (!userId) {
            throw new Error('A valid userid is required');
        }

        if (typeof userId != 'number') {
            throw new Error('Userid must be a number not ' + typeof userId);
        }

        const sessionkey = {
            session: {$regex: new RegExp(`\"user\":${userId}`), $options: 'i'}
        };
        
        const sessions = await database.getObjects(sessionkey, [], {collection: 'sessions', multi: true});
        if (sessions && sessions.length) {
            return sessions.map((elem: SessionObject) => ({...elem, session: JSON.parse(elem.session)}));
        } else return sessions;
    }
  }