class fase_demo extends Phaser.Scene {
    preload() {
        console.log('load assets');
        this.load.spritesheet('player_sp', 'assets/spritesheets/a-king.png', { frameWidth: 80, frameHeight: 58 });

        // carregar os tilesets
        this.load.image('tiles1', 'assets/maps/Grupo G/Tilemap_Flat.png');
        this.load.image('tiles2', 'assets/maps/Grupo G/Tilemap_Elevation.png');
        this.load.image('tiles3', 'assets/maps/Grupo G/Shadows.png');

        // carregar o mapa
        this.load.tilemapTiledJSON('themap', 'assets/maps/Grupo G/mapaCampoMinado.json');
    }

    create() {
        // criação do mapa e ligação com os tilesets
        this.map = this.make.tilemap({ key: 'themap', tileWidth: 50, tileHeight: 50 });

        // associando os tilesets ao mapa
        this.tileset1 = this.map.addTilesetImage('CampoMinado', 'tiles1');
        this.tileset2 = this.map.addTilesetImage('obstaculos', 'tiles2');
        this.tileset3 = this.map.addTilesetImage('sombra', 'tiles3');

        // criação das camadas
        this.groundLayer = this.map.createDynamicLayer('Chao', this.tileset1, 0, 0);
        this.wallsLayer = this.map.createDynamicLayer('Parede', this.tileset2, 0, 0);
        this.obstaculoLayer = this.map.createDynamicLayer('obstaculos', this.tileset2, 0, 0);

        // configuração da colisão para as camadas
        this.wallsLayer.setCollisionByProperty({ collides: true });
        this.obstaculoLayer.setCollisionByProperty({ collides: true });

        // caso os tiles não tenham propriedades personalizadas, configure pelos IDs:
        this.wallsLayer.setCollisionBetween(1, 1000);
        this.obstaculoLayer.setCollisionBetween(1, 1000);

        // configurar os limites do mundo físico
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // definir posição inicial para os jogadores em locais distantes um do outro
        const startX1 = 10 * 50;
        const startY1 = 20 * 50;

        const startX2 = 30 * 50;
        const startY2 = 25 * 50;

        // criar jogador 1
        this.player1 = this.physics.add.sprite(startX1, startY1, 'player_sp', 5);
        this.player1.setSize(60, 60);
        this.player1.setCollideWorldBounds(true);

        // criar jogador 2
        this.player2 = this.physics.add.sprite(startX2, startY2, 'player_sp', 5);
        this.player2.setSize(60, 60);
        this.player2.setCollideWorldBounds(true);

        // adicionar colisão entre os jogadores e as camadas de paredes e obstáculos
        this.physics.add.collider(this.player1, this.wallsLayer);
        this.physics.add.collider(this.player1, this.obstaculoLayer);
        this.physics.add.collider(this.player2, this.wallsLayer);
        this.physics.add.collider(this.player2, this.obstaculoLayer);

        // evitar que os jogadores passem um pelo outro
        this.physics.add.collider(this.player1, this.player2);

        // configurar teclas para o jogador 1
        this.keys1 = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D'),
        };

        // configurar teclas para o jogador 2
        this.keys2 = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        };

        // criar duas câmeras para os jogadores
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // camera para o jogador 1 (metade esquerda da tela)
        this.camera1 = this.cameras.add(0, 0, screenWidth / 2, screenHeight);
        this.camera1.startFollow(this.player1);
        this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera1.setBackgroundColor(0x000000);  // Fundo preto para a câmera 1

        // camera para o jogador 2 (metade direita da tela)
        this.camera2 = this.cameras.add(screenWidth / 2, 0, screenWidth / 2, screenHeight);
        this.camera2.startFollow(this.player2);
        this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera2.setBackgroundColor(0x000000);  // Fundo preto para a câmera 2

        // criar textos para identificar os jogadores
        this.textoPlayer1 = this.add.text(startX1, startY1 - 40, 'Jogador 1', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);
        this.textoPlayer2 = this.add.text(startX2, startY2 - 40, 'Jogador 2', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);
    }


    update() {
        // função de movimento do jogador
        const movePlayer = (player, keys) => {
            let velocityX = 0;
            let velocityY = 0;

            if (keys.right.isDown) velocityX += 210;
            if (keys.left.isDown) velocityX -= 210;
            if (keys.up.isDown) velocityY -= 210;
            if (keys.down.isDown) velocityY += 210;

            // normalizar velocidade para evitar aceleração diagonal excessiva
            const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2);
            if (speed > 210) {
                velocityX *= 210 / speed;
                velocityY *= 210 / speed;
            }

            player.setVelocity(velocityX, velocityY);
        };

        // novimento do jogador 1
        movePlayer(this.player1, this.keys1);
        // Movimento do jogador 2
        movePlayer(this.player2, this.keys2);

        // atualizar as posições dos textos com base nos jogadores
        this.textoPlayer1.setPosition(this.player1.x, this.player1.y - 40);
        this.textoPlayer2.setPosition(this.player2.x, this.player2.y - 40);
    }
}