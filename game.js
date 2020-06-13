var config = {
	type: Phaser.AUTO,
	width: 600,
    height: 800,
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
	backgroundColor: "#dbcf8b",
};

let game = new Phaser.Game(config);
let cursors;
let stuff;
let floor;
let player;
var score = 0;
var scoreText;
var timedEvent;
let jumping = false;
var gameOver = false;
var gameOverText;
console.log(game.input, this);

function preload() {
	this.load.image('icon', 'assets/icon.png');
	this.load.image('grass', 'assets/grass.png');
	this.load.spritesheet('dude',
		'assets/dude.png',
		{ frameWidth: 32, frameHeight: 60 }
	);

}

function create() {

	timedEvent = this.time.addEvent({ delay: 1000, callback: () => {
		score++;
		}, callbackScope: this, loop: true });
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' });



	stuff = this.physics.add.staticGroup();
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
	player = this.physics.add.sprite(100, 450, 'dude');
	player.setBounce(0.1);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300) // adds to global gravity

	// add collision player-platform
	this.physics.add.collider(player, stuff);

	this.physics.add.collider(player, floor);



	//Player animation
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 10, end: 19}),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'turn',
		frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 9 }),
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 19, end: 28}),
		frameRate: 10,
		repeat: -1
	});


}

function update() {
	scoreText.setText('Score: ' + score);


	// L/R movement
	if (cursors.left.isDown) {
		player.setVelocityX(-200);
		player.anims.play('left', true);
	} else if (cursors.right.isDown) {
		player.setVelocityX(200);
		player.anims.play('right', true);

	} else {
		player.setVelocityX(0);
		player.anims.play('turn', true);
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

