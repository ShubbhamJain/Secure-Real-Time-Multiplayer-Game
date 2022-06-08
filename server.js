require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
// app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For enabling user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

let players = [];

const generateStartPos = (min, max) => {
  return Math.floor((Math.floor(Math.random() * (max - min + 1)) + min) / 5) * 5;
}

const generateCoin = () => {
  const coinValue = [1, 2, 3];
  const canvasWidth = 640;
  const canvasHeight = 480;
  const playFieldMinX = (canvasWidth / 2) - (canvasWidth - 10) / 2;
  const playFieldMinY = (canvasHeight / 2) - (canvasHeight - 100) / 2;
  const playFieldMaxX = (canvasWidth - 30) - 5;
  const playFieldMaxY = (canvasHeight - 30) - 5;

  return {
    x: generateStartPos(playFieldMinX, playFieldMaxX),
    y: generateStartPos(playFieldMinY, playFieldMaxY),
    value: coinValue[Math.floor(Math.random() * 3)],
    id: Date.now()
  };
}

const io = socket(server);

io.on('connection', (socket) => {
  const coinValue = generateCoin();
  socket.emit('init', socket.id, players, coinValue);

  socket.on('new-player', mewPlayer => {
    players.push(mewPlayer);
    socket.broadcast.emit('new-player-joined', mewPlayer);
  });

  socket.on('move-player', (dir, pos) => {
    players.forEach(player => {
      if (player.id === socket.id) {
        player.movementDirection[dir] = true;
        player.x = pos.x;
        player.y = pos.y;
      }
    });

    io.emit('move-player', socket.id, dir, pos);
  });

  socket.on('destroy-item', obj => {
    let scoringPlayer = {};
    players.forEach(player => {
      if (player.id === obj.playerId) {
        player.score += obj.coinValue;
        scoringPlayer = player;
      }
    });

    io.emit('update-player', scoringPlayer);

    const coinValue = generateCoin();
    socket.emit('new-coin', coinValue);
  });

  socket.on('stop-player', (dir, pos) => {
    players.forEach(player => {
      if (player.id === socket.id) {
        player.movementDirection[dir] = true;
        player.x = pos.x;
        player.y = pos.y;
      }
    });

    io.emit('stop-player', socket.id, dir, pos);
  });

  socket.on('disconnect', () => {
    console.log(`disconnection ${socket.id}`);
    socket.broadcast.emit('remove-player', socket.id);
    players = players.filter(player => player.id !== socket.id);
  })
});

module.exports = app; // For testing
