const socketIo = require('socket.io');

module.exports = (http, sequelize, models) => {
  const io = socketIo(http);

  io.locals = {
    db: sequelize,
    models,
  };

  io.on('connection', (socket) => {
    socket.app = io;

    require('./api/live')(socket);
  });

  return io;
};
