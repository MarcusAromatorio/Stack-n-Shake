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
		// Variables
		this.cursors;
		this.platforms;
		this.scoreText;
		this.timerText;
		this.pieces;
		this.tower;
		this.playerCollision;
		this.pieceCollision;
		this.score = 0;
		this.timer = 60; 
	}
	
	/**
	* Prototype of the mainGame state
	* Contains phaser default functions
	*/
	mainGame.prototype = {
		
		// Function that initializes values before the game begins
		init: function() {
			this.timer = 60;
		},

		/**
		* Function to preload necessary images
		* Predefined function called by Phaser, happens before updating or creating actual objects
		*/
		preload: function() {
			this.game.load.image('square', 'assets/square.png');
			this.game.load.image('rectangle', 'assets/rectangle.png');
			this.game.load.image('tri', 'assets/tri.png');
			this.game.load.image('tee', 'assets/tee.png');
			this.game.load.image('corner', 'assets/corner.png');
			this.game.load.image('bucket', 'assets/bucket.png');
			
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
			
			// Define the cursors that will control the player
			this.cursors = this.game.input.keyboard.createCursorKeys();

			// Define the background color for the stage
			this.game.stage.backgroundColor = '#000';
			
			//  We're going to be using physics, so enable the P2 Physics system
			this.game.physics.startSystem(Phaser.Physics.P2JS);

			// Tell the game to fire impact events - these will allow for custom collision responses
			this.game.physics.p2.setImpactEvents(true);

			// Set the properties of physics interactions here
			this.game.physics.p2.gravity.y = 50;
			this.game.physics.p2.applygravity = true;
			this.game.physics.p2.restitution = 0;
			
			// Give the scoreText and timer something to draw on screen
			this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });
			this.timerText = this.game.add.text(16, 48, 'time: ', { fontSize: '30px', fill :'#FFF'});

			//  Create all of the groups in the game
			this.platforms = this.game.add.group();	
			this.pieces = this.game.add.group();

			// Enable physics on the piece and tower groups
			this.pieces.enableBody = true;
			this.pieces.physicsBodyType = Phaser.Physics.P2JS;

			// Create the collision groups
			this.playerCollision = this.game.physics.p2.createCollisionGroup();
			this.pieceCollision = this.game.physics.p2.createCollisionGroup();

			// Make sure that bounds collision is updated -- allows all collider groups to stay within world bounds
			this.game.physics.p2.updateBoundsCollisionGroup();
	
			// Create the platform on which blocks will land.
			var playerPlatform = this.game.add.sprite(40, 80, 'rectangle');

			// Enable physics on the platform
			this.game.physics.p2.enable(playerPlatform, false);

			// Load the collision information and set other properties
			playerPlatform.body.loadPolygon('physicsData', 'rectangle');
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

			// With the pieces filled, set a looping timer that revives one of the dead pieces to drop
			// This statement describes a looping event that revives a piece every 4 seconds
			this.game.time.events.loop(4000, this.reviveOne, this, this); // Improper behavior with first 'this', second 'this' passed as explicit parameter
			
			// This will count using the same mehtod as above, and once a second will update the timer.
			this.game.time.events.loop(1000, this.updateTimer, this, this);
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
		* Method to revive a single piece, which "drops" it from the top of the screen
		* Randomly selects a dead piece and calls revive() on it
		* 
		* Used as a callback in the mainGame's timeDropper object, which is an instance of Phaser.Timer
		*/
		reviveOne: function(context) {
			// Count how many dead pieces there are and save the max
			var max = context.pieces.countDead() - 1;

			// Take a random integer number no greater than the amount of all dead pieces
			var chosenOne = context.game.rnd.integerInRange(0, max);

			// Declare the iterator that will be checked against the chosenOne
			var i = 0;

			// Check if the dead piece per-loop is the chosen one and resurrect it
			context.pieces.forEachDead(function(piece){
				// Check if iterator matches the chosen random value
				if(i == chosenOne) {
					// Revive the piece that the iterator fell upon
					piece.revive();
				}
				// Iterate as the loop executes
				i++;
			}, context);
		}, // End reviveOne

		/**
		* Method that removes pieces from the tower and gives the player a score
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
			this.timer += multi;
		}, // End collapseTower

		/*
		* Update the timer and it's text
		*/
		updateTimer: function() {
			if (this.timer > 0) {
				this.timer--;
	
			}
			if (this.timer == 0) {
				// GAME OVER 
			}
		}, // End updateTimer

		/**
		* Update the stuff.
		*/
		update: function() {
			
			// Context of "this" changes within function scope of forEachAlive
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
					// Otherwise just remove the piece for now
					else {
						piece.kill();
					}
				}
			});



			// The cursor handler.
			if (this.cursors.left.isDown) {
				//  Move to the left
				this.platforms.forEachAlive(function(player) {
					// Make sure platform's positions are greater than the left bound
					if (player.body.x >= 0 + player.width/2) {
						player.body.moveLeft(200);
					} else {
						// Stand still
						player.body.velocity.x = 0;
					}
				});
				/*
				this.pieces.forEachAlive(function(piece) {
					if (piece.stacked) {
						piece.body.moveLeft(200);
					}
				});
				*/
			}
			else if (this.cursors.right.isDown) {
				//  Move to the right
				this.platforms.forEachAlive(function(player) {
					// Make sure platform's positions are less than the right bound
					if (player.body.x <= app.SCREEN_WIDTH - player.width) {
						player.body.moveRight(200);
					} else {
						// Stand still
						player.body.velocity.x = 0;
					}
				});
				/*
				this.pieces.forEachAlive(function(piece) {
					if (piece.stacked) {
						piece.body.moveRight(200);
					}
				});
				*/
			}
			else {
				// Stand still
				this.platforms.forEachAlive(function(player) {
					player.body.velocity.x = 0;
				});
			}

			this.scoreText.text = "Score: " + self.score;
			this.timerText.text = "Time: " + self.timer;

			// If the timer ran out, end the game
			if(this.timer <= 0) {
				this.game.state.start('GameOver', this.score);
			}

		},// End Update

		// The shutdown function that gets called when the mainGame state is exited
		shutdown: function(){
			// All pieces are destroyed
			this.pieces.destroy();

			// All platforms are destroyed
			this.platforms.destroy();

			// Remove the text from the screen
			this.scoreText.destroy();
			this.timerText.destroy();
		}
	} // End mainGame.prototype

	/**
	* Function that adds a piece object to the tower group in the event of a collision 
	* between an unstacked piece and a stacked piece. 
	* 'stacked' is a variable attached to the body of the piece
	*
	* @param {Phaser.Physics.Body} [bodyA] The body of the piece who called this collision event handler
	* @param {Phaser.Physics.Body} [bodyB] The body of the piece that bodyA collided with
	*/
	function testIfStacked(bodyA, bodyB) {
		// If bodyB IS of a stacked sprite AND bodyA is NOT of a stacked sprite, then make bodyA's sprite stacked
		if(bodyB.sprite.stacked == true && bodyA.sprite.stacked == false && Math.abs(bodyA.velocity.y) < 5) {
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