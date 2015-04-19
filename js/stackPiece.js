/*
* This file adds a function constructor that creates a Piece object
*
* These objects are used directly in the Stack'n'Shake browser game
* Coding standards follow the javascript Module Pattern
*/

// Strict mode adheres to modern ECMAScript 5's spec
'use strict';

var app = (function(app){


	/**
	* Function constructor for a piece object
	* Invoked as: new app.Piece(game, type, x, y);
	*
	* @param {Phaser.Game} Game - The instance of the currently running Phaser game. Required
	* @param {String} Type - Which type should the piece be. Optional
	* @param {Number} X - The x coordinate to give to the piece object. Optional
	* @param {Number} Y - The y coordinate to give to the piece object. Optional
	* @returns {Object} Piece - The game piece created by the function
	*
	* Method: If 'type' is undefined, randomly choose an integer from 0 to 5 Type is determined by this value. 
	* Randomly choose a second integer from 0 to 3, which defines the orientation of the piece to be createdd, by
	* ninety-degree steps (orthogonal). Create a piece with the now defined properties, add a physics collider 
	* that should already exist, enable physics on the body, and place it at (x, y), or (0, 0) if undefined.
	* 
	* To aid in custom collision behavior in-game, the physics body of all pieces has a property called 'stacked',
	* which describes whether the piece is considered a part of the tower or not.
	*
	*/
	app.Piece = function(game, type, x, y) {
		// If the game parameter is undefined, throw an error. This cannot be left out!
		// Also throw error if the game parameter isn't an instance of Phaser.Game
		if(!game || !(game instanceof Phaser.Game)){
			// Game is the wrong parameter, throw an error
			throw new Error("\"game\" parameter is undefined. Must be instance of Phaser.Game()");
		}
		// If the type parameter is undefined, randomly choose a new type
		if(!type){
			type = game.rnd.integerInRange(0,5); // From zero to five
		}

		// Define the random orientation of the piece to be created
		var orientation = game.rnd.integerInRange(0,3);

		// Each piece is a sprite, and each sprite needs width and height set to correct values
		var width;
		var height;

		// Switch statement to describe the desired piece object
		// Both numbers from 0 - 5 and string types are compared
		// Width and height of sprite are what depends on the type
		// 'type' is also forced to be a string here, in case it is a number
		switch(type) {
			// Type 0 is a rectangle
			case 0:
				type = 'rectangle'; // Set to string in case it isn't already
			case 'rectangle':
				width = 80;
				height = 40;
			break; // End Rectangle

			// Type 1 is a square
			case 1:
				type = 'square';
			case 'square':
				width = 40;
				height = 40;
			break; // End Square

			// Type 2 is a "tee" shaped piece
			case 2:
				type = 'tee';
			case 'tee':
				width = 120;
				height = 80;
			break; // End Tee

			// Type 3 is a corner shape
			case 3:
				type = 'corner';
			case 'corner':
				width = 80;
				height = 80;
			break; // End Corner

			// Type 4 is a bucket shape
			case 4:
				type = 'bucket';
			case 'bucket':
				width = 120;
				height = 80;
			break; // End Bucket

			// Type 5 is a square
			case 5:
			//case 'square': <- Would already have been caught
				type = 'square';
				width = 40;
				height = 40;
			break; // End case 5 (square)

			// Default is another error, this time 'type' is of an incorrect value
			default:
				throw new TypeError("Type is the wrong value: " + type);
			break;
		}// End switch statement

		// At this point, 'type' should be ONLY a string, thanks to the case (number): statements
		// Make the piece object here, defining its properties as the code continues
		var piece = game.add.sprite(width, height, type);
		game.physics.p2.enable(piece, false); // False makes sure the collision body doesn't draw as well
		piece.body.clearShapes(); // Ensure no default collider boxes exist
		piece.body.loadPolygon('physicsData', type); // Load the custom polygons to collide with

		// Define (x, y) if not already
		if(!x)
			x = game.rnd.integerInRange(piece.width, app.SCREEN_WIDTH - piece.width);
		if(!y)
			y = 10; // A bit below the top edge of the screen

		// Set the body's coordinates
		piece.body.x = x;
		piece.body.y = y;

		// Custom boolean for collision behavior in-game
		// Default value is false, set to true when a part of an in-game tower
		piece.stacked = false;

		// Add a custom callback to the onKilled event, where in the case that a piece is reused
		// The piece will not be revived with incorrect properties (i.e. at the bottom of the screen)
		piece.events.onKilled.add(resetProperties, this);

		// Done! Return the new piece object
		return piece;
	}

	/**
	* Function to reset properties of the piece to resemble a 'new' piece.
	* Used as a callback in the event of a piece being killed 
	* 
	* Places the piece's body at the top of the screen and at a random X location
	* Sets the piece body's 'stacked' property to false, to ensure a new piece doesn't think its already on a tower
	*/
	function resetProperties(piece) {

		// Same as when a new piece is created, random integer between the left and right sides of the world
		piece.body.x = piece.game.rnd.integerInRange(piece.width, app.SCREEN_WIDTH - piece.width);
		piece.body.y = 10;
		// Make sure that the piece doesn't carry it's "momentum" from last time it fell
		piece.body.velocity = 0;

		// Make sure the revived piece doesn't consider itself stacked on a tower before it even fully revives
		piece.stacked = false;
	}// End resetProperties


	// Return the augmented module to the global scope
	return app;

}(app || {}));