import express, { Request, Response } from 'express';
import { IError } from '../Interfaces/IError';
import { constants } from '../Constants/constants';
import { Func } from 'mocha';

class ResponseService {

    // Error response service sender.
    static error(err : IError, req : Request, res : Response, next : Function) {

        let httpErrResponse : any = {
            status : err && err.status || 500,
            message : err && err.message || 'Internal server error. try after some time.',
            data : err && err.data,
            stack : err && err.stack || null
        }

        // if production env then delete the stack trace.
        if(process.env.NODE_ENV === constants.NODE_ENV) {
            delete httpErrResponse.stack;
            delete err.stack;
        }

        res.status(httpErrResponse.status).json(httpErrResponse);
        return;
    }
}

export { ResponseService };