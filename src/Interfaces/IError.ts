export interface IError {
    status : number,
    message : string,
    data? : any,
    err? : any,
    stack? : any
}