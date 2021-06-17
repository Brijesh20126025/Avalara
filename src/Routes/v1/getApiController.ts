import express, {Request, Response, Router} from 'express';
import { CacheService } from '../../CacheService/cacheService';
import { ResponseService } from '../../ResponseService/responseService';

const router : Router = express.Router();


router.get('/:key', CacheService.getKey, ResponseService.error);

export { router as get};