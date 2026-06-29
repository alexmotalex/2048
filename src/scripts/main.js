'use strict';

const SWIPE_THRESHOLD = 30;

const Game = require('../modules/Game.class');
const game = new Game();
const startMessage = document.querySelector('.message-start');
const button = document.querySelector('.button');
const gameField = document.querySelector('.game-field');
const gameScore = document.querySelector('.game-score');
const winMessage = document.querySelector('.message-win');
const loseMessage = document.querySelector('.message-lose');

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener(
  'touchstart',
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true },
);

document.addEventListener(
  'touchend',
  (e) => {
    if (game.getStatus() !== 'playing') {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // ignore taps (too small movement)
    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      return;
    }

    // horizontal swipe is dominant
    if (absX > absY) {
      if (diffX > 0) {
        game.moveRight();
      } else {
        game.moveLeft();
      }
    } else {
      // vertical swipe is dominant
      if (diffY > 0) {
        game.moveDown();
      } else {
        game.moveUp();
      }
    }

    updateUi();
  },
  { passive: true },
);

button.addEventListener('click', () => {
  if (button.className === 'button restart') {
    game.restart();
  }

  game.start();
  updateUi();
  winMessage.classList.add('hidden');
  loseMessage.classList.add('hidden');
  startMessage.classList.add('hidden');
  button.textContent = 'Restart';
  button.className = 'button restart';
});

document.addEventListener('keydown', (e) => {
  if (game.getStatus() !== 'playing') {
    return;
  }

  switch (e.key) {
    case 'ArrowUp':
      game.moveUp();
      break;
    case 'ArrowRight':
      game.moveRight();
      break;
    case 'ArrowDown':
      game.moveDown();
      break;
    case 'ArrowLeft':
      game.moveLeft();
      break;
  }
  updateUi();
});

function updateUi() {
  const currentState = game.getState();
  const currentStatus = game.getStatus();
  const boardRows = gameField.querySelectorAll('.field-row');

  boardRows.forEach((row, rowIndex) => {
    const rowCells = row.querySelectorAll('.field-cell');

    rowCells.forEach((cell, colIndex) => {
      const cellValue = currentState[rowIndex][colIndex];
      const prevValue = parseInt(cell.dataset.value || '0');

      cell.className = 'field-cell';
      cell.innerHTML = cellValue || '';
      cell.dataset.value = cellValue || '0';

      if (cellValue > 0) {
        cell.classList.add(`field-cell--${cellValue}`);

        if (!prevValue && cellValue) {
          // new tile appeared
          cell.classList.add('field-cell--new');
        } else if (prevValue && cellValue === prevValue * 2) {
          // tile merged (doubled in value)
          cell.classList.add('field-cell--merged');
        }
      }
    });
  });

  gameScore.textContent = game.getScore();

  if (currentStatus === 'win') {
    winMessage.classList.remove('hidden');
  } else if (currentStatus === 'lose') {
    loseMessage.classList.remove('hidden');
  }
}
