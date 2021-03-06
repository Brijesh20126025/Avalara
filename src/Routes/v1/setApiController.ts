import express, {Request, Response, Router} from 'express';
import { CacheService } from '../../CacheService/cacheService';
import { ResponseService } from '../../ResponseService/responseService';

const router : Router = express.Router();


router.post('/:key', CacheService.setKey, ResponseService.error);

export { router as set};



