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