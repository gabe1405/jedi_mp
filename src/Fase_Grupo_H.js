import Phaser from "phaser";

class IsoScene extends Phaser.Scene {
    constructor() {
        super({ key: "IsoScene" });
    }

    preload() {
        this.load.image("fase", "teste/fase.png");
        this.load.spritesheet("jogador", "teste/player.png", { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.map = this.make.tilemap({ width: 10, height: 10, tileWidth: 64, tileHeight: 32 });
        this.tileset = this.map.addTilesetImage("fase");
        this.layer = this.map.createBlankLayer("tela", this.tileset);
        
        this.player = this.add.sprite(400, 300, "jogador");
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        let speed = 2;
        if (this.cursors.left.isDown) {
            this.player.x -= speed;
            this.player.y += speed / 2;
        } else if (this.cursors.right.isDown) {
            this.player.x += speed;
            this.player.y -= speed / 2;
        }
        if (this.cursors.up.isDown) {
            this.player.x -= speed;
            this.player.y -= speed / 2;
        } else if (this.cursors.down.isDown) {
            this.player.x += speed;
            this.player.y += speed / 2;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: IsoScene,
    physics: { default: "arcade" },
};

const game = new Phaser.Game(config);
