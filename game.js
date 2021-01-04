// Config object is how you configure the game - config is passed in as an argument in the game function
const config = {
    type: Phaser.AUTO,
    width: 800, 
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false,
            }
        }
    }
};

// Initialize/Execute Game
const game = new Phaser.Game(config);

// Preload assets and any other necessities for game
function preload() {
    this.load.image('background', 'assets/sky.png');
    this.load.image('platforms', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('kiwi', 'assets/kiwi.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}
// Create in-game objects
let player;
let platforms;
let cursors;
let score = 0;
let scoreText;
let bombs;
let gameOver = false;

function create() {
    // Add the ground, platforms, resize & reposition them
    this.add.image(400, 300, 'background');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'platforms').setScale(2).refreshBody();

    platforms.create(600, 400, 'platforms');
    platforms.create(50, 250, 'platforms');
    platforms.create(750, 220, 'platforms');

    // Create the game sprite
    player = this.physics.add.sprite(100, 450, 'dude');
    // Player bounce
    player.setBounce(0.2);
    // Games edges cannot be passed
    player.setCollideWorldBounds(true);

    // Animate left
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });
    // Animate stillness
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20,
    });
    // Animate right
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 } ),
        frameRate: 10,
        repeat: -1,
    });

    // Create stars to be collected
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Add bombs
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    // Add score text
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // Create Cursor keys
    cursors = this.input.keyboard.createCursorKeys();
};

// Update
function update(){
    if (gameOver) {
        return;
    };
    
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText(`Score: ${score}`);
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

function hitBomb (player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}
