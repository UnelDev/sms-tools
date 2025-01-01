import { Router } from 'express';
import getMessage from './router/getMessage';
import getProgress from './router/getProgress';
import login from './router/login';

const router = Router();
router.post('/login', login);
router.post('/getMessage', getMessage);
router.get('/getProgress', getProgress);

export default router;
