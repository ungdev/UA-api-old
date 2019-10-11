const socketIo = require('socket.io');
const live = require('./api/live');

module.exports = (http, sequelize, models) => {
  const io = socketIo(http);

  io.locals = {
    db: sequelize,
    models,
  };

  io.on('connection', (socket) => {
    socket.app = io;

    live(socket);
  });

  return io;
};
