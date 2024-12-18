const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    autoFocus: false,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  const players = {};

  function preload() {
    this.load.spritesheet("spider_sp", "public/spider11.png", {frameWidth: 64, frameHeight: 64});
    this.load.image('tiles', 'public/Terrain (32x32).png');

    this.load.tilemapTiledJSON('themap', 'public/mapa5.json');

}


  function create() {
    const self = this;
    this.players = this.physics.add.group();

    console.log('serv created')
    io.on('connection', function (socket) {
      console.log('a user connected');

      // create a new player and add it to our players object
      players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
        input: {
          left: false,
          right: false,
          up: false
        }              
      };
      // add player to server
      addPlayer(self, players[socket.id]);
      // send the players object to the new player
      socket.emit('currentPlayers', players);
      // update all other players of the new player
      socket.broadcast.emit('newPlayer', players[socket.id]);


      socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove player from server
        removePlayer(self, socket.id);
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('user_disconnect', socket.id);        
      });

      // when a player moves, update the player data
      socket.on('playerInput', function (inputData) {
        handlePlayerInput(self, socket.id, inputData);
      });      
    });

    // criação do mapa e ligação com a imagem (tilesheet)
    this.map = this.make.tilemap({ key: 'themap', tileWidth: 16, tileHeight: 16 });
    this.tileset = this.map.addTilesetImage('Tileset_faseTeste', 'tiles');

    // criação das camadas
    this.groundLayer = this.map.createLayer('Chao', this.tileset, 0, 0);
    this.wallsLayer = this.map.createLayer('Parede', this.tileset, 0, 0);

    this.wallsLayer.setCollisionBetween(30, 40, true)
    this.physics.add.collider(this.players, this.wallsLayer);

    this.physics.add.overlap(this.players, this.players, playerOverlap, null, this);

  }

  function update() {
    this.players.getChildren().forEach((player) => {
      const input = players[player.playerId].input;
      if (input.left) {
        player.setAngularVelocity(-300);
      } else if (input.right) {
        player.setAngularVelocity(300);
      } else {
        player.setAngularVelocity(0);
      }
      if (input.up) {
        //this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        this.physics.velocityFromRotation(player.rotation -3.14/2, 200, player.body.velocity);
      } else {
        //player.setAcceleration(0);
        player.setVelocity(0);
      }
      players[player.playerId].x = player.x;
      players[player.playerId].y = player.y;
      players[player.playerId].rotation = player.rotation;
    });
    this.physics.world.wrap(this.players, 5);
    io.emit('playerUpdates', players);    
  }

  function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'spider_sp').setOrigin(0.5, 0.5).setDisplaySize(25, 25);
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
  }

  function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  }

  function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        players[player.playerId].input = input;
      }
    });
  }

  function playerOverlap(p1, p2){
    console.log(players[p1.playerId].team, players[p1.playerId].team == 'red', players[p2.playerId].team == 'blue');
    if (players[p1.playerId].team == 'red' && players[p2.playerId].team == 'blue'){
      //players[p1.playerId].x =  Math.floor(Math.random() * 700) + 50;
      //players[p1.playerId].y = Math.floor(Math.random() * 500) + 50;
      p1.x =  Math.floor(Math.random() * 700) + 50;
      p1.y = Math.floor(Math.random() * 500) + 50;
    }

  }

  const game = new Phaser.Game(config);
  window.gameLoaded();