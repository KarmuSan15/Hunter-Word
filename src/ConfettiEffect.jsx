import React from "react";
import Confetti from "react-confetti"; // Importamos el componente de confeti
import { useWindowSize } from "react-use"; // Hook para obtener el tamaño de la ventana

const ConfettiEffect = ({ show, duration = 5000 }) => {
  const { width, height } = useWindowSize(); // Obtenemos el ancho y alto de la ventana

  if (!show) return null; // Si 'show' es falso, no renderizamos nada (sin confeti)

  return (
    <Confetti
      width={width} // Establecemos el ancho de la ventana para el confeti
      height={height} // Establecemos el alto de la ventana para el confeti
      numberOfPieces={500} // Número de piezas de confeti
      recycle={false} // No reciclamos el confeti (no lo reutilizamos después de caer)
      gravity={0.1} // Gravedad que afecta al confeti (más bajo para que caiga más despacio)
      tweenDuration={duration} // Duración del efecto de animación del confeti
      colors={["#FF5733", "#33FF57", "#3357FF", "#F0E130", "#9C27B0"]} // Colores del confeti
    />
  );
};

export default ConfettiEffect;
