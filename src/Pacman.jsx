import { useEffect, useState, useRef } from "react";

const grid = [
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 0, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
];

const SQUARE_SIZE = 40;
const INITIAL_X = 1;
const INITIAL_Y = 2;
const SCREEN_WIDTH = grid[0].length;
const SCREEN_HEIGHT = grid.length;
const SCREEN_PIXEL_WIDTH = SCREEN_WIDTH * SQUARE_SIZE;
const SCREEN_PIXEL_HEIGHT = SCREEN_HEIGHT * SQUARE_SIZE;

function drawCircle(x, y, context) {
  const radius = SQUARE_SIZE / 2;
  const pixelX = (x + 1 / 2) * SQUARE_SIZE;
  const pixelY = (y + 1 / 2) * SQUARE_SIZE;

  context.fillStyle = "#000000";
  context.beginPath();
  context.arc(pixelX, pixelY, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawWalls(context) {
  context.fillStyle = "#000000";

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 1) {
        context.fillRect(
          columnIndex * SQUARE_SIZE,
          rowIndex * SQUARE_SIZE,
          SQUARE_SIZE,
          SQUARE_SIZE,
        );
      }
    });
  });
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

    drawWalls(context);
    drawCircle(x, y, context);
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
