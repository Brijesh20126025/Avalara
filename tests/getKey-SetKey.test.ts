import express, {Request, Response} from 'express'
import { expect } from 'chai';
const request = require('request');
import {app} from '../src/app';

// const app : any = express();


/*
    Cache GET API Test
*/

let port = process.env.TEST_SERVER_PORT || 3000;

let baseUrl : string = `http://localhost:${port}`;

describe('------ Cache APIs ------ ', () => {
    // start the server during the npm test run because 
    // some test cases are calling the APIs.
    let server : any = null;
    before(done => {
        console.log("-------------------------------------------------------");
        server = app.listen(port, done);
        console.log("Server running at port " + port);
        console.log('-------------------------------------------------------');
    });
      
    it('GET the key from Cache', (done) => {

        let key : string = 'test_key'
        // first set the key in cache.
        const setApi = baseUrl + `/api/v1/set/${key}`;
        let apiOpts = {
            method : 'POST',
            url : setApi,
            body : 'test_key_value',
            headers : {
                'Content-type' : 'text/plain; charset=UTF-8'
            }
        }
        request(apiOpts, (err : any, res : any, body : any) => {
            expect(res.statusCode).equal(200);
            expect(body).equal('OK');
            expect(err).equal(null);

            // get the API which we just set in cache.
            let getApi = baseUrl + `/api/v1/get/${key}`;

            let getApiOpts = {
                method : 'GET',
                url : getApi,
                headers : {
                    'Content-type' : 'text/plain; charset=UTF-8'
                }
            }
            request(getApiOpts, (err : any, res : any, body : any) => {
                expect(res.statusCode).equal(200);
                expect(body).equal('test_key_value');
                expect(err).equal(null);
                done();
            })
        })

    });

    it('SET key in cache', (done) => {
        let key : string = 'test_key'
        // first set the key in cache.
        const setApi = baseUrl + `/api/v1/set/${key}`;
        let apiOpts = {
            method : 'POST',
            url : setApi,
            body : 'test_key_value',
            headers : {
                'Content-type' : 'text/plain; charset=UTF-8'
            }
        }
        request(apiOpts, (err : any, res : any, body : any) => {
            expect(res.statusCode).equal(200);
            expect(body).equal('OK');
            expect(err).equal(null);
            done();
        })
    })
})