class fase_demo extends Phaser.Scene {

    // função para carregamento de assets
    preload ()
    {
        console.log('load assets');
        this.load.spritesheet('player_sp', 'assets/spritesheets/a-king.png', { frameWidth: 78, frameHeight: 58 });

        this.load.image('tiles', 'assets/maps/dungeon-16-16.png');

        this.load.tilemapTiledJSON('themap', 'assets/maps/phaser_intro_map.json');
    }

    // função para criação dos elementos
    create ()
    {

        // criação do mapa e ligação com a imagem (tilesheet)
        this.map = this.make.tilemap({ key: 'themap', tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('intro_tileSet', 'tiles');

        // criação das camadas
        this.groundLayer = this.map.createDynamicLayer('ground', this.tileset, 0, 0);
        this.wallsLayer = this.map.createDynamicLayer('walls', this.tileset, 0, 0);

        // criação do rei
        this.player = this.physics.add.sprite(100, 300, 'player_sp', 5);

        // criação da colisão
        this.wallsLayer.setCollisionBetween(30, 40, true)
        this.physics.add.collider(this.player, this.wallsLayer);

        // ligação das teclas de movimento
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyS = this.input.keyboard.addKey('S');
        this.keySPACE = this.input.keyboard.addKey('SPACE');
    }


    // update é chamada a cada novo quadro
    update ()
    {
        // velocidade horizontal
        if (this.keyD?.isDown) {
            this.player.setVelocityX(210);
        }
        else if (this.keyA?.isDown) {
            this.player.setVelocityX(-210);
        }
        else{
            this.player.setVelocityX(0); 
        }

        // velocidade vertical
        if (this.keyW.isDown) {
            this.player.setVelocityY(-210);
        }
        else if (this.keyS.isDown) {
            this.player.setVelocityY(210);
        }
        else{
            this.player.setVelocityY(0); 
        }


    }

}