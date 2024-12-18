import { Router } from 'express';
import getMessage from './getMessage';
import getProgress from './getProgress';
import login from './login';

const router = Router();
router.post('/login', login);
router.post('/getMessage', getMessage);
router.post('/getProgress', getProgress);

export default router;
