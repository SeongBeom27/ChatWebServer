import koa from 'koa';
const app = new koa();
const server = require('http').Server(app.callback());
const io = require('socket.io')(server);
const port = 8081;

server.listen(process.env.PORT || port, () => {
  console.log(`app run at : http://127.0.0.1:${port}`);
});

io.on('connection', (socket) => {
  Console.log('socket initialization completed');
  socket.on('say', (data) => {
    Console.log(data, 'received information');
    Socket.emit('message', { hello: 'who are you' });
  });
});
