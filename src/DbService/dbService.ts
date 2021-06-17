import mongoose from 'mongoose';
import { collectionNames } from './collectionNames';
import * as _ from 'lodash';
import { constants } from '../Constants/constants';
class DatabaseService {

   // find query
   static findManyWithOptions(db : mongoose.Connection, collectionName : string, query : any, options : any = {}) {
       return new Promise<{err : any, result : any[]}>((resolve ,reject) => {
           if(errorCheck(db)) {
               return resolve({err : 'db instance is not valid', result : []});
           }
           db.collection(collectionName).find(query, options).toArray().then((dbres : any) => {
               db.close();
               return resolve({err : null, result : dbres});

           }).catch((dberr : any) => {
               db.close();
               return resolve({err : dberr, result : []});
           });
       });
   }

   // insert query
   static insertManySync(db : mongoose.Connection, collectionName: string, doc: any[]) {
        return new Promise<{ err: any, result: any }>((resolve, reject) => {

            if(errorCheck(db)) {
                return resolve({err : 'db instance is not valid', result : null});
            }
            // handling the exception explicitly
            // but in real senario clients needs to handle at their end.
            try { 
                db.collection(collectionName).insertMany(doc, function (err : any, result : any) {
                    db.close();
                    return resolve({ err, result });
                });
            }
            catch(ex : any) {
                db.close();
                console.error('### DB error ' + collectionName);
                return resolve({err : ex, result : null});
            }
        });
    }

    static updateOneWithOptions(db : mongoose.Connection, collectionName: string, filter : any, doc: any, options : any = {}) {
        return new Promise<{ err: any, result: any }>((resolve, reject) => {
    
            if(errorCheck(db)) {
                return resolve({err : 'db instance is not valid', result : null});
            }
            
            try {
                db.collection(collectionName).updateOne(filter, doc, options, function (err : any, result : any) {
                    db.close();
                    return resolve({ err, result });
                });
            }
            catch(ex : any) {
                db.close();
                console.error('### DB error ' + collectionName);
                return resolve({err : ex, result : null});
            }
        });
    }

    static checkIfCollectionExists(db : mongoose.Connection, collectionName : string) {
        return new Promise<{err : any, result : boolean}>((resolve, reject) => {
            db.db.listCollections({}, {nameOnly : true}).toArray().then((names : any[]) => {
                let collecitonNames : string[] = _.map(names, 'name');
                if(collecitonNames.indexOf(collectionNames.cache) >= 0) {
                    db.close();
                    return resolve({err : null, result : true});
                }
                return resolve({err : null, result : false});
            }).catch((err : any) => {
                db.close();
                console.error("### DB error error in list collection query ", err);
                return resolve({err : err, result : false});
            })
        });
    }

    static createCollection(db : any, collectionName : string) {
        return new Promise<{err : any, result : boolean}>((resolve, reject) => {
            db.createCollection(collectionName, (err : any, res : any) => {
                if(err && !(err.codeName == constants.COLLECTION_ALREADY_EXISTS_ERROR_CODE)) {
                    db.close();
                    console.error("Db Service :: Error creating the collection ", err && err.codeName);
                    return resolve({err : err, result : false});
                }
                db.close();
                return resolve({err : null, result : res});
            });
        });
    }
}

// private functions
function errorCheck(db : any) : Boolean {
   if(!db) {
       console.error("### DB handle is null");
       return true;
   }
   return false;
}

export { DatabaseService };