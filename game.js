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

const gameConfig = {
	gravity: 700,
    speedY: 40
}

let game = new Phaser.Game(config);
let cursors;

let floor;
let walls;
let platformPool;
let activePlatforms;

let player;
let pickaxe;
let pickaxeCollision;

let score = 0;
let scoreText;
let timedEvent;
let music;

let jumping = false;
let beingFlungByPickaxe = false;

let gameOver = false;
let gameOverText;


let playerParticle;
let emitterPlayer;

function preload() {
	this.load.image('grass', 'assets/rock.png');
	this.load.spritesheet('dude',
		'assets/dude.png',
		{ frameWidth: 32, frameHeight: 60 }
	);
	this.load.image('pickaxe', 'assets/pickaxe.png')

	this.load.audio('theme', 'assets/theme.mp3');
	this.load.image('particle', 'assets/particles/smoke-puff2.png');
	this.load.image('particlePlayer', 'assets/particles/blue.png');
}

function create() {

	music = this.sound.add('theme');

	music.play(); //Uncomment this for music

	timedEvent = this.time.addEvent({
		delay: 1000, callback: () => {
			score++;
		}, callbackScope: this, loop: true
	});
	scoreText = this.add.text(16, 16, 'score: 0', { fontFamily: 'system-ui, Ubuntu, sans-serif', fontSize: '32px', fill: '#ffffff' });
	scoreText.setDepth(100);

	// Spawn platform(s) every 3 seconds
	platformEvent = this.time.addEvent({
		delay: 3000, callback: () => {
			for (a of generatePlatforms()) {
				addPlatform(a[0], a[1], this);
			}
		}, callbackScope: this, loop: true
	});

	// Platform groups - pool for reuse
	activePlatforms = this.physics.add.group({
		removeCallback: function(platform) {
			this.scene.platformPool.add(platform);
		}
	});
	platformPool = this.physics.add.group({
		removeCallback: function(platform) {
			this.scene.activePlatforms.add(platform);
		}
	});

	// static walls
	walls = this.physics.add.staticGroup();
	walls.create(0, 400, 'grass').setScale(1, 30).refreshBody();
	walls.create(600, 400, 'grass').setScale(1, 30).refreshBody();
	// initial floor
	addInitialPlatform(game.config.width / 2, game.config.height / 2 + 40, game.config.width, this);


	// Initial set of platforms
	addInitialPlatform(250, 200, 200, this);
	addInitialPlatform(200, 300, 200, this);

	for (a of generatePlatforms()) {
		addPlatform(a[0], a[1], this);
	}

	for (a of generatePlatforms()) {
		addInitialPlatform(a[0], 100, a[1], this);
	}

	// For getting cursor key input
	cursors = this.input.keyboard.createCursorKeys();

	// player setup
	player = this.physics.add.sprite(100, game.config.height / 2, 'dude');
	player.setBounce(0.1);
	//player.setCollideWorldBounds(true);
	player.body.setGravityY(gameConfig.gravity) // adds to global gravity


	// add collision player-platform

	this.physics.add.collider(player, activePlatforms, stopBeingFlung, null, null);
	this.physics.add.collider(player, walls, stopBeingFlung, null, null);

	// pickaxe creation
	pickaxe = this.physics.add.sprite(0, 0, 'pickaxe');
	pickaxe.body.setGravityY(1000);
	pickaxe.active = false;
	pickaxe.visible = false;
	// collision only added on throw

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
		frames: this.anims.generateFrameNumbers('dude', { start: 20, end: 28 }),
		frameRate: 10,
		repeat: -1
	});


	//Particles
	const p = this.add.particles('particle');
	const e = p.createEmitter();

	e.setPosition(300, 800);
	e.setBounds(0, 800, 1000, 20);
	e.setSpeed(300);
	e.setBlendMode(Phaser.BlendModes.HUE);

	playerParticle = this.add.particles('particlePlayer');
	emitterPlayer = playerParticle.createEmitter();
	emitterPlayer.setSpeed(50);
	emitterPlayer.setScale(0.2);

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
		floor.setVelocityY(gameConfig.speedY);
		floor.setImmovable(true);
	}
}

function addInitialPlatform(x, y, width, context) {
	let floor = context.physics.add.sprite(x, y, 'grass');
	floor.displayWidth = width;
	activePlatforms.add(floor);
	floor.setVelocityY(gameConfig.speedY);
	floor.setImmovable(true);
}

xRange = [100, 250, 350, 500];
widthRange = [100, 200];
smallerWidthRange = [40, 80];

function generatePlatforms() {
	if (score < 30) {
		return [
			[Phaser.Math.Between(xRange[0], xRange[3]), Phaser.Math.Between(widthRange[0], widthRange[1])]
		]
	} else {
		let random = Math.random();
		if (random < 0.4) {
			return [
				[Phaser.Math.Between(40, xRange[0]), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])],
				[Phaser.Math.Between(xRange[1], xRange[2]), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])],
				[Phaser.Math.Between(xRange[3], 560), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])]
			]
		} else if (random < 0.65) {
			return [
				[Phaser.Math.Between(xRange[0], xRange[1]), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])],
				[Phaser.Math.Between(xRange[2], xRange[3]), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])]
			]
		} else {
			return [
				[Phaser.Math.Between(xRange[1], xRange[2]), Phaser.Math.Between(smallerWidthRange[0], smallerWidthRange[1])],
			]
		}
	}
}

function normalMovement() {

	// L/R movement
	if (cursors.left.isDown) {
		player.setVelocityX(-200);
		player.anims.play('left', true);
		emitterPlayer.setScale(0.1);
	} else if (cursors.right.isDown) {
		player.setVelocityX(200);
		player.anims.play('right', true);
		emitterPlayer.setScale(0.1);
	} else if(cursors.up.isDown){
		emitterPlayer.setScale(0.1);
	} else {
		player.setVelocityX(0);
		player.anims.play('turn', true);
		emitterPlayer.setScale(0);
	}

	// jumping
	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-430);
		emitterPlayer.setScale(0.1);
		jumping = true;
	} else if (cursors.down.isDown) {
		player.setVelocityY(600);
	}
}

function handlePickaxeThrow(context) {
	pickaxe.active = true;
	pickaxe.visible = true;
	pickaxe.x = player.x;
	pickaxe.y = player.y;
	let vector = new Phaser.Math.Vector2((game.input.activePointer.worldX - pickaxe.x), (game.input.activePointer.worldY - pickaxe.y));
	pickaxe.setVelocityX((Math.cos(vector.angle()) * 700) + player.body.velocity.x);
	pickaxe.setVelocityY((Math.sin(vector.angle()) * 700) + player.body.velocity.y);
	// add collision
	pickaxeCollision = context.physics.add.collider(pickaxe, activePlatforms, createPickaxeHitHandler(context), null, null);
}

function removePickaxe(context) {
	try {
		context.physics.world.colliders.remove(pickaxeCollision)
	} catch (e) { }
	pickaxe.active = false;
	pickaxe.visible = false;
}

function createPickaxeHitHandler(context) {
	return () => {
		if (beingFlungByPickaxe) return;
		removePickaxe(context);
		beingFlungByPickaxe = true;
		// move player towards pickaxe
		let vector = new Phaser.Math.Vector2((pickaxe.x - player.x), (pickaxe.y - pickaxe.x));
		player.y -= 4;
		player.setVelocityX((Math.cos(vector.angle()) * 300) + player.body.velocity.x);
		player.setVelocityY((Math.sin(vector.angle()) * 600));
		player.setGravityY(200);
	}
}

function stopBeingFlung() {
	if (beingFlungByPickaxe) {
		beingFlungByPickaxe = false;
		player.setVelocityX(0);
		player.setVelocityY(0);
		player.setGravityY(gameConfig.gravity);
	}
}

function update() {
	scoreText.setText('Score: ' + score);
	this.physics.add.collider(player, activePlatforms);

	emitterPlayer.setPosition(player.x, player.y);

	if (beingFlungByPickaxe) {
		// don't move normally (until key press or wall hit)
		if (cursors.up.isDown) {
			stopBeingFlung();
		}
	} else {
		normalMovement();
		if (pickaxe.active) {
			if (pickaxe.y > player.y) {
				removePickaxe(this);
			}
		} else if (game.input.activePointer.isDown) {
			handlePickaxeThrow(this);
		}
	}

	// Game over when hitting bottom
	if (player.y > 760) {
		score = 0;
		this.scene.restart();
		music.stop();
		score = 0;
	}

	// Kill out-of-bounds platforms
	activePlatforms.children.iterate(platform => {
		if (!platform) return;
		if (platform.y + platform.displayHeight / 2 > game.config.height) {
			activePlatforms.killAndHide(platform);
			activePlatforms.remove(platform);
		}
	});
}
