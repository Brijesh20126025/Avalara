import mongoose from 'mongoose';
class ConnectionManager {

    static createConnectionSync(dbName : string) {
        
        return new Promise<{err : any, conn : any}>((resolve, reject) => {

            const options : any = __getDbOptions();
            const connectionString : string = __getConnectionString(dbName);

            // connect to DB
            try {
                mongoose.connect(connectionString, options);
                const db : mongoose.Connection = mongoose.connection && mongoose.connection;

                db.on('error', (err : any) => {
                    console.error('####connectionManager.createConnection :: Error connecting to cloud db ' + connectionString);
                    return resolve({err : err, conn : null});
                });
    
                db.on('open', (err : any) => {
                    // we're connected!
                    console.log("We are now connected to db " + dbName + " id " + db.id);
                    // cache the connection. (if need it else ignore)
                    // {conn : db}
                    return resolve({err : err, conn : db});
                });
    
                db.on('close', () => {
                    console.info("#Db connection closed " + dbName + " id " + db.id);
                });
            }catch(ex : any) {
                console.error("$$$$$$$$$ DB CONNECTION ERROR %j", ex);
                return resolve({err : ex, conn : null});
            }
        });
    }
}

// Private functions..
function __getConnectionString(dbName : string) : string {

    /*   just using the db user name here in plain text but in production system
         we can store this username & password at secure location.
         or we will not hard core the user name & password in code and will always 
         ask user to provide the user name and password in evn process.
         /--- IGNORING THE SECURITY ASPECT HERE ----/
    */ 
    const dbUserName : string = process.env.DB_USER_NAME || 'avalara';
    const password : string = process.env.DB_PASSWORD || 'avalara@123';
    const connectionString = `mongodb+srv://${dbUserName}:${password}@cluster0.uvl1s.mongodb.net/${dbName}?retryWrites=true&w=majority`;

    return connectionString;
}

function __getDbOptions() : any {

    return {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        autoIndex: true, // Do build indexes
        poolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
    }
}

export {ConnectionManager};