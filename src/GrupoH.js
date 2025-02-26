const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('terrain', 'terrain.png'); 
    this.load.spritesheet('player', 'a-king.png', {
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.tilemapTiledJSON('mapa', 'novo_mapa.json');
}

function create() {
    const map = this.make.tilemap({ key: 'mapa' });
    const tileset = map.addTilesetImage('mapa', 'terrain');
    const groundLayer = map.createLayer('ground', tileset, 0, 0);
    const wallLayer = map.createLayer('wall', tileset, 0, 0);
    this.iso = new Phaser.Plugins.Isometric(this);
    this.iso.projector.anchor.setTo(0.5, 0.2);
    const player = this.iso.addIsoSprite(200, 200, 0, 'player', 0);
    player.setOrigin(0.5, 0.5);
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBackgroundColor('#ff0000');
    this.cursors = this.input.keyboard.createCursorKeys();
    wallLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(player, wallLayer);
}

function update() {
    const speed = 100;
    const player = this.iso.getIsoSprites()[0];

    if (this.cursors.left.isDown) {
        player.x -= speed;
    } else if (this.cursors.right.isDown) {
        player.x += speed;
    }

    if (this.cursors.up.isDown) {
        player.y -= speed;
    } else if (this.cursors.down.isDown) {
        player.y += speed;
    }

    player.depth = player.y + player.x;
}
