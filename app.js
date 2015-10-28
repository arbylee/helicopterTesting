var GAME_WIDTH = 720;
var GAME_HEIGHT = 480;
var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, '')

var Player = function (state) {
  this.gameState = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, GAME_WIDTH/4, GAME_HEIGHT/2, 'player');
  this.game.add.existing(this);
  this.game.physics.arcade.enable(this);
  this.anchor.setTo(0.5, 0.5);
  this.body.collideWorldBounds = true;
  this.moveSpeed = 250;
  this.engineSound = this.gameState.engineSound;
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
  this.body.velocity.y = 330;

  if(this.game.input.activePointer.isDown){
    if(!this.enginePlaying){
      this.engineSound.play();
      this.enginePlaying = true;
    }
    this.body.velocity.y = -250;
    this.frame = 0;
  } else {
    if(this.enginePlaying){
      this.engineSound.stop();
      this.enginePlaying = false;
    }
    this.frame = 1;
  }
}

function Main() {};

Main.prototype = {
  init: function(params){
    this.topScore = 0;
    if(params && params.topScore){
      this.topScore = params.topScore;
    }
  },
  preload: function(){
    this.game.stage.backgroundColor = '#000';
    this.game.load.spritesheet('player', 'assets/flyingPersonSprite.png', 32, 60);
    this.game.load.image('ceiling', 'assets/greenBar.png');
    this.game.load.image('floor', 'assets/greenBar.png');
    this.game.load.image('obstacle', 'assets/greenVertical.png');
    this.game.load.audio('engine', 'assets/engine.m4a');
  },
  create: function(){
    this.engineSound = this.game.add.audio('engine');
    this.engineSound.volume = 0.7;
    this.engineSound.loop = true;
    this.ceilingStart = -40;
    this.openSpace = GAME_HEIGHT-40;
    this.boundaryMovement = 1;
    this.score = 0;
    this.game.input.maxPointers = 1;

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.ceiling = this.game.add.sprite(0,0,'ceiling');
    this.floor = this.game.add.sprite(0,GAME_HEIGHT-40,'floor');
    this.game.physics.arcade.enable(this.ceiling);
    this.game.physics.arcade.enable(this.floor);
    this.floor.body.velocity.x = -250;
    this.ceiling.body.velocity.x = -250;

    this.obstacles = this.game.add.group();
    this.obstacles.enableBody = true;
    this.obstacles.createMultiple(100, 'obstacle');
    this.timer = this.game.time.events.loop(1200, this.addObstacle, this);
    this.timer = this.game.time.events.loop(120, this.addBoundaryTiles, this);
    this.scoreText = this.game.add.text(20, GAME_HEIGHT-30, "Distance: 0", {font: "20px Arial", fill: "#FFF"});
    this.topScoreText = this.game.add.text(GAME_WIDTH-160, GAME_HEIGHT-30, "Best: " + this.topScore, {font: "20px Arial", fill: "#FFF"});

    this.player = new Player(this);
  },
  update: function(){
    this.score += 1
    this.scoreText.text = "Distance: " + this.score;
    this.game.physics.arcade.overlap(this.player, this.ceiling, this.collide, null, this);
    this.game.physics.arcade.overlap(this.player, this.floor, this.collide, null, this);
    this.game.physics.arcade.overlap(this.player, this.obstacles, this.collide, null, this);
  },
  collide: function(){
    this.game.state.start('gameOver', true, false, {previousScore: this.score, previousTopScore: this.topScore});
  },
  addBoundaryTiles: function(){
    var ceilingTile = this.obstacles.getFirstDead();
    if(this.ceilingStart >= 20) {
      this.boundaryMovement = -1;
    } else if(this.ceilingStart <= 0){
      this.boundaryMovement = 1;
    }
    this.ceilingStart = this.ceilingStart + this.boundaryMovement;

    ceilingTile.reset(GAME_WIDTH, this.ceilingStart);
    ceilingTile.body.velocity.x = -250;
    ceilingTile.checkWorldBounds = true;
    ceilingTile.outOfBoundsKill = true;
    var floorTile = this.obstacles.getFirstDead();
    floorTile.reset(GAME_WIDTH, ceilingTile.y + this.openSpace);
    floorTile.body.velocity.x = -250;
    floorTile.checkWorldBounds = true;
    floorTile.outOfBoundsKill = true;
  },
  addObstacle: function(){
    var obstacle = this.obstacles.getFirstDead();
    yCoord = this.game.rnd.between(0, 5) * 80;

    obstacle.reset(GAME_WIDTH, yCoord);
    obstacle.body.velocity.x = -250;
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
  }
};

function GameOver(){};

GameOver.prototype = {
  init: function(params){
    if(params.previousScore > params.previousTopScore){
      this.topScore = params.previousScore;
    } else {
      this.topScore = params.previousTopScore;
    }
  },
  preload: function(){
  },
  create: function(){
    this.game.add.text("275", "100", "Game Over", {font: "32px Arial", fill: "#FFF"});
  },
  update: function(){
    if(this.game.input.activePointer.isDown){
      this.game.state.start('main', true, false, {topScore: this.topScore});
    }
  }
}

game.state.add('gameOver', GameOver);
game.state.add('main', Main);
game.state.start('main');
