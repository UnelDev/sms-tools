import { Router } from 'express';
import getMessage from './getMessage';
import login from './login';

const router = Router();
router.post('/login', login);
router.post('/getMessage', getMessage);

export default router;
