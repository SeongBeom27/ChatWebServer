import koa from 'koa';
const cors = require('@koa/cors');

const app = new koa();
const server = require('http').Server(app.callback());
const io = require('socket.io')(server, { cors: { origin: '*' } });
const port = 8081;

app.use(cors());

server.listen(process.env.PORT || port, () => {
  console.log(`app run at : http://127.0.0.1:${port}`);
});

io.on('connection', (socket) => {
  console.log('socket initialization completed');
  socket.on('say', (data) => {
    console.log(data, 'received information');
    socket.emit('news', { hello: 'hey!!! you~!~!~!~' });
  });
});
