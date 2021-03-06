/*
* The mainGame script describes stack 'n' shaek main play mode
* This mode rewards the player with more time for stacking up a tower of pieces and toppling their stack
*
* Using the module pattern, the webpage's global app variable is given new functionality, namely the mainGame variable
*
* The mainGame variable is used as a Phaser.State object, which uses predetermined prototype functions 
* (preload, create, update, etc)
*
* Created within the main game is a pool of 40 'piece' objects, which are 
* instances of Phaser.Sprite with custom images & colliders for their desired shapes
*
*
*/

'use strict';

var app = (function(app){	

	
	/**
	* Main game state variable
	*
	* Defines all needed variables for the main game to play, initialized to a default value
	*/
	var mainGame = function(game){
		// Groups
		this.cursors;
		this.platforms;
		this.warnings;
		this.pieces;
		this.tower;
		
		// Display 
		this.scoreText;
		this.timerText;

		// Sounds
		this.bgMusic;
		this.scoredSound;
		this.stackedSound;

		// Collision Groups
		this.playerCollision;
		this.pieceCollision;

		// Values
		this.score;
		this.timer;
		this.warningTimer;
		this.nextPieceX;
		this.nextPieceY;
		this.currentStackCount;
		this.lastStackCount;
	}
	
	/**
	* Prototype of the mainGame state
	* Contains phaser default functions
	*/
	mainGame.prototype = {
		// Function that initializes values before the game begins
		init: function() {
			this.timer = 60;
			this.score = 0;
			this.nextPieceX = 0;
			this.nextPieceY = 40;
			this.currentStackCount = 0;
			this.lastStackCount = 0;
		},

		
		/**
		* Function to preload necessary images
		* Predefined function called by Phaser, happens before updating or creating actual objects
		*/
		preload: function() {
			// Load in all the sprite images
			this.game.load.image('square', 'assets/square.png');
			this.game.load.image('rectangle', 'assets/rectangle.png');
			this.game.load.image('tri', 'assets/tri.png');
			this.game.load.image('tee', 'assets/tee.png');
			this.game.load.image('corner', 'assets/corner.png');
			this.game.load.image('bucket', 'assets/bucket.png');
			this.game.load.image('playerPlatform', 'assets/playerPlatform.png');
			this.game.load.image('background', 'assets/background.png');

			// Load sound effects and music
			this.game.load.audio('bgMusic', 'assets/bgMusic.mp3');
			this.game.load.audio('stacked', 'assets/stacked.wav');
			this.game.load.audio('scored', 'assets/scored.wav');
			
			// Get physics for all of the pieces
			this.game.load.physics('physicsData', 'assets/physics/sprites.json');
		}, // End preload
	
		/**
		* Function to create and define objects and world properties
		* 
		* Properties of the world are defined first and largely revolve around the physics of the world
		* 
		* Physics System -> Phaser.P2 physics
		* Impact Events -> 	True
		* Apply Gravity -> 	True
		* Gravity.y 	-> 	50		(50 pixels per second downwards)
		* Restitution -> 	0	(0% restitution, no bounce)
		* Game.Stage.backgroundColor -> #000
		*
		* Objects and Data Structures defined second and involve the physical objects themselves
		* These come second because more objects rely on physics than those that do not
		* 
		* Cursors -> 			game.input.keyboard
		* Pieces -> 			game.group
		* Player Platform -> 	game.group
		* Score Text -> 		game.text
		* Player Collision -> 	game.physics.collisionGroup
		* Piece Collision ->	game.physics.collisionGroup
		* Platforms ->			game.group
		* Pieces -> 			game.group
		*
		*/
		create: function() {

			// Give nextPieceX the proper value
			this.nextPieceX = this.game.rnd.integerInRange(40, app.SCREEN_WIDTH - 40);
			
			// Define the cursors that will control the player
			this.cursors = this.game.input.keyboard.createCursorKeys();

			// Define the background for the stage
			this.game.add.tileSprite(0, 0, app.SCREEN_WIDTH, app.SCREEN_HEIGHT, 'background');
			
			//  We're going to be using physics, so enable the P2 Physics system
			this.game.physics.startSystem(Phaser.Physics.P2JS);

			// Tell the game to fire impact events - these will allow for custom collision responses
			this.game.physics.p2.setImpactEvents(true);

			// Set the properties of physics interactions here
			this.game.physics.p2.gravity.y = 300;
			this.game.physics.p2.applygravity = true;
			this.game.physics.p2.restitution = 0;
			this.game.physics.p2.friction = 100;
			
			// Give the scoreText and timer something to draw on screen
			this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });
			this.timerText = this.game.add.text(16, 48, 'time: ', { fontSize: '30px', fill :'#FFF'});

			//  Create all of the groups in the game
			this.platforms = this.game.add.group();	
			this.pieces = this.game.add.group();
			this.warnings = this.game.add.group();

			// Enable physics on the piece and tower groups
			this.pieces.enableBody = true;
			this.pieces.physicsBodyType = Phaser.Physics.P2JS;

			// Create the collision groups
			this.playerCollision = this.game.physics.p2.createCollisionGroup();
			this.pieceCollision = this.game.physics.p2.createCollisionGroup();

			// Make sure that bounds collision is updated -- allows all collider groups to stay within world bounds
			this.game.physics.p2.updateBoundsCollisionGroup();
	
			// Create the platform on which blocks will land.
			var playerPlatform = this.game.add.sprite(40, 80, 'playerPlatform');

			// Enable physics on the platform
			this.game.physics.p2.enable(playerPlatform, false);

			// Load the collision information and set other properties
			playerPlatform.body.loadPolygon('physicsData', 'playerPlatform');
			playerPlatform.body.x = app.SCREEN_WIDTH /2;
			playerPlatform.body.y = app.SCREEN_HEIGHT - (app.SCREEN_HEIGHT/5);
			playerPlatform.body.angle = 90;
			playerPlatform.body.kinematic = true;
			playerPlatform.stacked = true;

			// Add the playerPlatform to the playerCollision group
			playerPlatform.body.setCollisionGroup(this.playerCollision);
			
			// Define what the playerPlatform collides with
			// Not adding a callback because one is not necessary
			playerPlatform.body.collides(this.pieceCollision);

			// Add the platform to the platform group. 
			// This is here in case we decide to add more platforms later.
			this.platforms.add(playerPlatform);
	
			// Fill the pool of pieces with dead game objects
			// Rather morbid
			this.fillPiecePool(40);

			// Fill the pool of warnings with dead warning objects
			// Still morbid
			this.fillWarningPool(5);

			// Quick revival of the warning for the next piece to drop
			var nextWarn = this.warnings.getFirstDead();
			nextWarn.x = this.nextPieceX;
			nextWarn.y = this.nextPieceY + 40;
			nextWarn.revive();

			// With the pieces filled, set a looping timer that revives one of the dead pieces to drop
			// This statement describes a looping event that revives a piece every 3 seconds
			this.game.time.events.loop(3000, this.reviveOne, this, this); // Improper behavior with first 'this', second 'this' passed as explicit parameter
			
			// This will count using the same mehtod as above, and once a second will update the timer.
			this.game.time.events.loop(1000, this.updateTimer, this, this); // Still Improper


			// Start off the background music in a loop
			this.bgMusic = new Phaser.Sound(this.game, 'bgMusic', 1, true);
			this.bgMusic.play();

			// Set up sound effects
			this.stackedSound = new Phaser.Sound(this.game, 'stacked', 1, false);
			this.scoredSound = new Phaser.Sound(this.game, 'scored', 1, false);
		}, // End create


		/**
		* Method that populates the pieces group with a specified amount of piece objects
		* Pieces are defined in the stackPiece.js file
		* All pieces start dead so that they don't all pollute the game space
		* All pieces have an onRevive event listener that resets their internal values
		*
		* @param {number} [10] - The number of pieces to add to the pieces group
		*/
		fillPiecePool: function (numPieces) {
			// If numPieces isn't defined, set it to 10
			if(numPieces === undefined)
				numPieces = 10;

			// Loop the specified amount of times, creating a piece each time (and killing it)
			for(var i = 0; i < numPieces; i++) {

				// Make a new piece
				var piece = new app.Piece(this.game);

				// Add the piece to the 'pieces' group
				this.pieces.add(piece);

				// Set the collisionGroup of the piece to the pieceCollision group
				piece.body.setCollisionGroup(this.pieceCollision);

				// Define the callback for whenever a piece collides with either another piece or a player platform
				piece.body.collides([this.pieceCollision, this.playerCollision], testIfStacked, this);

				// Kill the piece, we don't want to start with lots of living pieces crowding the screen
				piece.kill();

			}// End for-loop
		},// End fillPiecePool

		/**
		* Method that populates the warnings group with a specified amount of warning objects
		* Warnings are defined in the warning.js file
		* All warnings start dead so that they don't all pollute the game space
		* All warnings have an onRevive event listener that resets their internal values
		*
		* @param {number} [5] - The number of warnings to add to the warnings group
		*/
		fillWarningPool: function (numWarnings) {
			// If numwarnings isn't defined, set it to 5
			if(numWarnings === undefined)
				numWarnings = 5;

			// Loop the specified amount of times, creating a warning each time (and killing it)
			for(var i = 0; i < numWarnings; i++) {

				// Make a new warning
				var warning = new app.Warning(this.game, 0, 0);

				// Add the warning to the 'warnings' group
				this.warnings.add(warning);

				// Kill the warning, we don't want to start with lots of living warnings crowding the screen
				warning.kill();

			}// End for-loop
		},// End fillWarningPool

		/**
		* Method to revive a single piece, which "drops" it from the top of the screen
		* Randomly selects a dead piece and calls revive() on it
		* Used as a callback in the mainGame's timeDropper object, which is an instance of Phaser.Timer
		*
		* @param {Phaser.State} the context variable that should be used to access properties and methods of the game state
		*/
		reviveOne: function(context) {
			// Count how many dead pieces there are and save the max
			// max is one less than total dead pieces to index an array properly
			var max = context.pieces.countDead() - 1;

			// Take a random integer number no greater than the amount of all dead pieces
			var chosenOne = context.game.rnd.integerInRange(0, max);

			// Declare the iterator that will be checked against the chosenOne
			var i = 0;

			// Check if the dead piece per-loop is the chosen one and resurrect it
			context.pieces.forEachDead(function(piece){
				// Check if iterator matches the chosen random value
				// In the case of a match, a piece is revived, the warning is killed, the next piece location is determined, and a new warning is made
				if(i == chosenOne) {

					// Revive the piece and put it at the designated position
					piece.revive();
					piece.body.x = this.nextPieceX;
					piece.body.y = this.nextPieceY;

					// Kill the warning that was pointing out this piece
					this.warnings.getFirstAlive().kill();

					// The warning dies in the name of the chosen one
					// Revive a new warning to herald the arrival of the next chosen one
					var nextWarning = this.warnings.getFirstDead().revive();

					// Determine new drop location
					this.nextPieceX = piece.game.rnd.integerInRange(40, app.SCREEN_WIDTH - 40);

					// Give the newly revived warning correct values
					nextWarning.x = this.nextPieceX;
					nextWarning.y = this.nextPieceY + 40;

				}
				// Iterate as the loop executes
				i++;
			}, context);
		}, // End reviveOne

		/**
		* Method that removes pieces from the tower and gives the player a score and time bonus
		* All pieces flagged as 'stacked' are considered in the tower
		*/
		collapseTower: function() {
			var tempScore = 0;
			var multi = 0;

			this.pieces.forEachAlive(function(piece) {
				if(piece.stacked){
					piece.kill();
					tempScore += 50;
					multi ++;
				}
			});
			this.score += tempScore * multi;
			this.timer += multi*2;
			this.scoredSound.play();

			this.currentStackCount = 0;
			this.lastStackCount = 0;
		}, // End collapseTower

		/*
		* Update the timer and it's text
		*/
		updateTimer: function() {
			if (this.timer > 0) {
				this.timer--;
			}
		}, // End updateTimer

		/**
		* Update the stuff.
		*/
		update: function() {
			
			// Bug present if createPiece() called within the forEachAlive loop
			// Remedy by setting context variable "self" to outside scope
			var self = this;

			// Deal with all the pieces second
			this.pieces.forEachAlive(function(piece) {
				// Kill the Piece if it hits the Bottom
				if(piece.body.y >= (app.SCREEN_HEIGHT - piece.height)) {
					// If the piece-to-die is stacked, call collapseTower
					if(piece.stacked) {
						self.collapseTower();
					}
					else {
						piece.kill();
					}
				}
			});

			// Check if a new piece was added to the stack
			this.checkAddedStack();

			// The cursor handler.
			if (this.cursors.left.isDown) {
				//  Move to the left
				this.platforms.forEachAlive(function(player) {
					// Make sure platform's positions are greater than the left bound
					if (player.body.x >= 0 + player.width/2) {
						player.body.velocity.x = Math.max(player.body.velocity.x -10, -230);
					} else {
						// Stand still
						player.body.velocity.x = 0;
					}
				});
			}
			else if (this.cursors.right.isDown) {
				//  Move to the right
				this.platforms.forEachAlive(function(player) {
					// Make sure platform's positions are less than the right bound
					if (player.body.x <= app.SCREEN_WIDTH - player.width) {
						// if the players velocity+10 is smaller then 200
						// then the velocity becomes the velocity+10
						// otherwise it caps out at 200
						player.body.velocity.x = Math.min(player.body.velocity.x + 10, 230);
					} else {
						// Stand still
						player.body.velocity.x = 0;
					}
				});
			}
			else {
				// Stand still
				this.platforms.forEachAlive(function(player) {
					// if the velocity is positive move it towards 0
					// if the velocity is negative move it towards the 0
					if (player.body.velocity.x > 0) {
						player.body.velocity.x = Math.max(player.body.velocity.x - 10, 0);
					} else if ( player.body.velocity.x <0) {
						player.body.velocity.x = Math.min(player.body.velocity.x + 10, 0);
					}
				});
			}

			this.scoreText.text = "Score: " + self.score;
			this.timerText.text = "Time: " + self.timer;


			// If the timer ran out, end the game
			if(this.timer <= 0) {
				// Stop the music
				this.bgMusic.stop();

				// Change the roundScore to the score at the end of the game
				app.roundScore = this.score;
				
				// Create the new State
				this.game.state.start('GameOver', this.score);
			}

		},// End Update

		// See if a new piece was added to the stack
		checkAddedStack: function(){
			this.currentStackCount = 0;

			var self = this;

			// Total the current stack count
			this.pieces.forEachAlive(function(piece){
				if(piece.stacked){
					self.currentStackCount ++;
				}
			});

			// See if there is a difference. If so, a piece was added to the stack
			if(this.currentStackCount != this.lastStackCount){
				this.stackedSound.play();
			}

			// Set the previous count to the current count for next call
			this.lastStackCount = this.currentStackCount;
		},

		// The shutdown function that gets called when the mainGame state is exited
		shutdown: function() {
			// All pieces are destroyed
			this.pieces.destroy();

			// All platforms are destroyed
			this.platforms.destroy();

			// All warnings are destroyed
			this.warnings.destroy();

			// Remove the text from the screen
			this.scoreText.destroy();
			this.timerText.destroy();

			// Destroy the sound assets
			//this.bgMusic.destroy();
			//this.scoredSound.destroy();
			//this.stackedSound.destroy();
		} // End shutdown
	} // End mainGame.prototype

	/**
	* Function that adds a piece object to the tower group in the event of a collision 
	* between an unstacked piece and a stacked piece. 
	* 'stacked' is a variable attached to the body of the piece
	*
	* @param {Phaser.Physics.Body} The body of the piece who called this collision event handler
	* @param {Phaser.Physics.Body} The body of the piece that bodyA collided with
	*/
	function testIfStacked(bodyA, bodyB) {
		// If bodyB IS of a stacked sprite AND bodyA is NOT of a stacked sprite, then make bodyA's sprite stacked
		if(bodyB.sprite.stacked == true && bodyA.sprite.stacked == false && bodyA.velocity.y < 20) {
			bodyA.sprite.stacked = true;
		}
		// Otherwise, nothing happens
	}// End testIfStacked
	
	// Adding mainGame state to the module interface
	app.mainGame = mainGame;
	
	// Return the app with its augments here
	return app;
// Following the module pattern, IFFE invokes with either a predefined app or an empty object
}(app || {}));