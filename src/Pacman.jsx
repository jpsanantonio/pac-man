import { useLayoutEffect, useState, useRef } from "react";

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
const INITIAL_GAME_DATA = { level: 1, score: 0 };
const INITIAL_POSITION = { x: 1, y: 2 };
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

function restartLevel(setPosition) {
  setPosition({ x: 0, y: 0 });

  GRID.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 0) {
        GRID[rowIndex][columnIndex] = 2;
      }
    });
  });
}

function drawCircle(position, context, radiusDivisor) {
  const { x, y } = position;
  const radius = SQUARE_SIZE / radiusDivisor;
  const pixelX = (x + 1 / 2) * SQUARE_SIZE;
  const pixelY = (y + 1 / 2) * SQUARE_SIZE;

  context.fillStyle = "#000000";
  context.beginPath();
  context.arc(pixelX, pixelY, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawPacman(position, context) {
  const radiusDivisor = 2;
  drawCircle(position, context, radiusDivisor);
}

function drawPellet(x, y, context) {
  const radiusDivisor = 6;
  const position = { x, y };

  drawCircle(position, context, radiusDivisor);
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

function processAnyPellets({ position, setPosition, gameData, setGameData }) {
  const { x, y } = position;

  if (GRID[y][x] === 2) {
    GRID[y][x] = 0;
    setGameData({ ...gameData, score: gameData.score + 1 });

    if (levelComplete()) {
      setGameData({ ...gameData, level: gameData.level + 1 });
      restartLevel(setPosition);
    }
  }
}

function clearScreen(context) {
  context.clearRect(0, 0, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);
}

function nextCoordinate(position, direction = "stopped") {
  const x = position.x + DIRECTIONS[direction]["x"];
  const y = position.y + DIRECTIONS[direction]["y"];

  return { x, y };
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
  gameData,
  setGameData,
}) {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const nextPosition = nextCoordinate(position, direction);

  if (
    direction !== "stopped" &&
    !pathBlockedInDirection(nextPosition, direction)
  ) {
    setPosition({ x: nextPosition.x, y: nextPosition.y });
    setDirection("stopped");
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    clearScreen(context);
    drawGrid(context);
    drawPacman(position, context);
    processAnyPellets({
      position,
      setPosition,
      gameData,
      setGameData,
    });
  }, [position, canvasRef, direction, setDirection, gameData, setGameData]);
}

function pathBlockedInDirection({ x, y }) {
  const cellTypeInDirection = GRID?.[y]?.[x];

  return cellTypeInDirection === undefined || cellTypeInDirection === 1;
}

function Pacman() {
  const canvasRef = useRef(null);
  const [gameData, setGameData] = useState(INITIAL_GAME_DATA);
  const [direction, setDirection] = useKeyboardShortcuts();

  useMover({
    direction,
    setDirection,
    canvasRef,
    gameData,
    setGameData,
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
      Score: {gameData.score} &nbsp; &nbsp; &nbsp; Level: {gameData.level}
    </>
  );
}

export default Pacman;
