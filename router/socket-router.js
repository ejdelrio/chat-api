const socketio = require('socket.io');
const debug = require('debug')('giggle: Socket Router');

module.exports = server => {

  const websocket = socketio(server);


  websocket.on('connection', (socket) => {
    console.log('__SOCKET_CONNECTION__: ', socket.id);

    let intervalBoolean = false;
    let timer = 3;

    socket.on('clearTimer', () => timer = 0);
    socket.on('sendTyping', data => {

      timer = 3;


      if(!intervalBoolean) {

        intervalBoolean = true;
        let {convoNode} = data;
        data.seeTyping = true;
        if(convoNode) websocket.sockets.emit(`showTyping-${convoNode.convoHubID}`, data);

        let countDown = setInterval(() => {
          if (timer > 0) timer -= 1;
          if (timer === 0) {
            intervalBoolean = false;
            timer = 3;
            data.seeTyping = false;
            if(convoNode) websocket.sockets.emit(`showTyping-${convoNode.convoHubID}`, data);
            clearInterval(countDown);
          }
        }, 1000);

      }
    })
  });
  return websocket;
};
