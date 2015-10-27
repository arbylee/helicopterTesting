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
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
  this.body.velocity.y = 330;

  if(this.game.input.activePointer.isDown){
    this.body.velocity.y = -250;
  }
}

function Main() {};

Main.prototype = {
  preload: function(){
    this.game.stage.backgroundColor = '#000';
    this.game.load.image('player', 'assets/baldFlyingPerson.png');
    this.game.load.image('ceiling', 'assets/greenBar.png');
    this.game.load.image('floor', 'assets/greenBar.png');
    this.game.load.image('obstacle', 'assets/greenVertical.png');
  },
  create: function(){
    this.game.input.maxPointers = 1;

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = new Player(this);
    this.ceiling = this.game.add.sprite(0,0,'ceiling');
    this.floor = this.game.add.sprite(0,GAME_HEIGHT-40,'floor');
    this.game.physics.arcade.enable(this.ceiling);
    this.game.physics.arcade.enable(this.floor);

    this.obstacles = this.game.add.group();
    this.obstacles.enableBody = true;
    this.obstacles.createMultiple(20, 'obstacle');
    this.timer = this.game.time.events.loop(1500, this.addObstacle, this);
  },
  update: function(){
    this.game.physics.arcade.overlap(this.player, this.ceiling, this.collide, null, this);
    this.game.physics.arcade.overlap(this.player, this.floor, this.collide, null, this);
  },
  collide: function(){
    this.game.state.start('gameOver');
  },
  addObstacle: function(){
    console.log('asdf')
    var obstacle = this.obstacles.getFirstDead();
    yCoord = this.game.rnd.between(0, 6) * 80;

    obstacle.reset(GAME_WIDTH, yCoord);
    obstacle.body.velocity.x = -250;
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;
  }
};

function GameOver(){};

GameOver.prototype = {
  init: function(params){
  },
  preload: function(){
  },
  create: function(){
    this.game.add.text("275", "100", "Game Over", {font: "32px Arial", fill: "#FFF"});
  },
  update: function(){
    if(this.game.input.activePointer.isDown){
      this.game.state.start('main');
    }
  }
}

game.state.add('gameOver', GameOver);
game.state.add('main', Main);
game.state.start('main');