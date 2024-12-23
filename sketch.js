// 在文件開頭定義全局變量
let player1, player2;
let player1Sprites = {};
let player2Sprites = {};
let userStartAudio = false;
let player1Health = 100;
let player2Health = 100;
let fireballs = [];  // 存儲所有的火焰
let fireballImg;     // 火焰圖片
let player1Acting = false;
let player2Acting = false;
let backgroundX = 0;
let gameOver = false;
let quizActive = false;
let currentQuestion = '';
let correctAnswer = '';
let userAnswer = '';
let currentOptions = [];
let particles = [];  // 用於背景粒子效果
let time = 0;  // 用於動態效果

// 在文件開頭添加預加載函數
function preload() {
  // 載入火焰圖片
  fireballImg = loadImage('fireball.png');
  
  // 預載入玩家1的圖片
  player1Sprites = {
    idle: {
      img: loadImage('player1_walk.png'),
      width: 75,
      height: 118,
      frames: 8,
      currentFrame: 3
    },
    attack: {
      img: loadImage('player1_jump.png'),
      width: 120,
      height: 100,
      frames: 5,
      currentFrame: 4
    },
    defend: {
      img: loadImage('player1_attack.png'),
      width: 132,
      height: 119,
      frames: 9,
      currentFrame: 5
    }
  };
  
  // 預載入玩家2的圖片
  player2Sprites = {
    idle: {
      img: loadImage('player2_walk.png'),
      width: 53,
      height: 105,
      frames: 6,
      currentFrame: 0
    },
    attack: {
      img: loadImage('player2_walk.png'),
      width: 71,
      height: 101,
      frames: 7,
      currentFrame: 0
    },
    defend: {
      img: loadImage('player2_attack.png'),
      width: 113,
      height: 124,
      frames: 7,
      currentFrame: 0
    }
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化玩家1
  player1 = {
    x: width * 0.2,
    y: height * 0.7,
    currentSprite: 'idle',
    direction: 1,
    attackBox: {  // 添加攻擊圍
      width: 60,
      height: 50
    }
  };
  
  // 初始化玩家2
  player2 = {
    x: width * 0.8,
    y: height * 0.7,
    currentSprite: 'idle',
    direction: -1,
    attackBox: {  // 添加攻擊範圍
      width: 60,
      height: 50
    }
  };
  
  // 美化開始按鈕
  let startButton = createButton('開始遊戲');
  startButton.position(width/2 - 60, height/2 + 150);
  startButton.style('width', '120px');
  startButton.style('height', '40px');
  startButton.style('background-color', '#4CAF50');
  startButton.style('color', 'white');
  startButton.style('border', 'none');
  startButton.style('border-radius', '5px');
  startButton.style('font-size', '18px');
  startButton.style('cursor', 'pointer');
  
  // 添加按鈕懸停效果
  startButton.mouseOver(() => {
    startButton.style('background-color', '#45a049');
  });
  startButton.mouseOut(() => {
    startButton.style('background-color', '#4CAF50');
  });
  
  startButton.mousePressed(() => {
    userStartAudio = true;
    getAudioContext().resume();
    startButton.hide();
  });
  
  // 初始化背景粒子
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(2, 5),
      speed: random(0.5, 2)
    });
  }
}

// 添加火焰類
class Fireball {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = 10;
    this.width = 40;
    this.height = 40;
    this.active = true;
  }
  
  update() {
    this.x += this.speed * this.direction;
    // 如果火焰超出畫面則移除
    if (this.x < 0 || this.x > width) {
      this.active = false;
    }
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);
    image(fireballImg, -this.width/2, -this.height/2, this.width, this.height);
    pop();
  }
  
  checkHit(player) {
    let fireballRight = this.x + this.width/2;
    let fireballLeft = this.x - this.width/2;
    let playerRight = player.x + 30;
    let playerLeft = player.x - 30;
    
    return (fireballRight >= playerLeft && fireballLeft <= playerRight);
  }
}

// 添加碰撞檢測函數
function checkPlayerCollision(player1X, player2X) {
  const PLAYER_WIDTH = 60;  // 角色碰撞箱寬度
  return Math.abs(player1X - player2X) < PLAYER_WIDTH;
}

// 修改按鍵控制函數
function keyPressed() {
  // 玩家1控制 (W, S, D)
  if (!player1Acting) {
    if (key === 'w' || key === 'W') {
      player1Acting = true;
      player1.currentSprite = 'attack';
      let attackX = player1.x + (50 * player1.direction);
      fireballs.push(new Fireball(attackX, player1.y, player1.direction));
      
      // 添加自動前進動畫
      let moveDistance = 0;
      let moveInterval = setInterval(() => {
        if (moveDistance < 100) {
          let newX = player1.x + 5 * player1.direction;
          if (!checkPlayerCollision(newX, player2.x)) {
            player1.x = newX;
          }
          moveDistance += 5;
        }
      }, 30);
      
      setTimeout(() => {
        player1.currentSprite = 'idle';
        player1Acting = false;
        clearInterval(moveInterval);
      }, 500);
    }
    
    if (key === 's' || key === 'S') {
      player1Acting = true;
      player1.currentSprite = 'defend';
      
      // 防禦時也稍微向前移動
      let moveDistance = 0;
      let moveInterval = setInterval(() => {
        if (moveDistance < 50) {  // 防禦時移動較少
          let newX = player1.x + 3 * player1.direction;
          if (!checkPlayerCollision(newX, player2.x)) {
            player1.x = newX;
          }
          moveDistance += 3;
        }
      }, 30);
      
      setTimeout(() => {
        player1.currentSprite = 'idle';
        player1Acting = false;
        clearInterval(moveInterval);
      }, 500);
    }
  }
  
  // 移動不受作狀態影響
  if (key === 'd' || key === 'D') {
    let newX = player1.x + 50 * player1.direction;
    if (!checkPlayerCollision(newX, player2.x)) {
      player1.x = newX;
    }
  }
  
  // 玩家2控制 (上箭頭, 下箭頭, 右箭頭)
  if (!player2Acting) {
    if (keyCode === UP_ARROW) {
      player2Acting = true;
      player2.currentSprite = 'attack';
      let attackX = player2.x + (50 * player2.direction);
      fireballs.push(new Fireball(attackX, player2.y, player2.direction));
      
      // 添加自動前進動畫
      let moveDistance = 0;
      let moveInterval = setInterval(() => {
        if (moveDistance < 100) {
          let newX = player2.x + 5 * player2.direction;
          if (!checkPlayerCollision(player1.x, newX)) {
            player2.x = newX;
          }
          moveDistance += 5;
        }
      }, 30);
      
      setTimeout(() => {
        player2.currentSprite = 'idle';
        player2Acting = false;
        clearInterval(moveInterval);
      }, 500);
    }
    
    if (keyCode === DOWN_ARROW) {
      player2Acting = true;
      player2.currentSprite = 'defend';
      
      // 防禦時也稍微向前移動
      let moveDistance = 0;
      let moveInterval = setInterval(() => {
        if (moveDistance < 50) {
          let newX = player2.x + 3 * player2.direction;
          if (!checkPlayerCollision(player1.x, newX)) {
            player2.x = newX;
          }
          moveDistance += 3;
        }
      }, 30);
      
      setTimeout(() => {
        player2.currentSprite = 'idle';
        player2Acting = false;
        clearInterval(moveInterval);
      }, 500);
    }
  }
  
  // 移動不受動作狀態影響
  if (keyCode === RIGHT_ARROW) {
    let newX = player2.x + 50 * player2.direction;
    if (!checkPlayerCollision(newX, player1.x)) {
      player2.x = newX;
    }
  }
}

function draw() {
  // 檢查是否已啟動遊戲
  if (!userStartAudio) {
    // 繪製開始畫面背景
    background(35, 35, 70);  // 深藍色背景
    
    // 繪製淡江大學logo位置
    push();
    fill(255);
    textAlign(CENTER);
    textSize(40);
    text('淡江大學', width/2, height/3 - 50);
    
    // 繪製教科系名稱
    textSize(36);
    text('教育科技學系', width/2, height/3);
    
    // 繪製英文名稱
    textSize(24);
    text('Department of Educational Technology', width/2, height/3 + 40);
    
    // 繪製遊戲標題
    textSize(32);
    fill(255, 215, 0);  // 金色
    text('格鬥遊戲', width/2, height/2);
    
    // 繪製操作說明
    textSize(20);
    fill(200, 200, 200);
    text('玩家1: W-發射火球, S-防禦, D-移動', width/2, height/2 + 80);
    text('玩家2: ↑-發射火球, ↓-防禦, →-移動', width/2, height/2 + 110);
    
    // 繪製裝飾線條
    stroke(100, 100, 200);
    strokeWeight(2);
    line(width/2 - 200, height/3 + 60, width/2 + 200, height/3 + 60);
    line(width/2 - 150, height/2 + 40, width/2 + 150, height/2 + 40);
    
    textSize(24);
    noStroke();
    fill(255);
    text('請點擊按鈕開始遊戲', width/2, height/2 - 50);
    return;
  }
  
  // 計算背景位置（根據兩個角色的平均位置）
  let targetX = -(player1.x + player2.x) / 4;  // 除以4來減緩背景移動速度
  backgroundX = lerp(backgroundX, targetX, 0.1);  // 平滑過渡
  
  // ���製漸層背景
  push();
  translate(backgroundX, 0);
  
  // 繪製多個背景單元
  for (let i = -1; i <= 1; i++) {
    // 基礎背景 - 使用漸層
    let gradient = drawingContext.createLinearGradient(
      i * width, 0, 
      i * width, height
    );
    gradient.addColorStop(0, '#1a1a2e');  // 深藍色頂部
    gradient.addColorStop(1, '#16213e');  // 較亮的底部
    drawingContext.fillStyle = gradient;
    rect(i * width, 0, width, height);
    
    // 添加裝飾性圖案
    stroke(100, 100, 150, 50);
    strokeWeight(1);
    
    // 繪製網格
    for (let x = 0; x < width; x += 50) {
      line(i * width + x, 0, i * width + x, height);
    }
    for (let y = 0; y < height; y += 50) {
      line(i * width, y, i * width + width, y);
    }
    
    // 地板設計
    let floorGradient = drawingContext.createLinearGradient(
      i * width, height * 0.8,
      i * width, height
    );
    floorGradient.addColorStop(0, '#2a4858');  // 深色頂部
    floorGradient.addColorStop(1, '#1f3541');  // 較暗的底部
    drawingContext.fillStyle = floorGradient;
    rect(i * width, height * 0.8, width, height * 0.2);
    
    // 地板反光效果
    for (let x = 0; x < width; x += 100) {
      stroke(255, 255, 255, 20);
      line(i * width + x, height * 0.8, i * width + x + 50, height);
    }
    
    // 添加環境光暈
    for (let k = 0; k < 3; k++) {
      let x = i * width + width * (k + 1) / 4;
      let glowGradient = drawingContext.createRadialGradient(
        x, height * 0.3, 0,
        x, height * 0.3, height * 0.6
      );
      glowGradient.addColorStop(0, 'rgba(100, 149, 237, 0.1)');  // 淡藍色光暈
      glowGradient.addColorStop(1, 'rgba(100, 149, 237, 0)');
      drawingContext.fillStyle = glowGradient;
      drawingContext.fillRect(i * width, 0, width, height);
    }
  }
  pop();
  
  // 更新和繪製背景粒子
  push();
  for (let particle of particles) {
    // 更新粒子位置
    particle.y += particle.speed;
    if (particle.y > height) {
      particle.y = 0;
      particle.x = random(width);
    }
    
    // 繪製粒子
    noStroke();
    fill(255, 255, 255, 50);
    ellipse(particle.x, particle.y, particle.size);
  }
  pop();
  
  // 添加時間效果
  time += 0.01;
  
  // 添加波紋效果
  push();
  stroke(100, 100, 150, 30);
  noFill();
  for (let i = 0; i < 3; i++) {
    let size = (time + i) % 3;
    let alpha = map(size, 0, 3, 100, 0);
    stroke(100, 100, 150, alpha);
    ellipse(width/2, height * 0.8, size * 200);
  }
  pop();
  
  // 更新動畫幀
  for (let state in player1Sprites) {
    let sprite = player1Sprites[state];
    if (player1.currentSprite === state) {
      sprite.currentFrame = (sprite.currentFrame + 0.2) % sprite.frames;
    }
  }
  
  for (let state in player2Sprites) {
    let sprite = player2Sprites[state];
    if (player2.currentSprite === state) {
      if (state === 'attack') {
        // 跳躍動作使用更快的動畫速度
        sprite.currentFrame = (sprite.currentFrame + 0.15) % sprite.frames;
      } else {
        sprite.currentFrame = (sprite.currentFrame + 0.1) % sprite.frames;
      }
    }
  }
  
  // 繪製玩家1
  push();
  translate(player1.x, player1.y);
  scale(player1.direction, 1);
  let p1Sprite = player1Sprites[player1.currentSprite];
  
  // 計算當前幀的位置
  let frameWidth = p1Sprite.width;
  let frameX = Math.floor(p1Sprite.currentFrame) * frameWidth;
  
  if (p1Sprite && p1Sprite.img) {
    image(p1Sprite.img, -p1Sprite.width/2, -p1Sprite.height/2, 
          p1Sprite.width, p1Sprite.height,
          frameX, 0, frameWidth, p1Sprite.height);
  }
  pop();
  
  // 繪製玩家2
  push();
  translate(player2.x, player2.y);
  scale(player2.direction, 1);
  let p2Sprite = player2Sprites[player2.currentSprite];
  
  // 計算當前幀的位置
  frameWidth = p2Sprite.width;
  frameX = Math.floor(p2Sprite.currentFrame) * frameWidth;
  
  if (p2Sprite && p2Sprite.img) {
    image(p2Sprite.img, -p2Sprite.width/2, -p2Sprite.height/2, 
          p2Sprite.width, p2Sprite.height,
          frameX, 0, frameWidth, p2Sprite.height);
  }
  pop();
  
  // 更新繪製所有火焰
  for (let i = fireballs.length - 1; i >= 0; i--) {
    let fireball = fireballs[i];
    fireball.update();
    
    // 檢查火焰是否擊中玩家
    if (fireball.direction > 0 && fireball.checkHit(player2)) {
      player2Health -= 15;  // 將傷害從5改為15
      fireball.active = false;
    } else if (fireball.direction < 0 && fireball.checkHit(player1)) {
      player1Health -= 15;  // 將傷害��5改為15
      fireball.active = false;
    }
    
    if (fireball.active) {
      fireball.draw();
    } else {
      fireballs.splice(i, 1);
    }
  }
  
  // 繪製生命值
  textSize(20);
  fill(255, 0, 0);  // 紅色
  
  // 玩家1生命值
  rect(50, 30, 200, 20);  // 生命值背景
  fill(0, 255, 0);  // 綠色
  rect(50, 30, player1Health * 2, 20);  // 實際生命值
  fill(255);  // 白色
  text('Player 1: ' + player1Health, 50, 25);
  
  // 玩家2生命值
  fill(255, 0, 0);  // 紅色
  rect(width - 250, 30, 200, 20);  // 生命值背景
  fill(0, 255, 0);  // 綠色
  rect(width - 250, 30, player2Health * 2, 20);  // 實際生命值
  fill(255);  // 白色
  text('Player 2: ' + player2Health, width - 250, 25);
  
  // 檢查生命值
  if (!gameOver && (player1Health <= 0 || player2Health <= 0)) {
    gameOver = true;
    quizActive = true;
    showQuiz();
  }
  
  // 如果遊戲結束，顯示問題
  if (quizActive) {
    // 暫停遊戲動畫
    push();
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text('你失敗了！', width/2, height/3);
    text('回答下列問題以獲得復活機會：', width/2, height/3 + 50);
    text(currentQuestion, width/2, height/2);
    
    // 顯示輸入框
    if (!document.getElementById('answerInput')) {
      createAnswerInput();
    }
    pop();
    return;
  }
  
  // 顯示操作說明
  fill(255);  // 白色文字
  textSize(16);
  textAlign(LEFT, BOTTOM);
  
  let x = 20;
  let y = height - 20;
  
  // 玩家1操作說明
  text("玩家1 :", x, y - 80);
  text("W，jump並發射火焰", x, y - 60);
  text("D，往前走", x, y - 40);
  text("S，攻擊", x, y - 20);
 
  // 玩家2操作說明
  let x2 = x + 200;  // 向右偏移200像素
  text("玩家2 :", x2, y - 80);
  text("↑，發射火焰 ", x2, y - 60);
  text("↓ 踢攻擊", x2, y - 40);
  text("⭢往前走", x2, y - 20);
 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 添加碰撞檢測函數
function checkHit(attacker, defender) {
  let attackerRight = attacker.x + (attacker.attackBox.width/2 * attacker.direction);
  let attackerLeft = attacker.x;
  let defenderRight = defender.x + 30;
  let defenderLeft = defender.x - 30;
  
  return (attackerRight >= defenderLeft && attackerLeft <= defenderRight);
}

// 修改問題顯示函數
function showQuiz() {
  // 淡江教科系特色選擇題庫
  const questions = [
    {
      question: '淡教科系的英文縮寫是什麼？',
      options: ['ET', 'CS', 'IM', 'IE'],
      answer: 'ET'
    },
    {
      question: '淡江教科系專門培養哪方面的人才？',
      options: ['程式設計', '數位學習', '企業管理', '多媒體設計'],
      answer: '數位學習'
    },
    {
      question: '淡江教科系的課程特色是什麼？',
      options: ['人工智慧', '數位教學設計', '商業管理', '網路工程'],
      answer: '數位教學設計'
    }
  ];
  
  // 隨機選擇一個問題
  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  currentQuestion = randomQ.question;
  currentOptions = randomQ.options;
  correctAnswer = randomQ.answer;
}

// 修改答案輸入框創建函數為選項按鈕
function createAnswerInput() {
  // 創建選項按鈕
  for (let i = 0; i < currentOptions.length; i++) {
    let optionBtn = createButton(currentOptions[i]);
    optionBtn.position(width/2 - 100, height/2 + 50 + i * 40);
    optionBtn.class('option-button');
    optionBtn.style('width', '200px');
    optionBtn.style('height', '30px');
    optionBtn.style('margin', '5px');
    optionBtn.style('background-color', '#4CAF50');
    optionBtn.style('color', 'white');
    optionBtn.style('border', 'none');
    optionBtn.style('border-radius', '5px');
    optionBtn.style('cursor', 'pointer');
    
    // 添加懸停效果
    optionBtn.mouseOver(() => {
      optionBtn.style('background-color', '#45a049');
    });
    optionBtn.mouseOut(() => {
      optionBtn.style('background-color', '#4CAF50');
    });
    
    // 添加點擊事件
    optionBtn.mousePressed(() => {
      checkAnswer(currentOptions[i]);
    });
  }
}

// 修改答案檢查函數
function checkAnswer(selectedAnswer) {
  if (selectedAnswer === correctAnswer) {
    // 答對了，復活玩家
    if (player1Health <= 0) player1Health = 100;
    if (player2Health <= 0) player2Health = 100;
    
    // 移除問題界面
    quizActive = false;
    gameOver = false;
    // 移除所有選項按鈕
    let buttons = selectAll('.option-button');
    buttons.forEach(btn => btn.remove());
  } else {
    // 答錯了，顯示遊戲結束
    push();
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER);
    text('回答錯誤，遊戲結束！', width/2, height/2 + 200);
    pop();
    
    setTimeout(() => {
      window.location.reload();  // 重新載入頁面
    }, 2000);
  }
}
