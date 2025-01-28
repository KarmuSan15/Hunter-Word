import React, { useState, useEffect } from "react";
import HunterWord from "./HunterWord"; // Importa el componente del juego
import "./App.css";

const App = () => {
  const [backgroundColor, setBackgroundColor] = useState("#000000");

  // Genera un color aleatorio cuando el usuario acierta
  const randomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Función que cambia el color de fondo
  const changeBackground = () => {
    const newColor = randomColor();
    setBackgroundColor(newColor);
  };

  // Aplica el color de fondo globalmente al body
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.backgroundSize = "cover"; // Asegura que el fondo cubra toda la pantalla
  }, [backgroundColor]);

  return (
    <div className="app-container">
      <h1 className="app-header">Hunter Word</h1>
      <HunterWord onCorrectWord={changeBackground} />
      <footer className="app-footer">
        <p>© 2025 Hunter Word. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
