import { useLayoutEffect, useState, useRef } from "react";

// 0 is a blank space
// 1 is a wall
// 2 is a pellet
const GRID = [
  [2, 2, 2, 2, 2, 2, 2, 1],
  [2, 1, 2, 1, 2, 2, 2, 1],
  [2, 2, 1, 2, 2, 2, 2, 1],
  [2, 2, 2, 2, 2, 2, 2, 1],
  [2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
];

const DIRECTIONS = {
  up: {
    x: 0,
    y: -1,
  },
  down: {
    x: 0,
    y: 1,
  },
  left: {
    x: -1,
    y: 0,
  },
  right: {
    x: 1,
    y: 0,
  },
  stopped: {
    x: 0,
    y: 0,
  },
};

const SQUARE_SIZE = 40;
const INITIAL_X = 1;
const INITIAL_Y = 2;
const SCREEN_WIDTH = GRID[0].length;
const SCREEN_HEIGHT = GRID.length;
const SCREEN_PIXEL_WIDTH = SCREEN_WIDTH * SQUARE_SIZE;
const SCREEN_PIXEL_HEIGHT = SCREEN_HEIGHT * SQUARE_SIZE;

function levelComplete() {
  let hasPelletsLeft = false;

  GRID.forEach((row) => {
    row.forEach((cell) => {
      if (cell === 2) {
        hasPelletsLeft = true;
      }
    });
  });

  return !hasPelletsLeft;
}

function restartLevel(setX, setY) {
  setX(0);
  setY(0);

  GRID.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 0) {
        GRID[rowIndex][columnIndex] = 2;
      }
    });
  });
}

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

  GRID.forEach((row, rowIndex) => {
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

function processAnyPellets({
  x,
  y,
  setX,
  setY,
  level,
  setLevel,
  score,
  setScore,
}) {
  if (GRID[y][x] === 2) {
    GRID[y][x] = 0;
    setScore(score + 1);

    if (levelComplete()) {
      setLevel(level + 1);
      restartLevel(setX, setY);
    }
  }
}

function clearScreen(context) {
  context.clearRect(0, 0, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);
}

function nextCoordinate(coordinate, coordinateValue, direction = "stopped") {
  return coordinateValue + DIRECTIONS[direction][coordinate];
}

function useKeyboardShortcuts() {
  const [direction, setDirection] = useState("stopped");

  const handleKeydown = ({ code }) => {
    switch (code) {
      case "ArrowUp":
        setDirection("up");
        break;
      case "ArrowDown":
        setDirection("down");
        break;
      case "ArrowLeft":
        setDirection("left");
        break;
      case "ArrowRight":
        setDirection("right");
        break;
      default:
        setDirection("stopped");
    }
  };

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  return [direction, setDirection];
}

function useMover({
  direction,
  setDirection,
  canvasRef,
  level,
  setLevel,
  score,
  setScore,
}) {
  const [x, setX] = useState(INITIAL_X);
  const [y, setY] = useState(INITIAL_Y);
  const nextX = nextCoordinate("x", x, direction);
  const nextY = nextCoordinate("y", y, direction);

  if (
    direction !== "stopped" &&
    !pathBlockedInDirection(nextX, nextY, direction)
  ) {
    setX(nextX);
    setY(nextY);
    setDirection("stopped");
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    clearScreen(context);
    drawGrid(context);
    drawPacman(x, y, context);
    processAnyPellets({
      x,
      y,
      setX,
      setY,
      level,
      setLevel,
      score,
      setScore,
    });
  }, [
    x,
    y,
    canvasRef,
    direction,
    setDirection,
    level,
    setLevel,
    score,
    setScore,
  ]);
}

function pathBlockedInDirection(x, y) {
  const cellTypeInDirection = GRID?.[y]?.[x];

  return cellTypeInDirection === undefined || cellTypeInDirection === 1;
}

function Pacman() {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useKeyboardShortcuts();

  useMover({
    direction,
    setDirection,
    canvasRef,
    level,
    setLevel,
    score,
    setScore,
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        className="bg-orange-200"
        width={SCREEN_PIXEL_WIDTH}
        height={SCREEN_PIXEL_HEIGHT}
      ></canvas>
      <br />
      Score: {score} &nbsp; &nbsp; &nbsp; Level: {level}
    </>
  );
}

export default Pacman;
