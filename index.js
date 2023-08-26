const { Client, GatewayIntentBits  } = require('discord.js');
const path = require("path")
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const publicDirectoryPath = path.join(__dirname, './web');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

require("dotenv")

  //WEB SERVER
// Endpoint API
let apiData = null;

// Middleware để nhận dữ liệu từ handleAPIRequest
app.use((req, res, next) => {
  req.apiData = apiData;
  next();
});

// API endpoint để trả về thông tin
app.get('/api/info', (req, res) => {
  res.json(req.apiData);
});


// Gán dữ liệu từ handleAPIRequest vào biến apiData
function handleAPIRequest(data) {
  apiData = data;
}

// Khởi tạo WebSocket client
const wsClient = new WebSocket('ws://localhost:443');

// Khi nhận được thông tin từ WebSocket server
wss.on('connection', (ws) => {
  console.log('A client connected');
});

wsClient.on('message', message => {
  const data = JSON.parse(message);
  console.log('Received updated API data:', data);
  // Thực hiện xử lý thông tin mới từ WebSocket server
});

// Gửi thông tin qua WebSocket khi có thay đổi
function sendAPIUpdate(data) {
  // Chuyển đổi dữ liệu sang chuỗi JSON và gửi đi
  wsClient.send(JSON.stringify(data));
}

// Khi client đã sẵn sàng, gọi hàm handleAPIRequest
client.once('ready', () => {
  let users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  function toFancyNum(users) {
    return String(users).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  setInterval(() => {
    const apiData = {
      name: client.user.username,
      guilds: client.guilds.cache.size,
      users: toFancyNum(users),
    };
    handleAPIRequest(apiData);
    sendAPIUpdate(apiData); // Gửi thông tin API ban đầu qua WebSocket khi client sẵn sàng
  }, 1000);
});

// Gán dữ liệu từ handleAPIRequest vào biến apiData và gửi thông tin qua WebSocket khi có thay đổi
function handleAPIRequest(data) {
  apiData = data;
  sendAPIUpdate(data);
}
// Đăng nhập bot bằng token của bạn
client.login(process.env.TOKEN);

app.use(express.static(publicDirectoryPath));
const listener = server.listen(443, function() {
    console.log(`Your app is listening on port ` + listener.address().port);
  });