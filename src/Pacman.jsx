import { useEffect, useState, useRef } from "react";

const SQUARE_SIZE = 40;
const INITIAL_X = 1;
const INITIAL_Y = 2;
const SCREEN_WIDTH = 20;
const SCREEN_HEIGHT = 15;
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

function clearScreen(context) {
  context.clearRect(0, 0, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);
}

function collidedWithBorder(x, y) {
  const isOutOfBounds =
    x < 0 || y < 0 || x >= SCREEN_WIDTH || y >= SCREEN_HEIGHT;

  return isOutOfBounds;
}

function useKeyboardShortcuts(x, y, setX, setY) {
  const handleKeydown = ({ code }) => {
    switch (code) {
      case "ArrowUp":
        setY((prev) => {
          const current = prev - 1;
          if (collidedWithBorder(x, current)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowDown":
        setY((prev) => {
          const current = prev + 1;
          if (collidedWithBorder(x, current)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowLeft":
        setX((prev) => {
          const current = prev - 1;
          if (collidedWithBorder(current, y)) {
            return prev;
          }
          return current;
        });
        break;
      case "ArrowRight":
        setX((prev) => {
          const current = prev + 1;
          if (collidedWithBorder(current, y)) {
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

    clearScreen(context);
    drawCircle(x, y, context);
  }, [x, y, canvasRef]);
}

function Pacman() {
  const [x, setX] = useState(INITIAL_X);
  const [y, setY] = useState(INITIAL_Y);
  const canvasRef = useRef(null);

  useKeyboardShortcuts(x, y, setX, setY);
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
