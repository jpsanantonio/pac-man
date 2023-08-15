import { useEffect, useState, useRef } from "react";

// 0 is a blank space
// 1 is a wall
// 2 is a pellet
const grid = [
  [2, 2, 2, 2, 2, 2, 2, 1],
  [2, 1, 2, 1, 2, 2, 2, 1],
  [2, 2, 1, 2, 2, 2, 2, 1],
  [2, 2, 2, 2, 2, 2, 2, 1],
  [2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
];

const SQUARE_SIZE = 40;
const INITIAL_X = 1;
const INITIAL_Y = 2;
const SCREEN_WIDTH = grid[0].length;
const SCREEN_HEIGHT = grid.length;
const SCREEN_PIXEL_WIDTH = SCREEN_WIDTH * SQUARE_SIZE;
const SCREEN_PIXEL_HEIGHT = SCREEN_HEIGHT * SQUARE_SIZE;

function drawCircle(x, y, context, radiusDivisor) {
  const radius = SQUARE_SIZE / radiusDivisor;
  const pixelX = (x + 1 / 2) * SQUARE_SIZE;
  const pixelY = (y + 1 / 2) * SQUARE_SIZE;

  context.fillStyle = "#000000";
  context.beginPath();
  context.arc(pixelX, pixelY, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawPacman(x, y, context) {
  const radiusDivisor = 2;
  drawCircle(x, y, context, radiusDivisor);
}

function drawPellet(x, y, context) {
  const radiusDivisor = 6;
  drawCircle(x, y, context, radiusDivisor);
}

function drawWall(x, y, context) {
  context.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
}

function drawGrid(context) {
  context.fillStyle = "#000000";

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 1) {
        drawWall(columnIndex, rowIndex, context);
      }

      if (cell === 2) {
        drawPellet(columnIndex, rowIndex, context);
      }
    });
  });
}

function processAnyPellets(x, y) {
  if (grid[y][x] === 2) {
    grid[y][x] = 0;
  }
}

function clearScreen(context) {
  context.clearRect(0, 0, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);
}

function collidedWithBorder(x, y) {
  const isOutOfBounds =
    x < 0 || y < 0 || x >= SCREEN_WIDTH || y >= SCREEN_HEIGHT;

  return isOutOfBounds;
}

function collidedWithWall(x, y) {
  return grid[y][x] === 1;
}

function useKeyboardShortcuts(x, y, setX, setY, canvasRef) {
  const handleKeydown = ({ code }) => {
    switch (code) {
      case "ArrowUp":
        setY((prev) => {
          const current = prev - 1;
          if (collidedWithBorder(x, current) || collidedWithWall(x, current)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowDown":
        setY((prev) => {
          const current = prev + 1;
          if (collidedWithBorder(x, current) || collidedWithWall(x, current)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowLeft":
        setX((prev) => {
          const current = prev - 1;
          if (collidedWithBorder(current, y) || collidedWithWall(current, y)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowRight":
        setX((prev) => {
          const current = prev + 1;
          if (collidedWithBorder(current, y) || collidedWithWall(current, y)) {
            return prev;
          }
          return current;
        });
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    clearScreen(context);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
}

function useMover(x, y, canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    drawGrid(context);
    drawPacman(x, y, context);
    processAnyPellets(x, y);
  }, [x, y, canvasRef]);
}

function Pacman() {
  const [x, setX] = useState(INITIAL_X);
  const [y, setY] = useState(INITIAL_Y);
  const canvasRef = useRef(null);

  useKeyboardShortcuts(x, y, setX, setY, canvasRef);
  useMover(x, y, canvasRef);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="bg-orange-200"
        width={SCREEN_PIXEL_WIDTH}
        height={SCREEN_PIXEL_HEIGHT}
      ></canvas>
    </>
  );
}

export default Pacman;
