const TOOLBAR_HEIGHT = 50;
const PASSPHRASE = 'iwin';
const APPLICATIONS = ['Oodle Titanium', 'Web Expoditioner', 'Waterlion', 'Sound Studio'];
const GOOD_MESSAGES = ['What\'s the magic word?', 'Good luck', 'i', 'w', 'i', 'n'];
const BAD_MESSAGES = ['Are you even trying?', 'Come-awn man', 'Doors OS 14.02 Exclusive'];

/* GLOBALS */
var canvas = document.getElementById('screen');
var game = new Game(canvas);
var phrase = '';

function masterLoop(currentTime) {
  game.loop(currentTime);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function Button(parentWindow, height, width, type) {
  this.x = parentWindow.x;
  this.y = parentWindow.y;
  this.height = height;
  this.width = width;
  this.type = type;

  this.performAction = function(window) {
    switch(type) {
      case 'close':
        game.desktop.openWindows.splice(game.desktop.openWindows.indexOf(window), 1);
        break;
      case 'open':
        game.desktop.openNewWindows(10);
        break;
      case 'task-manager':
        game.desktop.openWindows = [];
      default:
        break;
    }
  }
  this.render = function(elapsedTime, ctx) {
    switch(type) {
      case 'close':
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        break;
      case 'open':
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        break;
      case 'task-manager':
        break;
      default:
        break;
    }
  }
}

/* WINDOW */
function Window(x, y, height, width, message) {
  this.x = x;
  this.y = y;
  this.height = height;
  this.width = width;
  this.border = 3;
  this.menubar = {
    'height': 20
  };
  this.button = new Button(this, 10, 10, 'close');
  this.message = message;

  this.render = function(elapsedTime, ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - this.border, this.y - this.border, this.width + (this.border * 2), this.height + (this.border * 2));
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, this.width, this.menubar.height);

    if (this.message) {
      ctx.fillStyle = 'black';
    	ctx.font = "25px Impact";
    	ctx.fillText(this.message, this.x + 10, this.y + 100);
    }
    this.button.render(elapsedTime, ctx);
  }
}

/* TOOLBAR */
function Toolbar() {
  this.x = 0;
  this.y = canvas.height - TOOLBAR_HEIGHT;
  this.width = canvas.width;
  this.height = TOOLBAR_HEIGHT;
  this.startButton = new Button(this, 50, 50, 'open');

  this.render = function(elapsedTime, ctx) {
    ctx.fillStyle = 'green';
  	ctx.fillRect(this.x, this.y, this.width, canvas.height);
    this.startButton.render(elapsedTime, ctx);

    ctx.fillStyle = 'black';
    ctx.font = "25px Impact";
    ctx.fillText('Open windows: ' + game.desktop.openWindows.length, this.width - 300, this.y + 30);
  }
}

/* DESKTOP */
function Desktop(screen) {
  this.toolbar = new Toolbar();
  this.openWindows = [
    new Window(10, 20, 200, 400, 'Good luck'),
    new Window(100, 120, 200, 400, 'Be wary of a buggy OS'),
    new Window(510, 220, 450, 450, 'Turn off the computer')
  ];

  this.openNewWindows = function(numButtons) {
    var x, y, height, width;
    for (var i = 0; i < numButtons; i++) {
      x = Math.random() * 500;
      y = Math.random() * 500;
      height = getRandom(150, 200);
      width = getRandom(300, 500);
      message = GOOD_MESSAGES[Math.round(getRandom(0, GOOD_MESSAGES.length))];
      this.openWindows.push(new Window(x, y, height, width, message));
    }
  }

  this.reorderWindows = function(window) {
    this.openWindows.splice(this.openWindows.indexOf(window), 1);
    this.openWindows.push(window);
  }

  this.render = function(elapsedTime, ctx) {
    /* BACKGROUND */
    ctx.fillStyle = 'blue';
  	ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* TOOLBAR */
    this.toolbar.render(elapsedTime, ctx);

    /* WINDOWS */
    this.openWindows.forEach(function(window) {
      window.render(elapsedTime, ctx);
    });
  }
}

/* GAME */
function Game(screen) {
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  this.time = performance.now();
  this.paused = false;
  this.desktop = new Desktop(screen);
  this.gameState = 'start';

  this.pause = function(pause) {
    this.paused = pause;
  }

  this.loop = function(newTime) {
    var game = this;
    this.time = newTime - this.time;

    if(!this.paused) this.update(this.time);
    this.render(this.time, this.frontCtx);

    this.frontCtx.drawImage(this.backBuffer, 0, 0);
  }

  this.update = function(elapsedTime) {
    if (phrase == 'iwin') this.gameState = 'win';
    switch(this.gameState) {
      // use for start up
      case 'start':
        break;
      case 'playing':
        break;
      case 'win':
        console.log('win');
        break;
      case 'pause':
        break;
    }
  }

  this.render = function(elapsedTime, ctx) {
    this.desktop.render(elapsedTime, ctx);
  }
}

function getRandom(min, max) {
  return Math.random() * (max-min) + min;
}



window.onkeydown = function(event) {
  switch(event.key) {
    default:
      if (phrase.length >= 4) phrase = '';
      phrase += event.key;
      console.log(event.key);
  }
}

/* HANDLE MOUSE MOVEMENT */
function mouseClick(evt) {
  checkWindowClose(evt);
  checkStartOpen(evt);
}

function getCurrentWindow(x,y) {
  var currentWindow;
  var reordered = false;
  game.desktop.openWindows.forEach(function(window) {
    if (x > window.x && x < (window.x + window.width)) {
      if (y > window.y && y < (window.y + window.height)) {
        if(y < (window.y + window.menubar.height)) currentWindow = window;
        if(!reordered) {
          game.desktop.reorderWindows(window);
          reordered = true;
        }
      }
    }
  });
  return currentWindow;
}

function checkWindowClose(evt) {
  game.desktop.openWindows.forEach(function(window) {
    if (evt.layerX > window.button.x && evt.layerX < window.button.x + window.button.width) {
      if (evt.layerY > window.button.y && evt.layerY < window.button.y + window.button.height) {
        window.button.performAction(window);
      }
    }
  });
}

function checkStartOpen(evt) {
  var button = game.desktop.toolbar.startButton;
  if (evt.layerX > button.x && evt.layerX < button.x + button.width) {
    if (evt.layerY > button.y && evt.layerY < button.y + button.height) {
      button.performAction();
    }
  }
}

var mouseDown = false;
var clickOffsetX, clickOffsetY;
var currentWindow;
canvas.onmousedown = function(evt) {
  initalClickX = evt.layerX;
  initalClickY = evt.layerY;
  currentWindow = getCurrentWindow(evt.layerX, evt.layerY);
  if (currentWindow) {
    clickOffsetX = evt.layerX - currentWindow.x;
    clickOffsetY = evt.layerY - currentWindow.y;
  }
  mouseDown = true;
}
canvas.onmouseup = function(evt) {
  if(mouseDown) mouseClick(evt);

  mouseDown = false;
}
canvas.onmousemove = function(evt) {
  if (!mouseDown) return;

  if (currentWindow && game.desktop.openWindows.indexOf(currentWindow)) {
    currentWindow.x = evt.layerX - clickOffsetX;
    currentWindow.button.x = evt.layerX - clickOffsetX;
    if (evt.layerY + currentWindow.height > canvas.height - TOOLBAR_HEIGHT - currentWindow.border) {
      currentWindow.y = (canvas.height - TOOLBAR_HEIGHT - currentWindow.border) - currentWindow.height;
      currentWindow.button.y = (canvas.height - TOOLBAR_HEIGHT - currentWindow.border) - currentWindow.height;
    }
    else {
      currentWindow.y = evt.layerY - clickOffsetY;
      currentWindow.button.y = evt.layerY - clickOffsetY;
    }
  }
}
