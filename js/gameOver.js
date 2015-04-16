/**
* The gameOver script adds a ame state to the phaser game it is designed for
*
* The script executes an IFFE which augments the global 'app' variable to have an app.gameOver object
* app.gameOver is treated as a Phaser.State, whose prototype contains predefined methods
*
*/

'user strict';

var app = (function(app){

	// Here is created the functon object that will be app.gameOver
	var gameOver = function(game, score){
		this.endText = null;	// Instance of Phaser.Text
		this.resetButton = null;// Instance of Phaser.Button
		this.roundScore = score;	// Instance of Phaser.Text
		this.highScore = null;	// Instance of Phaser.Text
	}

	// Here the prototype of the game state is defined, so that it matches the predefined methods of Phaser states
	gameOver.prototype = {

		// Game Over is just a menu like screen, so all that needs to be done is to create the visuals
		create: function() {

			// Reset the background so that previous drawing is cleared
			this.game.stage.backgroundColor = '#669999';

			// Give value to each of the null variables defined above
			this.endText = this.game.add.text(220, 100, 'Game Over!');

			// Show the player their score
			this.roundScore = this.game.add.text(150, 200, 'Your score this time was: ' + this.roundScore, {font:'bold 14pt Arial'});

			// Here is where the local highscore will be displayed
			this.highScore = this.game.add.text(150, 240, 'High Score: ', {font:'bold 14pt Arial'});

			// Place the reset button on the screen with a small text object describing its purpose
			this.game.add.text(200, 350, 'Play Again?');
			this.resetButton = this.game.add.button(230, 400, 'button', app.startGame, this, 2, 1, 0);
		}
	}

	// Add functionality to the app global
	app.gameOver = gameOver;

	// Return the augmented app to the global scope
	return app;

}(app || {}));