import express from 'express';

import {
    indexController,
    loginController,
    callbackController,
    refreshTokenController
} from '../controller/index.js';

const router = express.Router();

router.get('/', indexController);
router.get('/login', loginController);
router.get('/callback', callbackController);
router.get('/refresh_token', refreshTokenController);

export default router;