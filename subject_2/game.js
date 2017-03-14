/**
 * ---------------------------------------------------------------------------------
 * | Renderers
 * ---------------------------------------------------------------------------------
*/

function Renderer(game, options) {
  this.options = Object.assign({
    'chessSize': 40,
    'rowNum': 0,
    'colNum': 0
  }, options);
  //initialize
  this.game = game;
  this.chesses = game.chesses;
  this.stage = game.stage;
  this.setStageSize();
}

Renderer.prototype = {
  drawChessAll: function () {
    var j, row, chessType, i = 0, chesses = this.chesses, rowlen = this.options.rowNum, collen = this.options.colNum;
    for (; i < rowlen; i++) {
      row = chesses[i];
      for (j = 0; j < collen; j++) {
        this.drawChess(j, i, this.chesses[i][j]);
      }
    }
  },
  drawChess: function (col, row, type) { throw new Error('Not implemented!'); },
  setStageSize: function () {
    var chessSize = this.options.chessSize, width = this.options.colNum * chessSize, height = this.options.rowNum * chessSize;
    this.stage.style.width = width + 'px';
    this.stage.style.height = height + 'px';
  },
  renderAll: function () {
    // draw all chesses (if has chesses)
    this.drawChessAll();
  }
};

/**
 * Renderer Powered by Canvas
 */

function RendererCanvas() {
  Renderer.apply(this, arguments);
  // init canvas
  this._canvas = document.createElement('canvas');
  this._canvas.setAttribute('width', this.stage.style.width);
  this._canvas.setAttribute('height', this.stage.style.height);
  this._ctx = this._canvas.getContext('2d');
  this.stage.appendChild(this._canvas);
  
}
inherit(RendererCanvas, Renderer, {
  drawChess: function (col, row, type) {
    var chessSize = this.options.chessSize, ctx = this._ctx, x = col * chessSize, y = row * chessSize;
    ctx.fillStyle = ['white', 'green', 'black'][type];
    ctx.fillRect(x, y, chessSize, chessSize);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.strokeRect(x, y, chessSize, chessSize);
  }
});

/**
 * Renderer Powered by DOM
 */

function RendererDOM() {
  Renderer.apply(this, arguments);
  this.stage.style.position = 'relative';
}
inherit(RendererDOM, Renderer, {
  drawChess: function (col, row, type) {
    var color = ['white', 'green', 'black'][type],
      chess = document.getElementById('chess-' + row + '-' + col);
    if (chess) {
      chess.style.backgroundColor = color;
    } else {
      var chessSize = this.options.chessSize;
      chess = document.createElement('div');
      Object.assign(chess.style, {
        'position': 'absolute',
        'left': (col * chessSize) + 'px',
        'top': (row * chessSize) + 'px',
        'width': chessSize + 'px',
        'height': chessSize + 'px',
        'boxSizing': 'border-box',
        'border': '1px solid red',
        'backgroundColor': color
      });
      this.stage.appendChild(chess);
    }
  }
});

/**
 * ---------------------------------------------------------------------------------
 * | Game
 * ---------------------------------------------------------------------------------
*/

function Game(id, renderOptions) {
  this.options = Object.assign({
    'amount': 5, // is 5ed chess or 6?
    'chessSize': 40, //drawing size per chess-pieces
    'colNum': 10,
    'rowNum': 10
  }, renderOptions);
  
  // flags
  this.isGameOver = false;
  // game stage
  this.stage = document.getElementById(id);
  // initialize stage chess layout data
  this.chesses = this.createChesses(this.options.colNum, this.options.rowNum);
  // record current player
  this.currentPlayer = 1; // player1 first
  
  // listening key events
  var that = this;
  this.stage.addEventListener('click', function (e) {
    if (that.isGameOver) { return ; }
    var stage = that.stage, chessSize = that.options.chessSize,
      col = Math.ceil((e.clientX - stage.offsetLeft) / chessSize) - 1,
      row = Math.ceil((e.clientY - stage.offsetTop) / chessSize) - 1;
    // check if valid
    if (that.chesses[row][col] === 0) {
      var chessType = that.currentPlayer;
      // update chesses
      that.chesses[row][col] = chessType;
      // draw chess
      that.renderer.drawChess(col, row, chessType);
      // IF THIS PLAYER WIN?
      if (that.isPlayerWin(row, col, chessType)) {
        that.isGameOver = true;
        alert('PLAYER #' + that.currentPlayer + ' WIN!!!');
        return ;
      }
      // switch player
      that.currentPlayer = that.currentPlayer === 1 ? 2 : 1;
    }
  }, false);

  //initialize render engine
  if (isSupportCanvas()) {
  // if (false) {
    this.renderer = new RendererCanvas(this, this.options);
  } else {
    this.renderer = new RendererDOM(this, this.options);
  }
  this.renderer.renderAll(); // this method can be called multi times
}

// check if this step the chess putting down and this player win
// CAN BE OPTIMIZED
Game.prototype.isPlayerWin = function (currentRow, currentCol, chessType) {
  var
    grows, row, col,
    amount = this.options.amount, gap = amount - 1, coreAmount = amount - 1, 
    chesses = this.chesses, maxCol = this.options.colNum - 1, maxRow = this.options.rowNum - 1,
    isGrowReached = function () {
      var value = chesses[row][col];
      if (value === chessType) {
        if (++grows >= amount) { return true; }
      } else { // here indicated that the chess is not continuous
        grows = 0;
      }
      return false;
    };
  
  // NOTE: BELOW CODES ARE MORE COMPLEX(BUT BETTER PERFORMANCE), CAN BE COMBINED TO SAVE CODE-QUANTITY, BUT FEELS UNNECESSARY.
  // 1. horizontal line
  for (grows = 0, row = currentRow, (col = currentCol - gap) < 0 && (col = 0); col <= maxCol; col++) {
    if (isGrowReached()) { return true; }
  }
  // 2. vertical line
  for (grows = 0, (row = currentRow - gap) < 0 && (row = 0), col = currentCol; row <= maxRow; row++) {
    if (isGrowReached()) { return true; }
  }
  // 3. oblique up
  for (grows = 0, row = currentRow + gap, col = currentCol - gap; row >= 0 && col <= maxCol; row--, col++) {
    if (col < 0 || row > maxRow) { continue; } // ignore invalid items
    if (isGrowReached()) { return true; }
  }
  // 4. oblique down
  for (grows = 0, row = currentRow - gap, col = currentCol - gap; row <= maxRow && col <= maxCol; row++, col++) {
    if (col < 0 || row < 0) { continue; }
    if (isGrowReached()) { return true; }
  }

  return false;
};

Game.prototype.createChesses = function (width, height) {
  var chesses = [];
  for (var i = 0; i < height; i++) {
    if (!chesses[i]) { chesses[i] = []; }
    for (var j = 0; j < width; j++) {
      chesses[i][j] = 0;
    }
  }
  return chesses;
};

/**
 * ---------------------------------------------------------------------------------
 * | Tools
 * ---------------------------------------------------------------------------------
*/

function inherit(Child, Parent, properties) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  if (properties) { Object.assign(Child.prototype, properties); }
}

function isSupportCanvas() {
  return !!document.createElement('canvas').getContext;
}

// 写在最后: 由于时间有限，写得比较乱，目前是必须下完5子才会结束，暂未实现特殊情况预判（如: 01110的情况），还请海涵