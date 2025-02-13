/*const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#87CEEB",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};*/

let score = 0;
let scoreText;

this.wave = 15;



function hitMine(player, zone) {
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.explode(16);
    this.physics.world.disable(zone);
    zone.setVisible(false);
    this.aumentarScore(100);
    console.log('Score atualizado para:', score);
    this.buff();
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

        this.load.image('projetio', 'animacao.png');

        this.load.image('bomb', 'bomba.png');

    }


    create() {
        this.enemyKills = 0;
        this.playerSpeed = 210;

        const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('Tileset_faseTeste', 'tileset');
        //tileset = map.addTilesetImage('tilset_decoracao', 'tileset');

        this.cameras.main.setSize(1280, 720);

        

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

        this.anims.create({
            key: 'attack-right',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 180, end: 185 }),
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'attack-left',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 156, end: 161 }),
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'attack-up',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 144, end: 149 }),
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'attack-down',
            frames: this.anims.generateFrameNumbers('player_sp', { start: 168, end: 173 }),
            frameRate: 15,
            repeat: 0
        });

        this.emitter = this.add.particles(100, 100, 'flares', {
            //frame: [ 'red', 'yellow', 'green' ],
            frame: ['yellow'],
            lifespan: 4000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        this.explosion = this.add.particles(100, 100, 'flares', {
            //frame: [ 'red', 'yellow', 'green' ],
            frame: ['red'],
            lifespan: 4000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        this.idleTimer = 0;

        this.projetio = this.physics.add.group({
            defaultKey: 'projetio'


        });

        this.physics.add.collider(this.projetio, this.wallsLayer, (projetio, wall) => {
            projetio.destroy();
        });

        this.bombs = this.physics.add.group();

        this.bombs.create(300, 400, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(400, 500, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(500, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 700, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(700, 800, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(800, 900, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(900, 1000, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(1000, 1100, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(1100, 1200, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(800, 800, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(900, 100, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(700, 500, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 500, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(200, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(1000, 100, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(400, 600, 'bomb').setScale(0.5).setVelocity(100);
        this.bombs.create(600, 300, 'bomb').setScale(0.5).setVelocity(100);
    

        
        
        
        this.physics.add.overlap(this.player, this.bombs, (player, bombs) => {
            
            this.explosion.setPosition(player.x, player.y); // Posiciona partículas no jogador
            this.explosion.explode(10); // Ativa explosão de partículas
            
            bombs.destroy(); // Opcional: remove o inimigo após a colisão
            this.gameOver();
        }, null, this);

        this.physics.add.collider(this.bombs, this.wallsLayer);

        
        this.physics.add.overlap(this.projetio, this.bombs, (projetio, bombs) => {
            projetio.destroy();
            bombs.destroy();
            this.aumentarScore(50);
            this.enemyKills++;
            console.log(`💣 Bombas eliminadas: ${this.enemyKills}`);
            
        }, null, this);
    

        scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fontFamily: 'Courier',
            fill: '#00ff00'
        }).setScrollFactor(0);

        
    }

    update() {
        let speed = this.playerSpeed;
        // velocidade horizontal
        if (this.enemyKills >= 20) {
            this.victory();
        }
        if (this.isGameOver) return;

        if (this.keyD?.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
            this.lastMoveTime = this.time.now;
            this.lastDirection = 'right';
        }
        else if (this.keyA?.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
            this.lastMoveTime = this.time.now;
            this.lastDirection = 'left';
        }
        else {
            this.player.setVelocityX(0);

        }

        // velocidade vertical
        if (this.keyW.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('up', true);
            this.lastMoveTime = this.time.now;
            this.lastDirection = 'up';
        }
        else if (this.keyS.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('down', true);
            this.lastMoveTime = this.time.now;
            this.lastDirection = 'down';
        }
        else {
            this.player.setVelocityY(0);
            //this.player.anims.stop();
        }


        if (this.time.now - this.lastMoveTime >= this.idleTime) {
            this.player.anims.play('idle', true); // Ativar animação idle após 5 segundos de inatividade
            this.lastMoveTime = this.time.now;
        }


        //ataque
        if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
            // Tocar animação de ataque
            if (this.lastDirection == "up") {
                this.player.anims.play('attack-up', true);
            } else if (this.lastDirection == "down") {
                this.player.anims.play('attack-down', true);
            } else if (this.lastDirection == "left") {
                this.player.anims.play('attack-left', true);
            }
            else if (this.lastDirection == "right") {
                this.player.anims.play('attack-right', true);
            }



            this.atacar();
        }

        this.bombs.getChildren().forEach(enemy => {
            let dx = this.player.x - enemy.x;
            let dy = this.player.y - enemy.y;
            let angle = Math.atan2(dy, dx);
            let enemySpeed = 150; // Ajuste conforme desejado

            enemy.setVelocity(
                Math.cos(angle) * enemySpeed,
                Math.sin(angle) * enemySpeed
            );
        });

    }

    aumentarScore(pontos) {
        score += pontos;
        scoreText.setText('Score: ' + score);
    }

    atacar() {
        const proj = this.projetio.get(this.player.x, this.player.y);

        if (proj) {
            proj.enableBody(true, this.player.x, this.player.y, true, true);
            proj.setScale(0.05);
            proj.body.allowGravity = false;
            proj.setCollideWorldBounds(false);

            const speed = 500;
            // Define a velocidade do projétil com base na última direção
            if (this.lastDirection == "up") {
                proj.setVelocityY(-speed);
            } else if (this.lastDirection == "down") {
                proj.setVelocityY(speed);
            } else if (this.lastDirection == "left") {
                proj.setVelocityX(-speed);
            }
            else if (this.lastDirection == "right") {
                proj.setVelocityX(speed);
            }

            this.time.delayedCall(500, () => {
                if (proj && proj.active) {
                    proj.destroy();
                }
            });
        }
    }

    buff() {
        console.log("Buff ativado!");
    
        // Aumenta a velocidade do jogador
        this.playerSpeed *= 1.5; 
    
        // Tempo do buff (3 segundos)
        this.time.delayedCall(3000, () => {
            console.log("Buff acabou!");
    
            // Retorna a velocidade normal do jogador
            this.playerSpeed /= 1.5; 
    
        });
    }

    gameOver() {
        console.log("💥 GAME OVER! 💥");
        this.isGameOver = true;
    
        // Desativa o movimento do jogador
        this.player.setVelocity(0, 0);
        this.player.setTint(0xff0000); // Muda a cor do jogador para vermelho
    
        // Para todas as físicas do jogo
        this.physics.pause();
    
        // Exibe mensagem de "Game Over"
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "GAME OVER", {
            fontSize: '50px',
            fontFamily: 'Courier',
            fill: '#ff0000'
        }).setOrigin(0.5);
    
        // Exibe o Score abaixo do "Game Over"
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20, `Score: ${score}`, {
            fontSize: '32px',
            fontFamily: 'Courier',
            fill: '#ffffff'
        }).setOrigin(0.5);
    
        // Reinicia o jogo após 3 segundos
        this.time.delayedCall(5000, () => {
            this.scene.restart(); // Reinicia a cena
            score = 0; // Reseta o score ao reiniciar
            this.isGameOver = false;
        });
    }

    victory() {
        console.log("🏆 VITÓRIA! Você eliminou 20 bombas! 🏆");
    
        this.isGameOver = true; // Desativa o jogo
    
        // Para todas as físicas
        this.physics.pause();
    
        // Exibe "VITÓRIA" na tela
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "🏆 VITÓRIA! 🏆", {
            fontSize: '50px',
            fontFamily: 'Courier',
            fill: '#FFD700' // Cor dourada
        }).setOrigin(0.5);
    
        // Exibe o Score final abaixo
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20, `Score Final: ${score}`, {
            fontSize: '32px',
            fontFamily: 'Courier',
            fill: '#ffffff'
        }).setOrigin(0.5);
    
        // Reinicia o jogo após 5 segundos
        this.time.delayedCall(5000, () => {
            this.scene.restart(); // Reinicia a cena
            score = 0; // Reseta o score
            this.enemyKills = 0; // Reseta a contagem de kills
            this.isGameOver = false; // Permite jogar novamente
        });
    }

}

