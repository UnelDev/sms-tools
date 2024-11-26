import { Router } from 'express';
import login from './login';
import getMessage from './getMessage';

const router = Router();

router.post('/login', login);
router.post('/getMessage', getMessage);

export default router;
