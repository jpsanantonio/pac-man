import { useEffect, useRef } from "react";

function Pacman() {
  const canvasRef = useRef(null);

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
  }, []);

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
