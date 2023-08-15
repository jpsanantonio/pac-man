import { useEffect, useState, useRef } from "react";

const SQUARE_SIZE = 40;

function drawCircle(x, y, context) {
  const radius = SQUARE_SIZE / 2;

  context.fillStyle = "#000000";
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function clearScreen(context) {
  const screenWidth = 800;
  const screenHeight = 600;

  context.clearRect(0, 0, screenWidth, screenHeight);
}

function useKeyboardShortcuts(setX, setY) {
  const handleKeydown = ({ code }) => {
    switch (code) {
      case "ArrowUp":
        setY((prev) => prev - SQUARE_SIZE);
        break;
      case "ArrowDown":
        setY((prev) => prev + SQUARE_SIZE);
        break;
      case "ArrowLeft":
        setX((prev) => prev - SQUARE_SIZE);
        break;
      case "ArrowRight":
        setX((prev) => prev + SQUARE_SIZE);
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
  const [x, setX] = useState(50);
  const [y, setY] = useState(100);
  const canvasRef = useRef(null);

  useKeyboardShortcuts(setX, setY);
  useMover(x, y, canvasRef);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="bg-orange-200"
        width="800"
        height="600"
      ></canvas>
    </>
  );
}

export default Pacman;
