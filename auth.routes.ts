import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema } from '@cafems/shared-schemas';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

export default router;