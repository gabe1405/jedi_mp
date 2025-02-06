class fase_demo extends Phaser.Scene {
    constructor() {
        super('fase_demo');
        
        // Tempo de inatividade para acionar animação idle (opcional)
        this.idleTime = 3000; 
        this.lastMoveTime = 0;
        
        // Direção padrão do jogador (para projétil, flip, etc.)
        this.lastDirection = 'down';

        // Vida do jogador
        this.playerHealth = 100;
        this.damageAmount = 20; // Dano ao colidir com inimigo

        // Configuração de ondas de inimigos
        this.waveCount = 0;
        this.enemiesPerWave = 20;
    }

    preload() {
        console.log('load assets');

        // ---------------
        //  MAPA e TILESET
        // ---------------
        this.load.image('tiles', 'Terrain (32x32).png');
        this.load.tilemapTiledJSON('themap', 'mapa5.json');

        // ----------------------
        //  SPRITES DO PERSONAGEM
        // (substituindo o antigo 'player_sp')
        // ----------------------
        this.load.spritesheet('player_idle', 'IDLE.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('player_run', 'RUN.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('player_attack', 'ATTACK 1.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('player_hurt', 'HURT.png', { frameWidth: 96, frameHeight: 96 });

        // ----------------------
        //  SPRITE DE PROJÉTIL
        // ----------------------
        this.load.image('bullet', 'Shuriken pronta.png');

        // ----------------------
        //  SPRITE DOS INIMIGOS
        // ----------------------
        this.load.image('star', 'Agis.png');
    }

    create() {
        // ---------------------------
        //  MAPA E CAMADAS
        // ---------------------------
        this.map = this.make.tilemap({
            key: 'themap',
            tileWidth: 16,
            tileHeight: 16
        });
        this.tileset = this.map.addTilesetImage('tileset', 'tiles');

        this.groundLayer = this.map.createDynamicLayer('chao', this.tileset, 0, 0);
        this.wallsLayer = this.map.createDynamicLayer('parede', this.tileset, 0, 0);

        // Define colisão na camada de paredes
        this.wallsLayer.setCollisionByExclusion([-1]);

        // ---------------------------
        //  JOGADOR
        // ---------------------------
        this.player = this.physics.add.sprite(100, 1775, 'player_idle', 0);
        this.player.setScale(2); // Ajuste se quiser alterar o tamanho
        this.cameras.main.startFollow(this.player);

      

        // Ajustar caixa de colisão do jogador (opcional)
        this.player.body.setSize(32, 32);
        // Por exemplo, se quiser centralizar:
        this.player.body.setOffset(32, 48);

        // Colisão com paredes
        this.physics.add.collider(this.player, this.wallsLayer);

        

        // ---------------------------
        //  CONTROLES (TECLADO)
        // ---------------------------
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyS = this.input.keyboard.addKey('S');
        this.keySPACE = this.input.keyboard.addKey('SPACE');

        // ---------------------------
        //  ANIMAÇÕES DO JOGADOR
        // ---------------------------
                this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 9 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 6 }),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('player_hurt', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });


        // O jogador inicia "idle"
        this.player.anims.play('idle');

        // ---------------------------
        //  GRUPO DE PROJÉTEIS
        // ---------------------------
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10 // máximo de projéteis ativos
            
            
        });

       

        // Destruir projétil se colidir com parede
        this.physics.add.collider(this.bullets, this.wallsLayer, (bullet, wall) => {
            bullet.destroy();
        });

        // ---------------------------
        //  INIMIGOS (MOBS)
        // ---------------------------
        this.enemies = this.physics.add.group();

        // Exemplo: criar vários inimigos de forma aleatória
        /*for (let i = 0; i < 50; i++) {
            let x = Phaser.Math.Between(100, 2000);
            let y = Phaser.Math.Between(100, 2000);
            let enemy = this.enemies.create(x, y, 'star');
            enemy.setCollideWorldBounds(true);
            enemy.setBounce(1);
            enemy.body.allowGravity = false;
            enemy.setScale(0.4);
        }*/

        // Criar grupo de inimigos
        this.enemies = this.physics.add.group();

        // Iniciar ondas de inimigos
        this.spawnWave();
        this.time.addEvent({ delay: 30000, callback: this.spawnWave, callbackScope: this, loop: true });

        // Faz inimigos colidirem com paredes
        this.physics.add.collider(this.enemies, this.wallsLayer);

        // Overlap entre projéteis e inimigos (projétil destrói inimigo)
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
        }, null, this);

        // Overlap entre jogador e inimigos => animação de 'hurt'
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            console.log('Jogador colidiu com inimigo!');
            this.player.anims.play('hurt', true);

            // Exemplo: depois de 500ms, voltar para idle. 
            // Você pode colocar lógica de vida/dano aqui.
            // Exibir vida na tela
            this.healthText = this.add.text(10, 10, 'Vida: ' + this.playerHealth, { fontSize: '20px', fill: '#fff' });
            this.healthText.setScrollFactor(0); // Fixa na tela

            // Overlap entre jogador e inimigos para causar dano
            this.physics.add.overlap(this.player, this.enemies, this.takeDamage, null, this);

            this.time.delayedCall(500, () => {
                // Só volta para idle se o jogador não estiver pressionando tecla de movimento ou atacando.
                if (!this.keyA.isDown && !this.keyD.isDown && !this.keyW.isDown && !this.keyS.isDown) {
                    this.player.anims.play('idle', true);
                }
            });

        }, null, this);


    }

    spawnWave() {
        this.waveCount++;
        for (let i = 0; i < this.enemiesPerWave; i++) {
            let x = Phaser.Math.Between(100, 2000);
            let y = Phaser.Math.Between(100, 2000);
            let enemy = this.enemies.create(x, y, 'star');
            enemy.setCollideWorldBounds(true);
            enemy.setBounce(1);
            enemy.body.allowGravity = false;
            enemy.setScale(0.4);
        }
    }

    takeDamage(player, enemy) {
        if (this.playerHealth > 0) {
            this.playerHealth -= this.damageAmount;
            this.healthText.setText('Vida: ' + this.playerHealth);
            this.player.anims.play('hurt', true);
            
            if (this.playerHealth <= 0) {
                this.gameOver();
            } else {
                this.time.delayedCall(500, () => {
                    if (!this.keyA.isDown && !this.keyD.isDown && !this.keyW.isDown && !this.keyS.isDown) {
                        this.player.anims.play('idle', true);
                    }
                });
            }
        }
    }

    gameOver() {
        this.player.setTint(0xff0000);
        this.player.setVelocity(0);
        this.player.anims.play('hurt', true);
        this.add.text(400, 300, 'Game Over', { fontSize: '40px', fill: '#ff0000' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    }

    update() {
        // ---------------------------
        //  MOVIMENTAÇÃO DO JOGADOR
        // ---------------------------
        // Vamos usar a mesma animação de run para qualquer direção.
        // Se mover para a esquerda, viramos flipX = true, para direita flipX = false.
        // Se move para cima/baixo, mantemos flipX como está.

        let moving = false;
        let speed = 210;

        // Resetar velocidades a cada frame
        this.player.setVelocity(0);

        // Eixo horizontal
        if (this.keyD.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
            this.lastDirection = 'right';
            moving = true;
        } 
        else if (this.keyA.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
            this.lastDirection = 'left';
            moving = true;
        }

        // Eixo vertical
        if (this.keyW.isDown) {
            this.player.setVelocityY(-speed);
            this.lastDirection = 'up';
            moving = true;
        } 
        else if (this.keyS.isDown) {
            this.player.setVelocityY(speed);
            this.lastDirection = 'down';
            moving = true;
        }

        // Se está se movendo, tocar animação de corrida
        if (moving) {
            this.player.anims.play('run', true);
            this.lastMoveTime = this.time.now;
        }
        else {
            // Se não está se movendo, verifica se acabou de atacar
            // ou se deve ficar em idle
            if (this.player.anims.currentAnim) {
                // Se a animação atual for "attack" ou "hurt", não forçar "idle"
                if (this.player.anims.currentAnim.key !== 'attack' && 
                    this.player.anims.currentAnim.key !== 'hurt') 
                {
                    this.player.anims.play('idle', true);
                }
            }
        }

        // ---------------------------
        //  ATAQUE (ESPAÇO)
        // ---------------------------
        if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
            // Tocar animação de ataque
            this.player.anims.play('attack', true);

            // Dispara projétil (exemplo do código 1)
            this.shootBullet();
        }

        // ---------------------------
        //  LÓGICA DE PERSEGUIÇÃO INIMIGOS
        // ---------------------------
        this.enemies.getChildren().forEach(enemy => {
            let dx = this.player.x - enemy.x;
            let dy = this.player.y - enemy.y;
            let angle = Math.atan2(dy, dx);
            let enemySpeed = 50; // Ajuste conforme desejado

            enemy.setVelocity(
                Math.cos(angle) * enemySpeed,
                Math.sin(angle) * enemySpeed
            );
        });
    }

    // ---------------------------
    //  FUNÇÃO DE DISPARO (PROJÉTIL)
    // ---------------------------
    shootBullet() {
        const bullet = this.bullets.get(this.player.x, this.player.y);

        if (bullet) {
            bullet.enableBody(true, this.player.x, this.player.y, true, true);
            bullet.setScale(0.03);
            bullet.body.allowGravity = false;
            bullet.setCollideWorldBounds(false);

            const speed = 500;
            // Define a velocidade do projétil com base na última direção
            switch (this.lastDirection) {
                case 'left':
                    bullet.setVelocityX(-speed);
                    break;
                case 'right':
                    bullet.setVelocityX(speed);
                    break;
                case 'up':
                    bullet.setVelocityY(-speed);
                    break;
                case 'down':
                    bullet.setVelocityY(speed);
                    break;
                default:
                    bullet.setVelocityY(speed);
                    break;
            }

            // Destruir o projétil após 1.5s
            this.time.delayedCall(1500, () => {
                if (bullet && bullet.active) {
                    bullet.destroy();
                }
            });
        }
    }
}
