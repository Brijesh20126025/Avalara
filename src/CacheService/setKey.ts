import express, {Request, Response} from 'express';
import { IError } from '../Interfaces/IError'
import * as crypto from 'crypto';
import { constants } from '../Constants/constants';
import { CacheFileFetcher } from '../CacheService/cacheFileFetcher';
import { localCache } from '../CacheService/localCache';
import { ICache } from '../Interfaces/ICache';
import { DatabaseService } from '../DbService/dbService';
import { has } from 'lodash';


class CacheService {

    static async setKey(req : Request, res : Response, next : Function) {

        const key : string = req.params.key;
        const value : string = req.body;

        if(!key || !key.length) {
            let error : IError = {
                status : 400,
                message : "Key can't be empty. Provide the valid cache key",
                data : key
            }
            return next(error);
        }

        if(!value || !value.length) {
            let error : IError = {
                status : 400,
                message : "value can't be empty. Provide the valid cache value",
                data : key,
            }
            return next(error);
        }

        // create the hash of key and store the this hash value as key in cache.
        const hash : string = crypto
                            .createHmac('md5', constants.hashSecrect) // using MD5 as encryption algo.
                            .update(key)
                            .digest('hex');

        let cacheRes : {err : any, result : ICache[]} = await CacheFileFetcher.fetch(hash);

        if(cacheRes.err) {
            console.error("###CacheService.setKey :: Error fetching the value from DB ", cacheRes.err);
            let error : IError = {
                status : 500,
                message : "couldn't save the key in cache. try again",
                data : null,
                err : cacheRes.err
            }
            return next(error);
        }

        let cacheValue : ICache[] = cacheRes.result;

        // means key is not present in cache.
        // set this key and value in DB and insert in the local cache 
        if(!cacheValue.length) {

            // insert in DB.
            let insertRes : {err : any, result : any} = await CacheFileFetcher.insert(hash, key, value);
            if(insertRes.err) {
                console.error("###CacheService.setKey :: Error inserting the value in DB ", insertRes.err);
                let error : IError = {
                    status : 500,
                    message : "couldn't save the key in cache. try again",
                    data : null,
                    err : insertRes.err
                }
                return next(error);
            }

            // we have successfully saved in DB. 
            // update the same data in in memory cache.
            __updateInMemoryCache(hash, key, value);
            console.info("Saved key : value " , {key : key, value : value});
            res.send("\nOK");
            return;
        }

        // hash is already present in the cache. 
        // We need to update the value in DB and in memory cache.
        // this is the hash collison we need to push the another value in 
        let updateRes : {err : any, result : any} = await CacheFileFetcher.update(hash, cacheValue[0], key, value);
    }
}

function __updateInMemoryCache(hash : string, key : string, value : any) {

    const cacheData : ICache = {
        key : hash,
        value : [{key : key, value : value}]
    };
    localCache[key]  = cacheData;
}

