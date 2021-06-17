import express, {Request, Response} from 'express';
import { IError } from '../Interfaces/IError'
import * as crypto from 'crypto';
import { constants } from '../Constants/constants';
import { CacheServiceProvider } from './cacheServiceProvider';
import { localCache } from './localCache';
import { ICache } from '../Interfaces/ICache';
import * as _ from 'lodash';


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

        let cacheRes : {err : any, result : ICache[]} = await CacheServiceProvider.fetch(hash);

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
        let updateRes : {err : any, result : any} = await CacheServiceProvider.update(hash, cacheValue[0], key, value);

        if(updateRes.err) {
            console.error("###CacheService.setKey Error updating the key - value in DB ", updateRes.err);
            let error : IError = {
                status : 500,
                message : "couldn't save the key in cache. try again",
                data : null,
                err : updateRes.err
            }
            return next(error);
        }

        //console.log("Successfully saved the key : value " + key + " : " + value);
        res.status(200).end("OK");
        return;
    }

    static async getKey(req : Request, res : Response, next : Function) {
        let key : string = req.params.key;
        if(!key || !key.length) {
            let error : IError = {
                status : 400,
                message : "Key can't be empty. Provide the valid cache key",
                data : key
            }
            return next(error);
        }

        const hash : string = crypto
                              .createHmac('md5', constants.hashSecrect) // using MD5 as encryption algo.
                              .update(key)
                              .digest('hex');
        
        // first check this key in local in-memory cache if found(cache hit)
        // then return from here. else hit the DB(cache miss).
        if(localCache[hash]) {
            
            console.log("Serving from local cache %j", localCache[hash]);
            // IN CASE OF HASH COLLISION.
            // if there are multiple values stored at this hash key.
            let filter : any[] = _.filter(localCache[hash], (item) => {
                return item.key === key;
            });
            res.end(filter[0].value);
            return;
        }

        // if not found in the local in-memory cache(cache miss)
        // then we need to fetch it from DB.
        let cacheRes : {err : any, result : ICache[]} = await CacheServiceProvider.fetch(hash);

        if(cacheRes.err) {
            console.error("###CacheService.getKey :: Error fetching the value from DB ", cacheRes.err);
            let error : IError = {
                status : 500,
                message : "couldn't fetch the key from cache. try again",
                data : null,
                err : cacheRes.err
            }
            return next(error);
        }
        
        if(cacheRes.result && !cacheRes.result.length) {
            res.status(200).end("KEY_NOT_FOUND");
            return;
        }

        let cacheData : any[] = cacheRes.result[0].value;
        let filter : any[] = _.filter(cacheData, (item) => {
            return item.key === key;
        });
        res.status(200).end(filter[0].value);
        return;
    }
}

export { CacheService };
