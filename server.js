'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const debug = require('debug')(`${process.env.APP_NAME}: Server`);

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.Server(app);

const errorMiddleware = require('./lib/error.js');
const socketRouter = require('./router/socket-router');
const userRouter = require('./router/user-router.js');
const profileRouter = require('./router/profile-router.js');
const requestRouter = require('./router/request-router.js');
const convoRouter = require('./router/convo-router.js');


mongoose.connect(process.env.MONGODB_URI);
const webSocket = socketRouter(server);


app.use(morgan('dev'));
app.use(cors());
app.use(userRouter);
app.use(profileRouter);
app.use(requestRouter(webSocket));
app.use(convoRouter(webSocket));
app.use(errorMiddleware);

server.listen(PORT, () => {
  debug(`Server active on port : ${PORT}`);
});
