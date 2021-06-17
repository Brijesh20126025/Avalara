class DatabaseService {

   // find query
   static findManyWithOptions(db : any, collectionName : string, query : any, options : any = {}) {
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
   static insertManySync(db : any, collectionName: string, doc: any[]) {
        return new Promise<{ err: any, result: any }>((resolve, reject) => {

            if(errorCheck(db)) {
                return resolve({err : 'db instance is not valid', result : null});
            }
            // handling the exception explicitly
            // but in real senario clients needs to handle at their end.
            try { 
                db.collection(collectionName).insertMany(doc, function (err : any, result : any) {
                    db.close();
                    console.log("########### INSERTED ", result);
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

    static updateOneWithOptions(db : any, collectionName: string, filter : any, doc: any, options : any = {}) {
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

    static checkIfCollectionExists(db : any, collectionName : string) {
        return new Promise<{err : any, result : boolean}>((resolve, reject) => {
            //console.log("##### DB %j", JSON.stringify(db));
            db.listCollections().toArray().then((names : string[]) => {
                // close the connection of collection exists.
                // else dont close same connection will be used the create the collection
                if(names.indexOf(collectionName) >= 0) {
                    db.close();
                }
                return resolve({err : null, result : (names.indexOf(collectionName) >= 0)});
            }).catch((ex : any) => {
                return resolve({err : ex, result : false});
            });
        });
    }

    static createCollection(db : any, collectionName : string) {
        return new Promise<{err : any, result : boolean}>((resolve, reject) => {
            db.createCollection(collectionName, (err : any, res : any) => {
                if(err) {
                    db.close();
                    console.error("Db Service :: Error creating the collection ", err);
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