const socketio = require('socket.io');
const debug = require('debug')('giggle: Socket Router');

module.exports = server => {

  const websocket = socketio(server);


  websocket.on('connection', (socket) => {
    console.log('__SOCKET_CONNECTION__: ', socket.id);

    socket.on('sendTyping', data => {
      let {convoNode} = data;
      if(convoNode) websocket.sockets.emit(`showTyping-${convoNode.convoHubID}`, data);
    })
  });
  return websocket;
};
