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

let login_ids = {};

// conection 이벤트 처리 함수 추가
io.on('connection', (socket) => {
  console.log('connect');

  socket.on('login', (login) => {
    console.log('login 이벤트를 받았습니다.');
    console.dir(login);

    // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
    console.log('접속한 소켓의 id:', socket.id);
    login_ids[login.id] = socket.id;
    socket.login_id = login.id;

    console.log(
      '접속한 클라이언트 ID 갯수 : %d',
      Object.keys(login_ids).length,
    );

    // 응답 메시지 전송
    sendResponse(socket, 'login', '200', '로그인되었습니다');
  });

  // 'message' 이벤트를 받았을 때의 처리
  socket.on('message', function (message) {
    console.log('message 이벤트를 받았습니다.');
    console.dir(message);

    if (message.recepient == 'ALL') {
      // 나를 제외한 모든 클라이언트에게 메시지 전달
      console.dir(
        '나를 제외한 모든 클라이언트에게 message 이벤트를 전송합니다.',
      );
      socket.broadcast.emit('message', message);
    } else {
      // 일대일 채팅 대상에게 메시지 전달
      if (login_ids[message.recepient]) {
        // 연결되어있는 소켓들 중에 존재하는 socket id 대상의 socket을 가져와서 emit을 통하여 송신
        socket.broadcast
          .to(login_ids[message.recepient])
          .emit('message', message);

        // 응답 메시지 전송
        sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
      } else {
        // 응답 메시지 전송
        sendResponse(
          socket,
          'login',
          '404',
          '상대방의 로그인 ID를 찾을 수 없습니다.',
        );
      }
    }
  });
});

// 클라이언트에 처리 상태를 알려주기 위해 정의한 함수
// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
  var statusObj = { command: command, code: code, message: message };
  socket.emit('response', statusObj);
}
