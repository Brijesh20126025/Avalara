import {ConnectionManager } from '../DbService/connectionManager';
import { constants} from '../Constants/constants';
import {DatabaseService } from '../DbService/dbService';
import { collectionNames } from '../DbService/collectionNames';
import { any } from 'joi';
import { ICache } from '../Interfaces/ICache';
import { localCache } from '../CacheService/localCache';

class Init {
    static async initDbAndCache() {

        // check if collection is created already and we have stored
        // the result in cache.

        if(localCache['collection_created']) {
            // only init the cache init.
            try {
                __initCache(null);
                return Promise.resolve('intiated the cache');
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
                let db = connRes.conn;
                let exists : {err : any, result : any} = await DatabaseService.findManyWithOptions(db, collectionNames.cache, {}, {limit : 1});

                if(exists.err) {
                    console.log("#######Collection checking error", exists.err);
                    return reject({err : exists.err, result : null});
                }
                // check if collection exists. if not
                if(!exists.result) {
                    // create the collection.
                    let createRes : {err : any, result : any} = await DatabaseService.createCollection(db, collectionNames.cache);

                    if(createRes.err) {
                        db.close();
                        console.error("Init :: Error creating the collection " + collectionNames.cache);
                        return reject({err : createRes.err, result : null});
                    }
                    localCache['collection_created'] = true;
                    try {
                        __initCache(db);
                    } catch(ex : any) {
                        return Promise.reject(ex);
                    }
                    console.info("#### DB init  :: collection created successfully " + collectionNames.cache);
                    return resolve({err : null, result : 'Success creation of collection'});
                }
                localCache['collection_created'] = true;
                try {
                    __initCache(db);
                } catch(ex : any) {
                    return Promise.reject(ex);
                }
                return resolve({err : null, result : 'Collection already exists'});
            });
        }
    }
}

async function __initCache(db : any) {

    if(!db) {
        const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
        if(connRes.err) {
            console.error("###CacheFetcher.fetch :: Error acquiring the connection ", connRes.err);
            return Promise.reject({err : connRes.err, result : 'couldnt create collection'});
        }
        let dbConn = connRes.conn;
        fillCache(dbConn);
    }
    else {
        fillCache(db);
    }
}

async function fillCache(db : any) {
    let cacheData : {err : any, result : any} = await DatabaseService.findManyWithOptions(db, collectionNames.cache, {});

    if(cacheData.err) {
        db.close();
        return Promise.resolve('Error in cache init');
    }
    let data : ICache[] = cacheData.result;

    data.forEach((items : ICache) => {
        localCache[items.key] = items.value;
    });
    db.close();
    return Promise.resolve('intiated the cache');
}

export { Init };