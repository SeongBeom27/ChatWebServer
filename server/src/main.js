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

    if (message.recepient == 'ALL') {
      // 나를 제외한 모든 클라이언트에게 메시지 전달
      console.dir(
        '나를 제외한 모든 클라이언트에게 message 이벤트를 전송합니다.',
      );
      socket.broadcast.emit('message', message);
    } else {
      // commnad 속성으로 1:1 채팅과 그룹 채팅 구별
      if (message.command == 'chat') {
        if (login_ids[message.recepient]) {
          // 연결되어있는 소켓들 중에 존재하는 socket id 대상의 socket을 가져와서 emit을 통하여 송신
          socket.broadcast
            .to(login_ids[message.recepient])
            .emit('message', message);

          // 응답 메시지 전송
          sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
        }
      } else if (message.command == 'groupchat') {
        console.log('group chat ');

        io.sockets.in(message.roomId).emit('message', message);
        // io.sockets.in(message.recepient).emit('message', message);
        // ...

        // 응답 메시지 전송
        sendResponse(
          socket,
          'message',
          '200',
          '방 [' +
            message.recepient +
            '의 모든 사용자들에게 메시지를 전송했습니다',
        );
      }
    }
  });

  socket.on('room', (room) => {
    if (room.command == 'create') {
      console.log('create room : ', room);

      // 방 Create
      // join : 방이 없을 경우 만들고 참여, 방이 있을 경우 참여
      socket.join(room.roomId);

      sendResponse(socket, 'room', '200', '새로운 방에 입장했습니다.');
    } else if (room.command == 'join') {
      console.log('join room : ', room);

      // 방 Join
      socket.join(room.roomId);

      // 응답 메시지 전송
      sendResponse(socket, 'room', '200', '기존 방에 입장했습니다.');
    } else if (room.command == 'leave') {
      console.log('leave room : ', room);

      // 방 Leave
      socket.leave(room.roomId);

      // 응답 메시지 전송
      sendResponse(socket, 'room', '200', '방에서 나갔습니다.');
    }
  });

  socket.on('logout', (logout) => {
    console.log('logout 이벤트를 받았습니다.');
    console.dir(logout);

    // 연결 종료
    socket.disconnect();

    // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
    delete login_ids[logout.id];

    console.log(
      '접속한 클라이언트 ID 갯수 : %d',
      Object.keys(login_ids).length,
    );
    // 응답 메시지 전송
    sendResponse(socket, 'logout', '200', '로그아웃 되었습니다.');
  });
});

// 클라이언트에 처리 상태를 알려주기 위해 정의한 함수
// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
  var statusObj = { command: command, code: code, message: message };
  socket.emit('response', statusObj);
}
