class fase_demo extends Phaser.Scene {
    preload() {
        console.log('load assets');
        this.load.spritesheet('player_sp', 'assets/spritesheets/a-king.png', { frameWidth: 80, frameHeight: 58 });

        // carrega os tilesets
        this.load.image('tiles1', 'assets/maps/Grupo G/Tilemap_Flat.png');
        this.load.image('tiles2', 'assets/maps/Grupo G/Tilemap_Elevation.png');
        this.load.image('tiles3', 'assets/maps/Grupo G/Shadows.png');

        // carrega o mapa
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

        this.wallsLayer.setCollisionBetween(1, 1000);
        this.obstaculoLayer.setCollisionBetween(1, 1000);

        // configura os limites do mundo físico
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // define posição inicial para os jogadores
        const startX1 = 10 * 50;
        const startY1 = 20 * 50;

        const startX2 = 30 * 50;
        const startY2 = 25 * 50;

        // cria jogadores
        this.player1 = this.physics.add.sprite(startX1, startY1, 'player_sp', 5);
        this.player1.setSize(60, 60);
        this.player1.setCollideWorldBounds(true);

        this.player2 = this.physics.add.sprite(startX2, startY2, 'player_sp', 5);
        this.player2.setSize(60, 60);
        this.player2.setCollideWorldBounds(true);

        // adiciona colisão com o cenário
        this.physics.add.collider(this.player1, this.wallsLayer);
        this.physics.add.collider(this.player1, this.obstaculoLayer);
        this.physics.add.collider(this.player2, this.wallsLayer);
        this.physics.add.collider(this.player2, this.obstaculoLayer);

        // evita que os jogadores passem um pelo outro
        this.physics.add.collider(this.player1, this.player2);

        // configura teclas para os jogadores
        this.keys1 = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D'
        });

        this.keys2 = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        // cria modal invisível no início
        this.modalContainer = this.add.container(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        this.modalBackground = this.add.graphics();
        this.modalBackground.fillStyle(0x000000, 0.7); // Fundo preto semi-transparente
        this.modalBackground.fillRect(-150, -50, 300, 100); // Tamanho da modal

        this.modalText = this.add.text(0, 0, '', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // adiciona os elementos ao modal
        this.modalContainer.add([this.modalBackground, this.modalText]);

        // modal começa invisivel
        this.modalContainer.setVisible(false);

        // cria bombas apenas dentro dos limites do mapa e em locais válidos
        this.bombs = this.physics.add.staticGroup();
        let maxTentativas = 100; // Limite de tentativas para evitar loop infinito

        for (let i = 0; i < 10; i++) {
            let tentativas = 0;
            let bombX, bombY, bombTile;

            do {
                bombX = Phaser.Math.Between(0, this.map.widthInPixels);
                bombY = Phaser.Math.Between(0, this.map.heightInPixels);
                bombTile = this.groundLayer.getTileAtWorldXY(bombX, bombY); // verifica se existe chão
                tentativas++;
            } while ((!bombTile || this.wallsLayer.getTileAtWorldXY(bombX, bombY) || this.obstaculoLayer.getTileAtWorldXY(bombX, bombY)) && tentativas < maxTentativas);

            if (bombTile) { // só add bomba se o lugar for valido
                let bomb = this.bombs.create(bombX, bombY, null);
                bomb.setSize(40, 40);
                bomb.setAlpha(0); // invisivel no jogo
            }
        }

        // TESTE: bombas visiveis 
        this.bombs.children.iterate((bomb) => {
            let debugCircle = this.add.graphics();
            debugCircle.fillStyle(0xff0000, 0.5); // vermelho semi-transparente
            debugCircle.fillCircle(bomb.x, bomb.y, 10);
        });

        //  add colisão entre jogadores e bombas
        this.physics.add.overlap(this.player1, this.bombs, () => this.hitBomb(this.player1), null, this);
        this.physics.add.overlap(this.player2, this.bombs, () => this.hitBomb(this.player2), null, this);

        // cria câmeras para os jogadores
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.camera1 = this.cameras.add(0, 0, screenWidth / 2, screenHeight);
        this.camera1.startFollow(this.player1);
        this.camera1.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera1.setBackgroundColor(0x000000);

        this.camera2 = this.cameras.add(screenWidth / 2, 0, screenWidth / 2, screenHeight);
        this.camera2.startFollow(this.player2);
        this.camera2.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera2.setBackgroundColor(0x000000);

        // cria textos de identificação dos jogadores
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

            // normaliza velocidade para evitar aceleração diagonal excessiva
            const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2);
            if (speed > 210) {
                velocityX *= 210 / speed;
                velocityY *= 210 / speed;
            }

            player.setVelocity(velocityX, velocityY);
        };

        // movimentação do jogador 1
        if (this.player1.body.enable) {
            movePlayer(this.player1, this.keys1);
        }

        // movimentação do jogador 2
        if (this.player2.body.enable) {
            movePlayer(this.player2, this.keys2);
        }

        // atualiza as posições dos textos com base nos jogadores
        this.textoPlayer1.setPosition(this.player1.x, this.player1.y - 40);
        this.textoPlayer2.setPosition(this.player2.x, this.player2.y - 40);
    }

    hitBomb(player) {
        if (!player.body.enable) return; // evita muitas colisão seguidas
    
        // mensagem de colisao com bomba 
        this.modalText.setText(`Voce atingiu uma bomba`);
    
        // mensagem segue o jogador atingido 
        let camera = player === this.player1 ? this.camera1 : this.camera2;
    
        // modal no centro da camera do jogador que colidiu com a bomba 
        this.modalContainer.setPosition(camera.worldView.x + camera.width / 2, camera.worldView.y + camera.height / 2);
    
        // exibe modal 
        this.modalContainer.setVisible(true);
    
        // para o movimento do jogador 
        player.setVelocity(0, 0);
        player.body.enable = false;
    
        //  modal fica invisivel e jogaodr volta a se movimentar 
        this.time.delayedCall(5000, () => {
            this.modalContainer.setVisible(false);
            player.body.enable = true;
        }, [], this);
    }
    
}
