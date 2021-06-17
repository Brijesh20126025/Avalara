import { constants } from '../Constants/constants';
import { ConnectionManager } from '../DbService/connectionManager';
import { DatabaseService } from '../DbService/dbService';
import { collectionNames } from '../DbService/collectionNames';
import { ICache } from '../Interfaces/ICache';
import * as _ from 'lodash';
import { localCache } from './localCache';

class CacheServiceProvider {

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
                hash : hash
            }; 
            let cacheRes : {err : any, result : any} = await DatabaseService.findManyWithOptions(db, collectionNames.cache, findQuery, {});

            if(cacheRes.err) {
                console.error("###CacheFetcher.fetchCacheFile :: Error fetching the cache file from DB ", cacheRes.err);
                return resolve({err : connRes.err, result : []});
            }

            console.log("###### FETCH DATA %j" , cacheRes);

            // read the cache file and send the json response.
            let cacheData : ICache[] = cacheRes.result;

            if(!cacheData.length) {
                return resolve({err : null, result : []});
            }

            // save this result in local in-memory cache.
            localCache[hash] = cacheData[0].value;

            console.log("Saved in local cache %j", localCache[hash]);
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

        // push the new data.
        let cacheData : any[] = existingDoc && existingDoc.value || [];
        let filterData : any[] = _.filter(cacheData, (item) => { return item.key != key });

        filterData.push({key : key, value : newvalue});
        
        let updateDoc : any = {
            '$set' : {value : filterData}
        }

        let filterQuery : any = {
            hash : hash
        }

        return new Promise<{err : any, result : any}>(async (resolve, reject) => {
            // acquire the connection.
            const connRes : {err : any, conn : any} = await ConnectionManager.createConnectionSync(constants.dbName);
            if(connRes.err) {
                console.error("###CacheFetcher.update :: Error acquiring the connection ", connRes.err);
                return resolve({err : connRes.err, result : null});
            }
            let db = connRes.conn;
            // now update the cache in Db.
            
            let updateRes : {err : any, result : any} = await DatabaseService.updateOneWithOptions(db, collectionNames.cache, filterQuery, updateDoc, {upsert : true});

            if(updateRes.err) {
                console.error("###CacheFetcher.update :: Error in updating the cache value", updateRes.err);
                return resolve({err : updateRes.err, result : null});
            }

            console.info("### CacheFetcher.update :: Updated the data successfully %j", updateDoc);

            // save this info local in memory cache.
            localCache[hash] = filterData;
            return resolve({err : null, result : updateRes.result.modifiedCount});
        });
    }
}

export { CacheServiceProvider };