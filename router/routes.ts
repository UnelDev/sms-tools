import { Router } from 'express';
import login from './login';

const router = Router();
router.post('/login', login);

export default router;
