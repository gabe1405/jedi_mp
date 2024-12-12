/*const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#87CEEB",
    scene: {
        preload: preload,
        create: create
    }
};*/

function hitMine(player, zone){
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.explode(16);
    this.physics.world.disable(zone);
    console.log('.')
}


class main extends Phaser.Scene {
    //python -m http.server
    //const game = new Phaser.Game(config);
    constructor() {
        super({ key: 'main' });
        this.lastMoveTime = 0; // Tempo do último movimento
        this.idleTime = 10000; // Tempo em milissegundos para idle (5 segundos)
    }
    //commit

    preload() {
        console.log('Carregando tileset');
        this.load.spritesheet('player_sp', 'Download2071.png', { frameWidth: 65, frameHeight: 65 });
        this.load.spritesheet('buff', 'star.png', { frameWidth: 65, frameHeight: 65 });

        this.load.image('tileset', 'Terrain (32x32).png'); // Verifique o caminho e a image
        this.load.tilemapTiledJSON('map', 'mapa5.json'); // Verifique o caminho e o JSON
        
        //teste buff
        this.load.atlas('flares', '../../spritesheets/flares.png', '../../spritesheets/flares.json');

    }
    

    create() {
        const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('Tileset_faseTeste', 'tileset');
        //tileset = map.addTilesetImage('tilset_decoracao', 'tileset');

        this.cameras.main.setSize(1280, 720);

        //  A basic score
        let score = 0;

        const scoreText = this.add.text(10, 10, 'Score: 0', { font: '16px Courier', fill: '#00ff00' });
        // comando abaixo aumenta score dependendo do que eu quiser
        score += 100;

        scoreText.setText('Score: ' + score);
        

        //this.groundLayer = this.map.createLayer('Chao', this.tileset, 0, 0);
        //this.wallsLayer = this.map.createLayer('Parede', this.tileset, 0, 0);
        this.wallsLayer = map.createLayer('Parede', tileset, 0, 0);
        this.groundLayer = map.createLayer('Chao', tileset, 0, 0);
        
        

         // criação do rei
         this.player = this.physics.add.sprite(150, 400, 'player_sp', 36);
         //this.player.setCollideWorldBounds(true);
         this.cameras.main.startFollow(this.player);

         // criação da colisão
        this.wallsLayer.setCollisionBetween(20, 58, true);
        this.physics.add.collider(this.player, this.wallsLayer);

        //colisao do buff
        this.mines = this.physics.add.group();
        this.mines.create(150, 140, 'buff').setVisible(true);
        this.mines.create(725, 530, 'buff').setVisible(true);
        this.mines.create(1250, 840, 'buff').setVisible(true);
        this.mines.create(930, 870, 'buff').setVisible(true);
        this.mines.create(1450, 140, 'buff').setVisible(true);

        this.physics.add.overlap(this.player, this.mines, hitMine, null, this);


        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyS = this.input.keyboard.addKey('S');
        this.keySPACE = this.input.keyboard.addKey('SPACE');

        // Animações do jogador para cada direção
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 24, end: 25 }),
            frameRate: 10,
            repeat: 1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: 1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 12, end: 13 }),
            frameRate: 10,
            repeat: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 36, end: 37 }),
            frameRate: 10,
            repeat: 1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 24, end: 30 }),  // Usando o primeiro frame como "idle" mudar
            frameRate: 10,
            repeat: 1  // Repete indefinidamente
            
        });

        this.emitter = this.add.particles(100, 100, 'flares', {
            //frame: [ 'red', 'yellow', 'green' ],
            frame: [ 'yellow' ],
            lifespan: 4000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        this.idleTimer = 0;
    }

    update ()
    {
        // velocidade horizontal
        if (this.keyD?.isDown) {
            this.player.setVelocityX(210);
            this.player.anims.play('right', true);
            this.lastMoveTime = this.time.now;
        }
        else if (this.keyA?.isDown) {
            this.player.setVelocityX(-210);
            this.player.anims.play('left', true);
            this.lastMoveTime = this.time.now;
        }
        else{
            this.player.setVelocityX(0); 
            
        }

        // velocidade vertical
        if (this.keyW.isDown) {
            this.player.setVelocityY(-210);
            this.player.anims.play('up', true);
            this.lastMoveTime = this.time.now;
        }
        else if (this.keyS.isDown) {
            this.player.setVelocityY(210);
            this.player.anims.play('down', true);
            this.lastMoveTime = this.time.now;
        }
        else{
            this.player.setVelocityY(0); 
            //this.player.anims.stop();
        }


        if (this.time.now - this.lastMoveTime >= this.idleTime) {
            this.player.anims.play('idle', true); // Ativar animação idle após 5 segundos de inatividade
            this.lastMoveTime = this.time.now;
        }




    }
}
