import { canvasCals } from './canvas-data.mjs';

class Player {
  constructor({ x, y, w = 30, h = 30, score = 0, id, main }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.score = score;
    this.movementDirection = {};
    this.id = id;
    this.isMain = main;
  }

  draw(context, coin, imgObj, currPlayers) {
    const currDir = Object.keys(this.movementDirection).filter(dir => this.movementDirection[dir]);
    currDir.forEach(dir => this.movePlayer(dir, 5));

    if (this.isMain) {
      context.font = `13px 'Press Start 2P'`;
      context.fillText(this.calculateRank(currPlayers), 560, 32.5);

      context.drawImage(imgObj.mainPlayerArt, this.x, this.y);
    } else {
      context.drawImage(imgObj.otherPlayerArt, this.x, this.y);
    }

    if (this.collision(coin)) {
      coin.destroyed = this.id;
    }
  }

  moveDir(direction) {
    this.movementDirection[direction] = true;
  }

  stopDir(direction) {
    this.movementDirection[direction] = false;
  }

  movePlayer(dir, speed) {
    if (dir === 'up') this.y - speed >= canvasCals.playFieldMinY ? this.y -= speed : this.y -= 0;
    if (dir === 'down') this.y + speed <= canvasCals.playFieldMaxY ? this.y += speed : this.y += 0;
    if (dir === 'left') this.x - speed >= canvasCals.playFieldMinX ? this.x -= speed : this.x -= 0;
    if (dir === 'right') this.x + speed <= canvasCals.playFieldMaxX ? this.x += speed : this.x += 0;
  }

  collision(item) {
    if (
      (this.x < item.x + item.w &&
        this.x + this.w > item.x &&
        this.y < item.y + item.h &&
        this.y + this.h > item.y)
    )
      return true;
  }

  calculateRank(arr) {
    const sortedScores = arr.sort((a, b) => b.score - a.score);
    const mainPlayerRank = this.score === 0 ? arr.length : (sortedScores.findIndex(obj => obj.id === this.id) + 1);

    return `Rank: ${mainPlayerRank} / ${arr.length}`
  }
}

export default Player;
