'use sctict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('chat: server.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cors());


app.listen(PORT, () => {
  debug(`SERVER ACTIVE ON PORT: ${PORT}`);
});
