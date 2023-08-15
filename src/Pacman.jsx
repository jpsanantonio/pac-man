import { useRef } from "react";

function Pacman() {
  const canvasRef = useRef(null);

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
