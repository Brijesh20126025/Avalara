import express, {Request, response} from 'express';
import * as bodyParser from 'body-parser';
import { setApiRouter, getApiRouter } from './Routes/v1';
import { Init } from './InitialiationService/initializationService';
const morgan = require('morgan');

const app : any = express();

const data : any = {
    limit : '500mb',
    parameterLimit : 1000000,
    extended : true
}

// morgan for API login
app.use(morgan('dev'));

// parse the url-encoded req body data.
app.use(bodyParser.urlencoded(data));

// parse Content-type header - application/json req body data.
app.use(bodyParser.json());

// parser Content-type header text/plain type data.
app.use(bodyParser.text());


//set the DB intialization cache refresh init.
//every 30s all the processes will updated their in-memory cache.
setInterval(() => {
    Init.initDbAndCache()
        .then((res) => {
            console.info("### Inited Cache Succssefully");
        }).catch((ex) => console.error(ex));
}, 30000); 

// define the routes.
// cache set API
app.use('/api/v1/set', setApiRouter.set);

// cache get API.
app.use('/api/v1/get', getApiRouter.get);

const port : any = process.env.PORT || 5000;
app.listen(port, (err : any) => {
    if(err) {
        console.error("#### Can't start server ", err);
        process.exit(1);
    }
    console.log('-------------------------------------------');
    console.log('Server listening at port ' + port);
    console.log('-------------------------------------------');
})

export {app};






