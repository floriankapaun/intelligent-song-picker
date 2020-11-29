import express from 'express';
import cors from 'cors';
import history from 'connect-history-api-fallback';
import cookieParser from 'cookie-parser';

import { PORT, API_ROUTE, CLIENT_DIR } from './config.js';
import router from './router/index.js';

const app = express();

app.use(cors())
    .use(cookieParser())
    .use(API_ROUTE, router)
    .use(history()) // Enable historyMode for direct access to vue routes
    .use(express.static(CLIENT_DIR));

app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`);
})