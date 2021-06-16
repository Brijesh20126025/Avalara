import { constants } from '../Constants/constants';
import { ConnectionManager } from '../DbService/connectionManager';
import { DatabaseService } from '../DbService/dbService';
import { collectionNames } from '../DbService/collectionNames';
import { ICache } from '../Interfaces/ICache';
import { any } from 'joi';
import { has, reject } from 'lodash';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';

class CacheFileFetcher {

    // fetch the value of a key from DB. 
    static fetch(hash : string) {

        // steps - 
        // 1. create the DB connection & fecth the cache file from DB.
        return new Promise<{err : any, result : ICache[]}>(async (resolve, reject) => {
            // acquire the connection.
            const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
            if(connRes.err) {
                console.error("###CacheFetcher.fetch :: Error acquiring the connection ", connRes.err);
                return resolve({err : connRes.err, result : []});
            }
            let db = connRes.conn;
            // now fetch the cache file from Db.
            const findQuery : any = {
                key : hash
            }; 
            let cacheRes : {err : any, result : any} = await DatabaseService.findManyWithOptions(db, collectionNames.cache, findQuery, {});

            if(cacheRes.err) {
                console.error("###CacheFetcher.fetchCacheFile :: Error fetching the cache file from DB ", cacheRes.err);
                return resolve({err : connRes.err, result : []});
            }

            // read the cache file and send the json response.
            let cacheData : ICache[] = cacheRes.result;
            return resolve({err : null, result : cacheData});
        });
    }

    // insert key and value in DB
    static insert(hash : string, key : string, value : any) {

        return new Promise<{err :any, result : any}> (async (resolve, reject) => {
            const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
            if(connRes.err) {
                console.error("###CacheFetcher.insert :: Error acquiring the connection ", connRes.err);
                return resolve({err : connRes.err, result : null});
            }
            let db = connRes.conn;

            let doc : ICache = {
                key : hash,
                value : [{key : key, value : value}]
            }
            let insertRes : {err : any, result : any} = await DatabaseService.insertManySync(db, collectionNames.cache, [doc]);
            if(insertRes.err) {
                console.error('###CacheFetcher.insert :: Error in inserting the key ', insertRes.err);
                return resolve({err : insertRes.err, result : null});
            }
            return resolve({err : null, result : insertRes.result.insertedCount});
        });
    }

    // update(insert in array form) the value of an existing key.
    static update(hash : string, existingDoc : ICache, key : string, newvalue : string) {

        if(typeof(existingDoc.value) == 'string') {
            existingDoc.value = [{key : key, value : existingDoc.value}, {key : key, }]
        }
    }



}

export { CacheFileFetcher };