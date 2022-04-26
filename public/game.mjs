import Player from './Player.mjs';
import controls from './controls.mjs';
import Collectible from './Collectible.mjs';
import { canvasCals, generateStartPos } from './canvas-data.mjs';

const loadImage = src => {
    const img = new Image();
    img.src = src;
    return img;
}

const bronzeCoinArt = loadImage('https://cdn.freecodecamp.org/demo-projects/images/bronze-coin.png');
const silverCoinArt = loadImage('https://cdn.freecodecamp.org/demo-projects/images/silver-coin.png');
const goldCoinArt = loadImage('https://cdn.freecodecamp.org/demo-projects/images/gold-coin.png');
const mainPlayerArt = loadImage('https://cdn.freecodecamp.org/demo-projects/images/main-player.png');
const otherPlayerArt = loadImage('https://cdn.freecodecamp.org/demo-projects/images/other-player.png');

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
let currPlayers = [];
let item;
let tick;

socket.on('init', (id, players, coin) => {
    cancelAnimationFrame(tick);

    const mainPlayer = new Player({
        x: generateStartPos(canvasCals.playFieldMinX, canvasCals.playFieldMaxX),
        y: generateStartPos(canvasCals.playFieldMinY, canvasCals.playFieldMaxY),
        id: id,
        main: true
    });

    controls(mainPlayer, socket);

    socket.emit('new-player', mainPlayer);

    socket.on('new-player-joined', obj => {
        const playerIds = currPlayers.map(player => player.id);
        if (!playerIds.includes(obj.id)) currPlayers.push(new Player(obj));
    });

    socket.on('move-player', (id, dir, pos) => {
        const movingPlayer = currPlayers.find(player => player.id === id);
        movingPlayer.moveDir(dir);
        movingPlayer.x = pos.x;
        movingPlayer.y = pos.y;
    });

    socket.on('new-coin', newCoin => {
        item = new Collectible(newCoin);
    });

    socket.on('update-player', playerObj => {
        const scoringPlayer = currPlayers.find(obj => obj.id === playerObj.id);
        scoringPlayer.score = playerObj.score;
    });

    socket.on('stop-player', (id, dir, pos) => {
        const stoppingPlayer = currPlayers.find(player => player.id === id);
        stoppingPlayer.stopDir(dir);
        stoppingPlayer.x = pos.x;
        stoppingPlayer.y = pos.y;
    });

    socket.on('remove-player', id => {
        currPlayers = currPlayers.filter(player => player.id !== id);
    });

    currPlayers = players.map(val => new Player(val)).concat(mainPlayer);
    item = new Collectible(coin);

    draw();
});

const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color
    context.fillStyle = '#220';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Create border for play field
    context.strokeStyle = 'white';
    context.strokeRect(canvasCals.playFieldMinX, canvasCals.playFieldMinY, canvasCals.playFieldWidth, canvasCals.playFieldHeight);

    // Controls text
    context.fillStyle = 'white';
    context.font = `13px 'Press Start 2P'`;
    context.textAlign = 'center';
    context.fillText('Controls: WASD', 100, 32.5);

    // Game title
    context.font = `16px 'Press Start 2P'`;
    context.fillText('Coin Race', canvasCals.canvasWidth / 2, 32.5);

    // Calculate score and draw players each frame
    currPlayers.forEach(player => {
        player.draw(context, item, { mainPlayerArt, otherPlayerArt }, currPlayers);
    });

    // Draw current coin
    item.draw(context, { bronzeCoinArt, silverCoinArt, goldCoinArt });

    // Remove destroyed coin
    if (item.destroyed) {
        socket.emit('destroy-item', { playerId: item.destroyed, coinValue: item.value, coinId: item.id });
    }

    // if (endGame) {
    //     context.fillStyle = 'white';
    //     context.font = `13px 'Press Start 2P'`
    //     context.fillText(`You ${endGame}! Restart and try again.`, canvasCals.canvasWidth / 2, 80);
    // }

    // if (!endGame) 
    tick = requestAnimationFrame(draw);
}