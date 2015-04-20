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
		this.roundScore = 0;	// Number
		this.roundScoreText = null; // Instance of Phaser.Text
		this.highScoresCap = 3; // Maximum scores displayed
		this.highScores = [0,0,0]; // Initialize highScores with 3 zeroes
		this.highSchoreText = null; // Instance of Phaser.Text
	}


	// Order of call is Preload > init > create > update 

	// Here the prototype of the game state is defined, so that it matches the predefined methods of Phaser states
	gameOver.prototype = {

		init: function() {
			// The roundScore variable here is now equal to 
			// the roundScore variable in the app
			this.roundScore = app.roundScore;
			
			// If the highScores exist in local storage put them in the 
			// highScore variable in the array.
			if (localStorage.highScoreOne && localStorage.highScoreTwo && localStorage.highScoreThree) {
				this.highScores[0] = parseInt(localStorage.highScoreOne);
				this.highScores[1] = parseInt(localStorage.highScoreTwo);
				this.highScores[2] = parseInt(localStorage.highScoreThree);
			}
			// Call the function that updates the highScores and send it the current score
			this.updateHighScore(this.roundScore);
		},

		preload: function() {
			// Load in the background image
			this.game.load.image('background' , 'assets/background.png');
		}, // End preload

		// Game Over is just a menu like screen, so all that needs to be done is to create the visuals
		create: function() {

			// Define the background for the stage
			this.game.add.tileSprite(0, 0, app.SCREEN_WIDTH, app.SCREEN_HEIGHT, 'background');

			// Give value to each of the null variables defined above
			this.endText = this.game.add.text(170, 100, 'Game Over!', {font:'bold 36pt Roboto'});

			// Show the player their score
			this.roundScoreText = this.game.add.text(150, 200, 'Your score this time was: ', {font:'14pt Roboto'});

			// Here is where the local highscore will be displayed
			this.highScoreText = this.game.add.text(150, 240, 'High Score: ', {font:'14pt Roboto'});

			// Place the reset button on the screen with a small text object describing its purpose
			this.game.add.text(200, 450, 'Play Again?');
			this.resetButton = this.game.add.button(230, 400, 'button', app.startGame, this, 2, 1, 0);
		}, // End create

		update: function() {
			// Show the player their score
			this.roundScoreText.text = 'Your score this time was: ' + this.roundScore;
			// Here is where the local highscore will be displayed
			this.highScoreText.text = 'High Scores: \n';
			for (var i = 0; i < this.highScoresCap; i++){
				this.highScoreText.text += this.highScores[i] + '\n';
			}
		}, // End update

		updateHighScore: function(scoreA) {
			// Does highScores exist in this js file?
			if(this.highScores != null){
				// Check to see if the score is higher than the lowest score
				if (scoreA > this.highScores[this.highScoresCap -1]){
					// Add the new score onto the end
					this.highScores[this.highScores.length] = scoreA;
					// Sort the scores numerically
					this.highScores.sort(function(a, b){return b-a});
					// Make the one on the end nothing
					this.highScores[this.highScoresCap] = null;
				}
				// Save the Highscores in local storage as strings
				localStorage.highScoreOne = this.highScores[0];
				localStorage.highScoreTwo = this.highScores[1];
				localStorage.highScoreThree = this.highScores[2];
			}
		}// End updateHighScore
		
	}

	// Add functionality to the app global
	app.gameOver = gameOver;

	// Return the augmented app to the global scope
	return app;

}(app || {}));