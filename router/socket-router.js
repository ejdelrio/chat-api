const socketio = require('socket.io');
const debug = require('debug')('giggle: Socket Router');

module.exports = server => {

  const websocket = socketio(server);


  websocket.on('connection', (socket) => {
    console.log('__SOCKET_CONNECTION__: ', socket.id);

    socket.on('showTyping', data => {
      console.log(data)
      websocket.sockets.emit(`${data.hubID}-showTyping`, data.userName);
    })
  });
  return websocket;
};
