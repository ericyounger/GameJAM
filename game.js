var config = {
	type: Phaser.AUTO,
	width: 600,
	height: 800,
	physics: {
		default: "arcade",
		arcade: {
			gravity: 0,
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
let floor;
let walls;
let player;
var score = 0;
var scoreText;
var timedEvent;
let jumping = false;
var gameOver = false;
var gameOverText;
let speedY = 40;
let platformPool;
let activePlatforms;
var music;

function preload() {
	this.load.image('icon', 'assets/icon.png');
	this.load.image('grass', 'assets/rock.png');
	this.load.spritesheet('dude',
		'assets/dude.png',
		{ frameWidth: 32, frameHeight: 60 }
	);

	this.load.audio('theme', 'assets/theme.mp3');
	this.load.image('particle', 'assets/particles/smoke-puff2.png');


}

function create() {

	music = this.sound.add('theme');

	music.play(); //Uncomment this for music

	timedEvent = this.time.addEvent({ delay: 1000, callback: () => {
		score++;
		}, callbackScope: this, loop: true });
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' });
	scoreText.setDepth(100);

	platformEvent = this.time.addEvent({
		delay: 3000, callback: () => {
			for (a of generatePlatforms()) {
				addPlatform(a[0], a[1], this);
			}
		}, callbackScope: this, loop: true
	});

	activePlatforms = this.physics.add.group({
		removeCallback: function(platform) {
			platform.scene.platformPool.add(platform);
		}
	});
	platformPool = this.physics.add.group({
		removeCallback: function(platform) {
			platform.scene.activePlatforms.add(platform);
		}
	});

	walls = this.physics.add.staticGroup();
	walls.create(0, 400, 'grass').setScale(1,30).refreshBody();
	walls.create(600, 400, 'grass').setScale(1,30).refreshBody();
	// floor
	floor = this.physics.add.sprite(game.config.width / 2, game.config.height / 2 + 40, 'grass');
	floor.setImmovable(true);
	floor.setVelocityY(speedY);
	floor.displayWidth = game.config.width;


	//addPlatform(200, 200, this);
	addInitialPlatform(250, 200, 200, this);
	addInitialPlatform(200, 300, 200, this);

	for (a of generatePlatforms()) {
		addPlatform(a[0], a[1], this);
	}

	for (a of generatePlatforms()) {
		addInitialPlatform(a[0], 100, a[1], this);
	}

	cursors = this.input.keyboard.createCursorKeys();

	// player setup
	player = this.physics.add.sprite(100, game.config.height / 2, 'dude');
	player.setBounce(0.1);
	//player.setCollideWorldBounds(true);
	player.body.setGravityY(700) // adds to global gravity


	// add collision player-platform

	this.physics.add.collider(player, activePlatforms);
	this.physics.add.collider(player, floor);
	this.physics.add.collider(player, walls);


	//Player animation
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 10, end: 19 }),
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
		frames: this.anims.generateFrameNumbers('dude', { start: 19, end: 28 }),
		frameRate: 10,
		repeat: -1
	});


	//Particles
	const p = this.add.particles('particle');
	const e = p.createEmitter();

	e.setPosition(300,800);
	e.setBounds(0,800,1000,20);
	e.setSpeed(300);
	e.setBlendMode(Phaser.BlendModes.HUE);
	e.s


}

function addPlatform(x, width, context) {
	if (platformPool.getLength()) {
		let platform = platformPool.getFirst();
		platform.x = x;
		platform.y = -platform.displayHeight / 2;
		platform.active = true;
		platform.visible = true;
		platformPool.remove(platform);
	} else {
		let floor = context.physics.add.sprite(x, game.config.height / 2 + 40, 'grass');
		floor.y = -floor.displayHeight / 2;
		floor.displayWidth = width;
		activePlatforms.add(floor);
		floor.setVelocityY(speedY);
		floor.setImmovable(true);
	}
}

function addInitialPlatform(x, y, width, context) {
	let floor = context.physics.add.sprite(x, y, 'grass');
	floor.displayWidth = width;
	activePlatforms.add(floor);
	floor.setVelocityY(speedY);
	floor.setImmovable(true);
}

xRange = [100, 500];
widthRange = [100, 200];

function generatePlatforms() {
	return [
		[Phaser.Math.Between(xRange[0],xRange[1]), Phaser.Math.Between(widthRange[0],widthRange[1])]
	]
}

function update() {
	scoreText.setText('Score: ' + score);
	this.physics.add.collider(player, activePlatforms);


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

	if (player.y > 760) {
		score = 0;
		this.scene.restart();
		music.stop();
		score = 0;
	}

	// jumping
	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-430);
		jumping = true;
	} else if (cursors.down.isDown) {
		player.setVelocityY(600);

	}

	activePlatforms.children.iterate(platform => {
		if (platform.y + platform.displayHeight / 2 > game.config.height) {
			activePlatforms.killAndHide(platform);
			activePlatforms.remove(platform);
		}
	});

}
