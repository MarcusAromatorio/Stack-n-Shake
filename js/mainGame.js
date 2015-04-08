'use strict';

var app = (function(app){	

	
	/**
	* Main game state
	*
	* Defines all needed variables for the main game to play
	*/
	var mainGame = function(game){
		// Variables
		this.cursors;
		this.platforms;
		this.scoreText;
		this.pieces;
		this.tower;
		this.timer; 
		this.score = 0;
	}
	
	/**
	* Prototype of the mainGame state
	* Contains phaser default functions
	*/
	mainGame.prototype = {
		
		/**
		* Function to preload necessary images
		* 
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
		* Set up the stage for the game.
		*/
		create: function() {
	
			this.cursors = this.game.input.keyboard.createCursorKeys();
			this.game.stage.backgroundColor = '#000';
			
			//  We're going to be using physics, so enable the P2 Physics system
			this.game.physics.startSystem(Phaser.Physics.P2JS);
			this.game.physics.p2.gravity.y = 100;
			this.game.physics.p2.restitution = 0.9;
			
			this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });
			
			//  Create all of the groups in the game
			this.platforms = this.game.add.group();	
			this.pieces = this.game.add.group();	
			this.tower = this.game.add.group();
	
			// Create the platform on which blocks will land.
			var playerPlatform = this.game.add.sprite(40, 80, 'rectangle');
			this.game.physics.p2.enable(playerPlatform, true);
			playerPlatform.body.loadPolygon('physicsData', 'rectangle');
			playerPlatform.body.x = app.SCREEN_WIDTH /2;
			playerPlatform.body.y = app.SCREEN_HEIGHT - (app.SCREEN_HEIGHT/5);
			playerPlatform.body.angle = 90;
			playerPlatform.body.kinematic = true;
	
			// Add the platform to the platform group. 
			// This is here in case we decide to add more platforms later.
			this.platforms.add(playerPlatform);
	
			// Create the test piece
			this.createPiece();
		}, // End create
	
		/**
		* Create a new Piece.
		*/
		createPiece: function() {
			
			var piece = new app.Piece(this.game);
			
			// Add the piece to the "pieces" group
			this.pieces.add(piece);
			
		}, // End createPiece
	
		/**
		* Add things to the tower.
		*/
		addToTower: function(piece) {
			this.tower.add(piece);			
		}, // End addToTower

		/**
		* Remove things from the tower.
		*/
		collapseTower: function(){
			var tempScore = 0;
			var multi = this.tower.countLiving();
			this.tower.forEachAlive(function(piece){
				piece.kill();
				piece.visible = false;
				tempScore += 50;
			});
			this.score += tempScore * multi;
		}, // End collapseTower
	
		/**
		* Calculate the points of the scored tower.
		* @param {Tower} - a tower object to be scored.
		* @returns {Number} - the point value that the tower was worth.
		*/
		scoreTower: function(Tower) {
	
		}, // End scoreTower
	
		/**
		* Update the stuff.
		*/
		update: function() {
			
			// Bug present if createPiece() called within the forEachAlive loop
			// Remedy by setting context variable "self" to outside scope
			var self = this;
			
			// Deal with all the pieces 
			this.pieces.forEachAlive(function(piece) {
	
				// Kill the Piece if it hits the Bottom
				if(piece.body.y >= (app.SCREEN_HEIGHT - piece.height)) {
					piece.kill();
					piece.visible = false;
					self.createPiece();
				}

				if(piece.body.velocity.y <= 3){
					self.addToTower(piece);
					self.createPiece();
				}
			});

			// Deal with all the pieces in tower
			this.tower.forEachAlive(function(piece){
				piece.body.velocity.y = 20;

				if(piece.body.y >= (app.SCREEN_HEIGHT - piece.height)) {
					self.collapseTower();
				}



			});	
			// The cursor handler.
			if (this.cursors.left.isDown) {
				//  Move to the left
				// console.log("left");
				this.platforms.forEachAlive(function(player) {
					player.body.moveLeft(200);
				});
				this.tower.forEachAlive(function(piece) {
					piece.body.moveLeft(200);
				});
			}
			else if (this.cursors.right.isDown) {
				//  Move to the right
				// console.log("right");
				this.platforms.forEachAlive(function(player) {
					player.body.moveRight(200);
				});
				this.tower.forEachAlive(function(piece) {
					piece.body.moveRight(200);
				});
			}
			else {
				// Stand still
				this.platforms.forEachAlive(function(player) {
					player.body.velocity.x = 0;
				});
				this.tower.forEachAlive(function(piece) {
					// piece.body.velocity.x = 0;
				});
			}

			this.scoreText.text = "Score: " + this.score;

		} // End Update
	} // End mainGame.prototype
	
	// Adding mainGame state to the module interface
	app.mainGame = mainGame;
	
	// Return the app with its augments here
	return app;
// Following the module pattern, IFFE invokes with either a predefined app or an empty object
}(app || {}))