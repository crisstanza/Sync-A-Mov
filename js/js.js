"use strict";

let game;

(function() {

	function init(event) {
		game = new SyncAMov(boardDisplay);
		game.start();
	}

	window.addEventListener('load', init);

})();

function onKeyUp(event) {
	game.onKeyUp(event.keyCode);
}
