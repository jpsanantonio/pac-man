import { useEffect, useRef } from "react";

function useCircleDrawer(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const x = 50;
    const y = 100;
    const radius = 20;

    context.fillStyle = "#000000";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  }, [canvasRef]);
}

function useKeyboardShortcut() {
  const handleKeydown = ({ code }) => {
    switch (code) {
      case "ArrowUp":
        console.log("up");
        break;
      case "ArrowDown":
        console.log("down");
        break;
      case "ArrowLeft":
        console.log("left");
        break;
      case "ArrowRight":
        console.log("right");
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

function Pacman() {
  const canvasRef = useRef(null);

  useKeyboardShortcut();
  useCircleDrawer(canvasRef);

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
