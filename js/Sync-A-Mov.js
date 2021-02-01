"use strict";

function SyncAMov(boardDisplay) {
	this.TILE_SIZE = 64;
	this.WALL_SIZE = 2;
	this.PADDING = this.WALL_SIZE/2;
	this.WALL_COLOR = '#789';
	this.FLOOR_COLOR = '#FFF';
	this.FLOOR_COLOR_SELECTED = '#FF3';
	this.FLOOR_STROKE_COLOR = '#DDD';
	this.ARROW_COLOR = 'steelblue';
	this.ARROW_COLOR_OFF = 'lightblue';
	this.ARROW_SIZE = 2;
	this.boardDisplay = boardDisplay;
	this.board = [
		[ b(N|W, t), b(N|E, t), b(0),    b(N|W, t), b(N, t), b(N, t), b(N|E, t) ],
		[ b(W, t),   b(E, t),   b(0),    b(W, t),   b(0, t), b(0, t), b(E, t)   ],
		[ b(W, t),   b(E, t),   b(0),    b(W, t),   b(0, t), b(0, t), b(E, t)   ],
		[ b(W, t),   b(E, t),   b(0),    b(W, t),   b(0, t), b(S, t), b(S|E, t) ],
		[ b(W, t),   b(0, t),   b(N, t), b(0, t),   b(E, t), b(0),    b(0)      ],
		[ b(W, t),   b(0, t),   b(0, t), b(0, t),   b(0, t), b(N, t), b(N|E, t) ],
		[ b(S|W, t), b(S, t),   b(S, t), b(S, t),   b(S, t), b(S, t), b(E|S, t) ]
	];
	SyncAMov.initPlayer(this.board, 0, 0, 1, SyncAMov.E);
	SyncAMov.initPlayer(this.board, this.board.length - 1, this.board[this.board.length - 1].length - 1, 2, SyncAMov.W);
	SyncAMov.initSelected(this.board, 0, 0);
	SyncAMov.initGoal(this.board, Math.floor(this.board.length/2), Math.floor(this.board[Math.floor(this.board.length/2)].length/2));
}

SyncAMov.initPlayer = function(board, x, y, id, direction) {
	board[x][y].player = new SyncAMov.Player(id, direction);
};

SyncAMov.initSelected = function(board, x, y) {
	board[x][y].selected = true;
};

SyncAMov.initGoal = function(board, x, y) {
	board[x][y].goal = true;
};

SyncAMov.Keys = {
	SPACE: 32, ENTER: 13,
	LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40
};

SyncAMov.N = 1;
SyncAMov.E = 2;
SyncAMov.S = 4;
SyncAMov.W = 8;

let N = SyncAMov.N;
let E = SyncAMov.E;
let S = SyncAMov.S;
let W = SyncAMov.W;
let t = true;

function b(walls, inner) {
	return new SyncAMov.BoardTile(walls, inner);
}

SyncAMov.prototype.start = function() {
	console.log('[start]');
	this.refresh();
};

SyncAMov.prototype.refresh = function() {
	console.log('[refresh]');
	while (this.boardDisplay.firstChild) {
    	this.boardDisplay.removeChild(this.boardDisplay.firstChild);
	}
	for (let i = 0 ; i < this.board.length ; i++) {
		let line = this.board[i];
		for (let j = 0 ; j < line.length ; j++) {
			let tile = line[j];
			let radius = this.TILE_SIZE / 2;
			let center = { x: radius + j*this.TILE_SIZE, y: radius + i*this.TILE_SIZE };
			center.x += this.PADDING;
			center.y += this.PADDING;
			if (tile.inner) {
				let floor = { x: center.x - radius, y: center.y - radius};
				let color = tile.selected ? this.FLOOR_COLOR_SELECTED : this.FLOOR_COLOR;
				CREATOR.svg('rect', {width: this.TILE_SIZE, height: this.TILE_SIZE, x: floor.x, y: floor.y, stroke: this.FLOOR_STROKE_COLOR, 'stroke-width': 1, fill: color}, this.boardDisplay);
			}
			if (tile.walls & SyncAMov.N) {
				let wall = { x: center.x - radius, y: center.y - radius};
				CREATOR.svg('line', {x1: wall.x, y1: wall.y, x2: wall.x + this.TILE_SIZE, y2: wall.y, stroke: this.WALL_COLOR, 'stroke-width': this.WALL_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
			}
			if (tile.walls & SyncAMov.E) {
				let wall = { x: center.x + radius, y: center.y - radius};
				CREATOR.svg('line', {x1: wall.x, y1: wall.y, x2: wall.x, y2: wall.y + this.TILE_SIZE, stroke: this.WALL_COLOR, 'stroke-width': this.WALL_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
			}
			if (tile.walls & SyncAMov.S) {
				let wall = { x: center.x + radius, y: center.y + radius};
				CREATOR.svg('line', {x1: wall.x, y1: wall.y, x2: wall.x - this.TILE_SIZE, y2: wall.y, stroke: this.WALL_COLOR, 'stroke-width': this.WALL_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
			}
			if (tile.walls & SyncAMov.W) {
				let wall = { x: center.x - radius, y: center.y + radius};
				CREATOR.svg('line', {x1: wall.x, y1: wall.y, x2: wall.x, y2: wall.y - this.TILE_SIZE, stroke: this.WALL_COLOR, 'stroke-width': this.WALL_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
			}
			if (tile.goal) {
				CREATOR.svg('circle', {cx: center.x, cy: center.y, r: radius/1.5, fill: 'greenyellow', stroke: 'green', 'stroke-width': 1}, this.boardDisplay);
			}
			if (tile.player) {
				CREATOR.svg('circle', {cx: center.x, cy: center.y, r: radius/2, fill: '#EEE', stroke: 'black', 'stroke-width': 1}, this.boardDisplay);
				if (tile.goal) {
					// end
				} else {
					if (tile.player.direction) {
						this.drawArrow(center, tile, i, j);
					}
				}
			}
		}
	}
	this.boardDisplay.setAttribute('width', this.board[0].length*this.TILE_SIZE + this.WALL_SIZE*2);
	this.boardDisplay.setAttribute('height', this.board.length*this.TILE_SIZE + this.WALL_SIZE*2);
};

SyncAMov.prototype.drawArrow = function(center, tile, i, j) {
	let direction = tile.player.direction;
	let vertical = direction == SyncAMov.S ? 1 : direction == SyncAMov.N ? -1 : 0;
	let horizontal = direction == SyncAMov.E ? 1 : direction == SyncAMov.W ? -1 : 0;
	let nextFreeTileDto = this.findNextFreeTile(tile, i, j);
	let color = (nextFreeTileDto.tile && nextFreeTileDto.tile.player) || (tile.walls & direction) ? this.ARROW_COLOR_OFF : this.ARROW_COLOR;
	if (vertical != 0) {
		CREATOR.svg('line', {x1: center.x, y1: center.y, x2: center.x, y2: center.y + vertical*this.TILE_SIZE/2.25, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
		CREATOR.svg('line', {x1: center.x - this.TILE_SIZE/9, y1: center.y + vertical*this.TILE_SIZE/3, x2: center.x, y2: center.y + vertical*this.TILE_SIZE/2.25, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
		CREATOR.svg('line', {x1: center.x + this.TILE_SIZE/9, y1: center.y + vertical*this.TILE_SIZE/3, x2: center.x, y2: center.y + vertical*this.TILE_SIZE/2.25, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
	} else if (horizontal != 0) {
		CREATOR.svg('line', {x1: center.x, y1: center.y, x2: center.x + horizontal*this.TILE_SIZE/2.25, y2: center.y, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
		CREATOR.svg('line', {x1: center.x + horizontal*this.TILE_SIZE/3, y1: center.y - this.TILE_SIZE/9, x2: center.x + horizontal*this.TILE_SIZE/2.25, y2: center.y, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
		CREATOR.svg('line', {x1: center.x + horizontal*this.TILE_SIZE/3, y1: center.y + this.TILE_SIZE/9, x2: center.x + horizontal*this.TILE_SIZE/2.25, y2: center.y, stroke: color, 'stroke-width': this.ARROW_SIZE, 'stroke-linecap': 'round'}, this.boardDisplay);
	}
};

SyncAMov.BoardTile = function(walls, inner) {
	this.walls = walls;
	this.player = null;
	this.goal = false;
	this.inner = inner;
};

SyncAMov.Player = function(id, direction) {
	this.id = id;
	this.direction = direction;
};

SyncAMov.containsTileIndex = function(skips, tile) {
	for (let i = 0 ; i < skips.length ; i++) {
		let skip = skips[i];
		if (skip.i == tile.i && skip.j == tile.j) {
			return true;
		}
	}
	return false;
};

SyncAMov.prototype.shiftSelected = function() {
	for (let i = 0 ; i < this.board.length ; i++) {
		let line = this.board[i];
		for (let j = 0 ; j < line.length ; j++) {
			let tile = line[j];
			if (tile.selected) {
				tile.selected = false;
			} else if (tile.player != null) {
				tile.selected = true;
			}
		}
	}
	this.refresh();
};

SyncAMov.prototype.walk = function() {
	let canWalk = []
	let skips = [];
	for (let i = 0 ; i < this.board.length ; i++) {
		let line = this.board[i];
		for (let j = 0 ; j < line.length ; j++) {
			if (SyncAMov.containsTileIndex(skips, {i: i, j: j})) {
				continue; // already walked
			}
			let tile = line[j];
			if (tile.player != null) {
				if (tile.walls & tile.player.direction) {
					continue; // can't walk
				}
				let nextTileDto = this.findNextTile(tile.player.direction, i, j);
				let nextTile = nextTileDto.tile;
				if (nextTile.player != null) {
					continue; // can't walk to north
				}
				nextTile.player = tile.player;
				if (tile.selected) {
					tile.selected = false;
					nextTile.selected = true;
				}
				tile.player = null;
				skips.push({i: nextTileDto.i, j: nextTileDto.j});
			}
		}
	}
	this.refresh();
};

SyncAMov.prototype.findNextFreeTile = function (tile, i, j) {
	if (tile.walls & tile.player.direction) {
		return { tile: null, i: null, j: null }; // can't walk
	}
	return this.findNextTile(tile.player.direction, i, j);
};

SyncAMov.prototype.findNextTile = function (direction, i, j) {
	let nextI, nextJ;
	if (direction == SyncAMov.N) {
		nextI = i - 1;
		nextJ = j;
	} else 	if (direction == SyncAMov.E) {
		nextI = i;
		nextJ = j + 1;
	} else 	if (direction == SyncAMov.S) {
		nextI = i + 1;
		nextJ = j;
	} else 	if (direction == SyncAMov.W) {
		nextI = i;
		nextJ = j - 1;
	}
	let nextTile = this.board[nextI][nextJ];
	return { tile: nextTile, i: nextI, j: nextJ };
};

SyncAMov.prototype.findSelectedTile = function() {
	for (let i = 0 ; i < this.board.length ; i++) {
		let line = this.board[i];
		for (let j = 0 ; j < line.length ; j++) {
			let tile = line[j];
			if (tile.selected) {
				return tile;
			}
		}
	}
	this.refresh();
};

SyncAMov.prototype.aimLeft = function() {
	let tile = this.findSelectedTile();
	tile.player.direction = SyncAMov.W;
	this.refresh();
};

SyncAMov.prototype.aimUp = function() {
	let tile = this.findSelectedTile();
	tile.player.direction = SyncAMov.N;
	this.refresh();
};

SyncAMov.prototype.aimRight = function() {
	let tile = this.findSelectedTile();
	tile.player.direction = SyncAMov.E;
	this.refresh();
};

SyncAMov.prototype.aimDown = function() {
	let tile = this.findSelectedTile();
	tile.player.direction = SyncAMov.S;
	this.refresh();
};


SyncAMov.prototype.onKeyUp = function(keyCode) {
	if (keyCode == SyncAMov.Keys.SPACE) {
		this.shiftSelected();
	} else if (keyCode == SyncAMov.Keys.ENTER) {
		this.walk();
	} else if (keyCode == SyncAMov.Keys.LEFT) {
		this.aimLeft();
	} else if (keyCode == SyncAMov.Keys.UP) {
		this.aimUp();
	} else if (keyCode == SyncAMov.Keys.RIGHT) {
		this.aimRight();
	} else if (keyCode == SyncAMov.Keys.DOWN) {
		this.aimDown();
	}
};

let CREATOR;

(function() {

	function init(event) {
		CREATOR = io.github.crisstanza.Creator;
	}

	window.addEventListener('load', init);

})();
