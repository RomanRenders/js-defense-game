const canvas = document.getElementById("canvas1");
const cxt = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 100000;
let chosenDefender = 1;

const gameGrid = [];
const defenders = [];
const enemies = []; // HERE'S WHERE ENEMIES GET PUSHED
const enemyPositions = [];
const projectiles = [];
const resources = [];

// mouse
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false
};
canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

// game board
const controlsBar = {
  width: canvas.width,
  height: cellSize
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      cxt.strokeStyle = "white"; // so that mouse boxes are white
      cxt.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}

createGrid();

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

// TODO:
// projectiles
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 2;
    this.power = 5;
    this.speed = 5;
  }

  update() {
    this.x += this.speed;
  }
  draw() {
    cxt.fillStyle = "black";
    cxt.beginPath();
    cxt.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    cxt.fill();
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

// defenders
const defender1 = new Image();
defender1.src = "/src/images/fattySheet.png";
const defender2 = new Image();
defender2.src = "/src/images/zarifSheet.png";

class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.shooting = false;
    this.health = 100;

    this.shootNow = false;

    this.projectiles = [];
    this.timer = 0;

    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 106;
    this.spriteHeight = 130;
    this.minFrame = 0;
    this.maxFrame = 3;
    this.chosenDefender = chosenDefender;
  }
  draw() {
    cxt.fillStyle = "white";
    cxt.font = "30px Orbitron";
    cxt.fillText(Math.floor(this.health), this.x + 15, this.y + 30);

    if (this.chosenDefender === 1) {
      cxt.drawImage(
        defender1,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (this.chosenDefender === 2) {
      cxt.drawImage(
        defender2,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  update() {
    /*if (frame % 6 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      if (this.frameX === 3) this.shootNow = true;
    } */
    if (this.chosenDefender === 1) {
      if (frame % 6 === 0) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
        if (this.frameX === 3) this.shootNow = true;
      }
      if (this.shooting && this.shootNow) {
        projectiles.push(new Projectile(this.x + 60, this.y + 60));
        this.shootNow = false;
      }
      if (this.shooting) {
        this.minFrame = 0;
        this.maxFrame = 3;
      } else {
        this.minFrame = 0;
        this.maxFrame = 0;
        return;
      }
    } else if (this.chosenDefender === 2) {
      if (frame % 4 === 0) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
        if (this.frameX === 3) this.shootNow = true;
      }
      if (this.shooting && this.shootNow) {
        projectiles.push(new Projectile(this.x + 60, this.y + 60)); // HERE IS WHERE PROJECTILES ARE PUSHED
        this.shootNow = false;
      }
      if (this.shooting) {
        this.minFrame = 0;
        this.maxFrame = 3;
      } else {
        this.minFrame = 0;
        this.maxFrame = 0;
      }
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);

        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}

const card1 = {
  x: 10,
  y: 10,
  width: 70,
  height: 85
};

const card2 = {
  x: 90,
  y: 10,
  width: 70,
  height: 85
};

function chooseDefender() {
  let card1stroke = "black";
  let card2stroke = "black";

  if (collision(mouse, card1) && mouse.clicked) {
    chosenDefender = 1;
  } else if (collision(mouse, card2) && mouse.clicked) {
    chosenDefender = 2;
  }
  if (chosenDefender === 1) {
    card1stroke = "gold";
    card2stroke = "black";
  } else if (chosenDefender === 2) {
    card1stroke = "black";
    card2stroke = "gold";
  } else {
    card1stroke = "black";
    card2stroke = "black";
  }

  cxt.lineWidth = 1;
  cxt.fillStyle = "rgba(0, 0, 0, 0.2"; // dark blue

  cxt.fillRect(card1.x, card1.y, card1.width, card1.height);
  cxt.strokeStyle = card1stroke;
  cxt.strokeRect(card1.x, card1.y, card1.width, card1.height);
  cxt.drawImage(defender2, 10, 0, 100, 110, 80, 5, 194 / 2, 194 / 2);

  cxt.fillRect(card2.x, card2.y, card2.width, card2.height);
  cxt.strokeStyle = card2stroke;
  cxt.strokeRect(card2.x, card2.y, card2.width, card2.height);
  cxt.drawImage(defender1, 10, 0, 100, 110, 5, 5, 194 / 2, 194 / 2);
}

// Floating Messages
const floatingMessages = [];
class floatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }
  update() {
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.03) this.opacity -= 0.03;
  }
  draw() {
    cxt.globalAlpha = this.opacity;
    cxt.fillStyle = this.color;
    cxt.font = this.size + "px Orbitron";
    cxt.fillText(this.value, this.x, this.y);
    cxt.globalAlpha = 1;
  }
}
function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update();
    floatingMessages[i].draw();
    if (floatingMessages[i].lifeSpan >= 50) {
      floatingMessages.splice(i, 1);
      i--;
    }
  }
}

// enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "/src/images/carterSheet.png";
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = "/src/images/dionSheet.png";
enemyTypes.push(enemy2);

class Enemy {
  constructor(verticalPosition) {
    // to add ^^ speed, maxHealth
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    //this.speed = Math.random() * 0.2 + 0.4;
    this.speed = 1;

    this.movement = this.speed;
    //this.enemy1movement = 1;
    //this.enemy2movement = 3;

    this.health = 100;
    this.maxHealth = this.health;

    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 2;

    this.spriteWidth = 104;
    this.spriteHeight = 130; // CARTER DEMENSIONS
  }

  update() {
    if (this.enemyType === enemyTypes[0]) {
      this.x -= this.movement; // different speed for each enemy
      if (frame % 10 === 0) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
      }
    } else if (this.enemyType === enemyTypes[1]) {
      this.x -= this.movement * 1.5;
      if (frame % 5 === 0) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
      }
    }
  }

  draw() {
    cxt.fillStyle = "white";
    cxt.font = "30px Orbitron";
    cxt.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    cxt.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10;
      floatingMessages.push(
        new floatingMessage(
          "+" + gainedResources,
          enemies[i].x,
          enemies[i].y,
          30,
          "gold"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + gainedResources, 470, 85, 30, "gold")
      );
      numberOfResources += gainedResources;
      score += gainedResources;
      const findThisIndex = enemyPositions.indexOf(enemies[i].y);
      enemyPositions.splice(findThisIndex, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;

    enemies.push(new Enemy(verticalPosition)); // HERE'S WHERE ENEMIES GET INSTANTIATED
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50;
  }
}

// resources
const kfcBucket = new Image();
kfcBucket.src = "/src/images/kfcBucket2.png";

const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];

    this.spriteWith = 104;
    this.spriteHeight = 130;
  }
  draw() {
    cxt.fillStyle = "black";
    cxt.font = "20px Orbitron";
    cxt.fillText(this.amount, this.x + 15, this.y + 25);

    cxt.drawImage(kfcBucket, this.x, this.y, this.width, this.height);
  }
}

function handleResources() {
  if (frame % 200 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount;
      floatingMessages.push(
        new floatingMessage(
          "+" + resources[i].amount,
          resources[i].x,
          resources[i].y,
          30,
          "black"
        )
      );
      floatingMessages.push(
        new floatingMessage("+" + resources[i].amount, 470, 85, 30, "black")
      );
      resources.splice(i, 1);
      i--;
    }
  }
}

// utilities
function handleGameStatus() {
  cxt.fillStyle = "gold";
  cxt.font = "30px Orbitron";
  cxt.fillText("Score:" + score, 180, 40);
  cxt.fillText("Resources:" + numberOfResources, 180, 80);
  if (gameOver) {
    cxt.fillStyle = "purple";
    cxt.font = "90px Orbitron";
    cxt.fillText("GAME OVER", 135, 330);
  }
  if (score >= winningScore && enemies.length === 0) {
    cxt.fillStyle = "black";
    cxt.font = "60px Orbitron";
    cxt.fillText("LEVEL COMPLETE", 130, 300);
    cxt.font = "30px Orbitron";
    cxt.fillText("You win with " + score + " points!", 134, 340);
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
      return;
    }
  }
  const defenderCost = 100;
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderCost;
  } else {
    floatingMessages.push(
      new floatingMessage("need more resources", mouse.x, mouse.y, 15, "blue")
    );
  }
});

function animate() {
  cxt.clearRect(0, 0, canvas.width, canvas.height);
  cxt.fillStyle = "blue";
  cxt.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleResources();
  handleProjectiles();
  handleEnemies();
  chooseDefender();
  handleGameStatus();
  handleFloatingMessages();
  frame++;
  if (!gameOver) requestAnimationFrame(animate);
}

animate();

function collision(first, second) {
  //  THIS IS THE COLLISION FUNCTION (HARD TO FIND)
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
