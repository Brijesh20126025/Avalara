import {ConnectionManager } from '../DbService/connectionManager';
import { constants} from '../Constants/constants';
import {DatabaseService } from '../DbService/dbService';
import { collectionNames } from '../DbService/collectionNames';
import { any } from 'joi';
import { ICache } from '../Interfaces/ICache';
import { localCache } from '../CacheService/localCache';
import mongoose from 'mongoose';
import { Console } from 'console';

class Init {
    static async initDbAndCache() {

        // check if collection is created already and we have stored
        // the result in cache.
        if(localCache['collection_created']) {
            // only init the cache init.
            try {
                __initCache(null);
                return Promise.resolve('Local cache initiated!!!');
            } catch(ex : any) {
                return Promise.reject(ex);
            }
        }
        else {
            // first check if the collection already exists.
            return new Promise<{err : any, result : any}>(async (resolve, reject) => {
                // acquire the connection.
                const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
                if(connRes.err) {
                    console.error("###CacheFetcher.fetch :: Error acquiring the connection ", connRes.err);
                    return reject({err : connRes.err, result : 'couldnt create collection'});
                }
                let db : mongoose.Connection =  connRes.conn;

                let exists : {err : any, result : boolean} = await DatabaseService.checkIfCollectionExists(db, collectionNames.cache);

                if(exists.err) {
                    console.error('Init :: Error during the checking of colleciton existance');
                    return reject({err : exists.err, result : null});
                }

                // if collection already exists.
                if(exists.result) {
                    // init the cache.
                    localCache['collection_created'] = true;
                    try {
                        __initCache(db);
                        return Promise.resolve('intiated the cache');
                    } catch(ex : any) {
                        return Promise.reject(ex);
                    }
                } else {
                    // else create the collection.
                    let createRes : {err : any, result : any} = await DatabaseService.createCollection(db, collectionNames.cache);
                    if(createRes.err && !(createRes.err.codeName == constants.COLLECTION_ALREADY_EXISTS_ERROR_CODE)) {
                        db.close();
                        console.error("Init :: Error creating the collection " + collectionNames.cache);
                        return reject({err : createRes.err, result : null});
                    }
                    localCache['collection_created'] = true;
                    return resolve({err : null, result : 'Success creation of collection'});
                }
            });
        }
    }
}

async function __initCache(db : any) {

    if(!db) {
        const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
        if(connRes.err) {
            console.error("###CacheFetcher.fetch :: Error acquiring the connection ", connRes.err);
            return Promise.reject({err : connRes.err, result : "couldn't create collection"});
        }
        let dbConn = connRes.conn;
        fillCache(dbConn);
    }
    else {
        fillCache(db);
        return Promise.resolve('Local Cache initiated successfully');
    }
}

async function fillCache(db : any) {

    let cacheData : {err : any, result : any} = await DatabaseService.findManyWithOptions(db, collectionNames.cache, {});
    if(cacheData.err) {
        db.close();
        return Promise.resolve('Error in cache init');
    }
    let data : any[] = cacheData.result;

    data.forEach((items : any) => {
        localCache[items.hash] = items.value;
    });
    db.close();
    return Promise.resolve('initiated the cache');
}

export { Init };