/**
 * The initializer script sets up the game and all of its properties to start
 * 
 * Authored: April 1 2015
 * 
 * This script currently creates a single global variable called 'app'
 * 'app' is an instance of a Phaser game with added functionality.
 *
 * Phaser is a web-game API that allows for easy game development in HTML browsers
 * Documentation can be found here: https://phaser.io/docs
 * The variable is named such to keep the variable name 'game' reserved for internal functions and Phaser
 * 
 * Version 1.0
 * 
 * Strict mode is used in these files to adhere to ECMAScript 5 spec
 * 
 * Code is executed in an IFFE to ensure scope is controlled throughout
**/

'use strict';


// Immediately Invoking Function Expression
// Keeps the scope of declared variables under control
var app = (function(app){

	// The game object to be initialized
	var game;
	var mainMenu;
	
	// Constants
	var SCREEN_WIDTH = 600;
	var SCREEN_HEIGHT = 700;

	// Initialization function to call once the page completes loading
	function init(){

		// Phaser.game() takes numerous optional arg's
		// Those specified here describe: width, height, and renderer 
		// (WebGL, Canvas, or 'Auto', in which Phaser itself chooses the renderer)
		game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO);

		/**
		 * Main Menu game state
		 *
		 * In version 1.0 the Main Menu is just an instruction screen that links to the demo
		 * 
		 * Function object whose properties are initialized to null
		 * Prototype of the Main Menu will have default functions of Phaser.State
		 * Phaser automatically calls state.init, state.preload, and state.create
		 * These functions will be defined for the state to run 
		**/
		mainMenu = function(game){
			this.instructionText = null;	// Instance of Phaser.text
			this.controlsText = null;		// Instance of Phaser.text
			this.startButton = null;		// Instance of Phaser.button

			// Presumably more variables will be added later
		}

		// Prototype of mainMenu, defines Phaser default functions
		mainMenu.prototype = {
			// init, preload, and create functions
			init: function() {
				// No systems to start in version 1.0
			},

			preload: function() {
				// Load the images for the button
				this.game.load.spritesheet('button', 'assets/buttonSheet.png', 80, 40); // Sprite sheet for the button object
			},

			create: function() {
				
				// Set the background color to be easy on the eyes
				this.game.stage.backgroundColor = '#669999';
				
				// Add the title of the game to the top of the screen
				// Unnamed Phaser.text object
				this.game.add.text(200, 100, 'Stack \'n\' Shake!', {font:'bold 36pt Roboto'});

				// Create the instructions text object here
				this.controlsText = this.game.add.text(100, 200, 'Left and Right arrow keys to move the platform', {font:'16pt Roboto'});
				this.instructionText = this.game.add.text(85, 300,'Stack up a tower of blocks and topple it for points!', {font: '16pt Roboto'});

				// Add the button that starts the game
				// Game.add.button takes numerous optional arguments
				this.startButton = this.game.add.button(260, 400, 'button', startGame, this, 2, 1, 0);
			}
		};// End mainMenu.prototype
		
		
		// Add the main menu game state to the game itself
		game.state.add('MainMenu', mainMenu);
		game.state.add('MainGame', app.mainGame);
		game.state.add('GameOver', app.gameOver);
		game.state.start('MainMenu');
		// As of version 1.0, no additional steps take place in initialization
	} // End init

	// No arguments or return values
	// This function sets the game state of the game to the demo, which begins play
	// Doing this causes the removal of current game objects
	// This function is only called after the main menu 'start' button is let go from being pressed
	function startGame(){
		game.state.start('MainGame');
	}

	// Ensure that initialization takes place once the page loads
	// This event is only called once ALL scripts attached to the page have loaded completely
	window.onload = init;

	
	// Here is where the app's variables are added to
	// These augments will be made available to everything with scope over the app variable
	// Since app is global, everything has access to these variables.
	app.game = game;
	app.mainMenu = mainMenu;
	app.startGame = startGame;
	app.SCREEN_WIDTH = SCREEN_WIDTH;
	app.SCREEN_HEIGHT = SCREEN_HEIGHT;
	
	// Here is where the app is returned to the global scope with the augments in place
	return app;
	
// Invoking the IFFE with either a pre-existing app object or an empty object
// This is done due to the asynchronous nature of <script> tags and IFFE evaluation speed
}(app || {}));