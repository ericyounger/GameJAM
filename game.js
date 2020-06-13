var config = {
	type: Phaser.AUTO,
	width: 1280,
    height: 720,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	},
};

let game = new Phaser.Game(config);
let cursors;
let stuff;
let floor;
let player;

let jumping = false;

console.log(game.input, this);

function preload() {
	this.load.image('icon', 'assets/icon.png');
	this.load.image('grass', 'assets/grass.png');
}

function create() {
	// floor
	floor = this.physics.add.staticGroup();
	floor.create(640, 720, 'grass').setScale(40, 1).refreshBody();

	// platforms
	stuff = this.physics.add.staticGroup();
	stuff.create(640, 600, 'grass').setScale(10, 1).refreshBody();
	stuff.create(250, 350, 'grass').setScale(10, 1).refreshBody();
	stuff.create(640, 500, 'grass').setScale(10, 1).refreshBody();
	stuff.create(900, 350, 'grass').setScale(10, 1).refreshBody();

	cursors = this.input.keyboard.createCursorKeys();

	// player setup
	player = this.physics.add.sprite(100, 450, 'icon');
	player.setBounce(0.1);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300) // adds to global gravity

	// add collision player-platform
	this.physics.add.collider(player, stuff);
	this.physics.add.collider(player, floor);
}

function update() {
	// L/R movement
	if (cursors.left.isDown) {
		player.setVelocityX(-200);
	} else if (cursors.right.isDown) {
		player.setVelocityX(200);
	} else {
		player.setVelocityX(0);
	}

	for (platform of stuff.getChildren()) {
		platform.y += 0.1;
		platform.refreshBody();
	}

	// jumping
	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-500);
		jumping = true;
	} else if (cursors.down.isDown) {
		player.setVelocityY(400);
		
	}

}
