import { useImmerReducer } from "use-immer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
const INITIAL_GAME_DATA = {
  position: {
    x: 1,
    y: 2,
  },
  progress: {
    level: 1,
    score: 0,
  },
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 1],
    [2, 0, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
  ],
};
const SCREEN_WIDTH = INITIAL_GAME_DATA.grid[0].length;
const SCREEN_HEIGHT = INITIAL_GAME_DATA.grid.length;
const SCREEN_PIXEL_WIDTH = SCREEN_WIDTH * SQUARE_SIZE;
const SCREEN_PIXEL_HEIGHT = SCREEN_HEIGHT * SQUARE_SIZE;
const FRAMES_PER_MOVEMENT = 30;

function levelComplete(grid) {
  let hasPelletsLeft = false;

  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell === 2) {
        hasPelletsLeft = true;
      }
    });
  });

  return !hasPelletsLeft;
}

function restartLevel({ x, y }, grid) {
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 0) {
        grid[rowIndex][columnIndex] = 2;
      }

      if (x === columnIndex && y === rowIndex) {
        grid[rowIndex][columnIndex] = 0;
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

function drawGrid(grid, context) {
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

function processPellets({ position, progress, grid }) {
  const { x, y } = position;

  if (grid[y][x] === 2) {
    grid[y][x] = 0;
    progress.score++;

    if (levelComplete(grid)) {
      progress.level++;
      restartLevel(position, grid);
    }
  }

  return { position, progress, grid };
}

function clearScreen(context) {
  context.clearRect(0, 0, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);
}

function nextCoordinate(position, direction = "stopped") {
  const x = position.x + DIRECTIONS[direction]["x"];
  const y = position.y + DIRECTIONS[direction]["y"];

  return { x, y };
}

function useKeyboardShortcuts(setType) {
  const handleKeydown = ({ code }) => {
    const direction = code.replace(/^Arrow(.*)$/, "$1").toLowerCase();

    if (["up", "down", "left", "right"].includes(direction)) {
      setType(direction);
    }
  };

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
}

function pathBlockedInDirection({ x, y }, grid) {
  const cellTypeInDirection = grid?.[y]?.[x];

  return cellTypeInDirection === undefined || cellTypeInDirection === 1;
}

function gameDataReducer(gameData, action) {
  const position = nextCoordinate(gameData.position, action.type);

  switch (action.type) {
    case "up":
    case "down":
      if (pathBlockedInDirection(position, gameData.grid)) {
        position.y = gameData.position.y;
      }

      break;
    case "left":
    case "right":
      if (pathBlockedInDirection(position, gameData.grid)) {
        position.x = gameData.position.x;
      }

      break;
    default:
      throw Error(`Unsupported type: ${action.type}`);
  }
  gameData.position = position;

  const { progress, grid } = processPellets(gameData);

  gameData.progress = progress;
  gameData.grid = grid;
}

function Pacman() {
  console.log("rendering");
  const [type, setType] = useState("stopped");
  const canvasRef = useRef(null);
  const [gameData, dispatch] = useImmerReducer(
    gameDataReducer,
    INITIAL_GAME_DATA,
  );
  const { position, progress, grid } = gameData;

  useKeyboardShortcuts(setType);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    clearScreen(context);
    drawGrid(grid, context);
    drawPacman(position, context);
  }, [grid, position]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (type !== "stopped") {
        dispatch({ type });
      }
    }, 1000 / 6);

    return () => clearTimeout(timeoutId);
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
      Score: {progress.score} &nbsp; &nbsp; &nbsp; Level: {progress.level}
    </>
  );
}

export default Pacman;
