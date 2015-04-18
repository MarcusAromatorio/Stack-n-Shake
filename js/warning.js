/*
* This file adds a function constructor that creates a Warning object
*
* These objects are used directly in the Stack'n'Shake browser game
* Coding standards follow the javascript Module Pattern
*/

// Strict mode adheres to modern ECMAScript 5's spec
'use strict';

var app = (function(app){


	/**
	* Function constructor for a warning object
	* Invoked as: new app.Warning(game, x, y);
	*
	* @param {Phaser.Game} Game - The instance of the currently running Phaser game. Required
	* @param {Number} X - The x coordinate to give to the piece object. Optional
	* @param {Number} Y - The y coordinate to give to the piece object. Optional
	* @returns {Object} Warning - The game warning created by the function
	*
	* Method: Create a warning with a blank x and y and draw a triangle at the location.
	* Leave it at 0,0 and allow them to change people to change it at will. 
	*
	*/
	app.Warning = function(game, x, y) {
		// If the game parameter is undefined, throw an error. This cannot be left out!
		// Also throw error if the game parameter isn't an instance of Phaser.Game
		if(!game || !(game instanceof Phaser.Game)){
			// Game is the wrong parameter, throw an error
			throw new Error("\"game\" parameter is undefined. Must be instance of Phaser.Game()");
		}
		
		var warning = game.add.sprite(x, y);
		game.physics.p2.enable(warning, false); // False makes sure the collision body doesn't draw as well
		warning.body.clearShapes(); // Ensure no default collider boxes exist
		warning.body.x = x;
		warning.body.y = y;

		// Add a custom callback to the onKilled event, where in the case that a warning is reused
		// The warning will not be revived with incorrect properties (i.e. at the bottom of the screen)
		warning.events.onKilled.add(resetProperties, this);

		// Done! Return the new piece object
		return warning;
	}

	/**
	* Function to reset properties of the warning to resemble a 'new' warning.
	* Used as a callback in the event of a warning being killed 
	* 
	* Places the warning's body at the top of the screen and at a random X location
	* Sets the warning body's 'stacked' property to false, to ensure a new warning doesn't think its already on a tower
	*/
	function resetProperties(warning) {
		warning.body.x = 0;
		warning.body.y = 0;

	}// End resetProperties


	// Return the augmented module to the global scope
	return app;

}(app || {}));