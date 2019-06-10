let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
	grid = new Array(8)
	for(let i = 0; i <= grid.length - 1; i++){
		grid[i] = new Array(8);
	}
	grid[3][4] = new Piece('black');
	grid[4][3] = new Piece('black');
	grid[3][3] = new Piece('white');
	grid[4][4] = new Piece('white');
	return grid;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
	if (this.isValidPos(pos)){
		return this.grid[pos[0]][pos[1]];
	}
	else {
		throw 'position not on board';
	}
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
	if(this.validMoves(color).length >= 1){
		return true;
	}
	return false;
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
	return ((this.getPiece(pos).color === color) ? true : false);
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
	if (this.grid[pos[0]][pos[1]] instanceof Piece){
		return true;
	}
	return false;
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
	if (!(this.hasMove('black')) && !(this.hasMove('white'))){
		return true;
	}
	return false;
};

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
	for(let i = 0; i <= pos.length - 1; i++){
		if(pos[i] > 7 || pos[i] < 0){
			return false;
		}
	}
	return true;
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns null if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns null if it hits an empty position.
 *
 * Returns null if no pieces of the opposite color are found.
 */
function _positionsToFlip (board, pos, color, dir, piecesToFlip) {
	var oppColor = ((color === 'black') ? 'white' : 'black');
	var pos_copy = [pos[0] + dir[0], pos[1] + dir[1]];
	while(board.isValidPos(pos_copy)){
		if(!(board.isOccupied(pos_copy))){
			piecesToFlip.push(null);
		}
		else if(board.isMine(pos_copy, oppColor)){
			piecesToFlip.push(pos_copy);
		}

		else if(board.isMine(pos_copy, color)){
			break;
		}
		pos_copy = [pos_copy[0] + dir[0], pos_copy[1] + dir[1]];
	}
	return piecesToFlip;
}

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
	board = this;
	var allPieceToFlip = [];
	if(board.isOccupied(pos) || !(board.isValidPos(pos))){
		throw 'position error';
	}
	else {
		board.grid[pos[0]][pos[1]] = new Piece(color);
		for(let i = 0; i <= Board.DIRS.length - 1; i++){
			let dir = _positionsToFlip(board, pos, color, Board.DIRS[i], []);
			allPieceToFlip = allPieceToFlip.concat(dir);
		}
		for(let k = 0; k <= allPieceToFlip.length - 1; k++){
			if(allPieceToFlip[k] == null){
				continue;
			}
			else {
				let piece = board.getPiece(allPieceToFlip[k]);
				piece.flip();
				board.grid[allPieceToFlip[k][0]][allPieceToFlip[k][1]] = piece;
			}
		}
	}
};

/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
	var board = this;
	var final = "";
	for(let i = 0; i <= board.grid.length - 1; i++){
		final = final + '\n'
		for(let k = 0; k <= board.grid[i].length - 1; k++){
			new_pos = [i, k];
			if (board.isOccupied(new_pos)){
				final = final + ' ' + board.getPiece(new_pos).toString();
			}
			else {
				final = final + ' ' + '#';
			}
		}
	}
	console.log(final);
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */

 function checkifvalid(board, pos, color){
 	var allPieceToFlip = [];
 	for(let i = 0; i <= Board.DIRS.length - 1; i++){
			let dir = _positionsToFlip(board, pos, color, Board.DIRS[i], []);
			allPieceToFlip = allPieceToFlip.concat(dir);
		}
	for(let k = 0; k <= allPieceToFlip.length - 1; k++){
		if(allPieceToFlip[k] !== null){
			return true;
		}
	}
	return false;
 }
Board.prototype.validMove = function (pos, color) {
	if (!(this.isOccupied(pos)) && (checkifvalid(this, pos, color))){
		return true;
	}
	return false;
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
	var validpos = [];
	let board = this;
	for(let i = 0; i <= board.grid.length - 1; i++){
		for(let k = 0; k <= board.grid[i].length - 1; k++){
			let pos = [i, k];
			if(board.validMove(pos, color)){
				validpos.push(pos);
			}
		}
	}
	return validpos;
};

module.exports = Board;
