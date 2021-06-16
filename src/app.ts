import express, {Request, response} from 'express';
import * as bodyParser from 'body-parser';

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

// parser Content-type header application/text type data.
app.use(bodyParser.text());

// define the routes.
// cache set API
app.use('/api/v1/set');

// cache get API.
app.use('/api/v1/get');






