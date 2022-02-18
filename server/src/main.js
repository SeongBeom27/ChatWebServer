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

// conection 이벤트 처리 함수 추가
io.on('connection', (socket) => {
  console.log('connect');

  socket.on('message', (data) => {
    console.log('data 이벤트를 받았습니다.');
    // console.dir(data);

    if (data.recepient == 'ALL') {
      // 나를 포함한 모든 클라이언트에게 메시지 전달
      console.dir('나를 포함한 모든 클라이언트에게 data 이벤트를 전송합니다.');
      // 서버에 연결된 모든 클라이언트의 소켓들이 sockets에 들어있음
      io.sockets.emit('message', data);
    }
  });
});
