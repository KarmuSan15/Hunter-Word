import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ConfettiEffect from "./ConfettiEffect"; // Importamos el confeti

const HunterWord = ({ onCorrectWord }) => {
  const [mode, setMode] = useState(null); // Estado para el modo de juego (facil, dificil, imposible)
  const [score, setScore] = useState(0); // Estado para la puntuación
  const [currentWord, setCurrentWord] = useState("Comienza a jugar"); // Palabra que se debe adivinar
  const [, setObstacles] = useState(false); // Estado para obstáculos (actualmente no se usa)
  const [shake, setShake] = useState(false); // Estado para indicar si debe temblar la palabra
  const [timeLeft, setTimeLeft] = useState(30); // Temporizador que cuenta el tiempo restante
  const [highestScores, setHighestScores] = useState([]); // Puntuaciones más altas guardadas
  const [isWordVisible, setIsWordVisible] = useState(true); // Estado para controlar la visibilidad de la palabra
  const [wordPosition, setWordPosition] = useState({ top: "50%", left: "50%" }); // Posición de la palabra en el modo difícil e imposible
  const [wordColor, setWordColor] = useState("#FF5733"); // Color de la palabra
  const [showConfetti, setShowConfetti] = useState(false); // Estado para controlar el confeti
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition(); // Reconocimiento de voz
  const gameAreaRef = useRef(null); // Referencia al área del juego

  const wordsList = ["gato", "perro", "casa", "árbol", "sol", "luna", "fuego", "nube", "mar", "río"]; // Lista de palabras posibles
  const randomWord = () => wordsList[Math.floor(Math.random() * wordsList.length)]; // Función para obtener una palabra aleatoria

  const startGame = (selectedMode) => {
    setMode(selectedMode); // Establecer el modo seleccionado
    setObstacles(selectedMode !== "facil"); // Configurar si hay obstáculos según el modo
    setScore(0); // Reiniciar la puntuación
    setCurrentWord(randomWord()); // Establecer una nueva palabra
    resetTranscript(); // Reiniciar la transcripción de voz
    setTimeLeft(30); // Establecer el tiempo restante
    setWordColor("#FF5733"); // Establecer color por defecto para la palabra
    setShowConfetti(false);  // Evitar que el confeti aparezca al reiniciar el juego
  };

  const checkWord = () => {
    if (transcript.trim().toLowerCase() === currentWord.toLowerCase()) {
      // Si la palabra pronunciada coincide con la palabra actual
      setScore(score + 1); // Aumentar la puntuación
      setCurrentWord(randomWord()); // Establecer una nueva palabra
      onCorrectWord(); // Llamar a la función de puntuación correcta
      resetTranscript(); // Reiniciar la transcripción
    } else {
      // Si la palabra pronunciada no coincide
      setScore(0); // Reiniciar la puntuación
      setShake(true); // Activar el efecto de temblor
      setWordColor("#FF5733"); // Establecer color de la palabra a rojo

      document.body.classList.add("screen-shake", "error-background"); // Añadir efectos visuales
      setTimeout(() => {
        setShake(false); // Desactivar el temblor después de 800ms
        document.body.classList.remove("screen-shake", "error-background"); // Eliminar los efectos visuales
      }, 800);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && mode) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000); // Decrementar el tiempo cada segundo
      return () => clearInterval(timer); // Limpiar el temporizador cuando el componente se desmonte
    } else if (timeLeft === 0) {
      setShowConfetti(true); // Mostrar el confeti cuando se acaba el tiempo
      alert("¡Se acabó el tiempo! Fin del juego."); // Alerta cuando el tiempo se agota
      saveScore(score); // Guardar la puntuación final

      setTimeout(() => {
        setShowConfetti(false); // Desactivar el confeti después de 5 segundos
        window.location.reload(); // Recargar la página para reiniciar el juego
      }, 5000);
    }
  }, [timeLeft, mode, score]); // Efecto cuando el tiempo, modo o puntuación cambian

  const saveScore = (newScore) => {
    let savedScores = JSON.parse(localStorage.getItem("highestScores")) || []; // Obtener puntuaciones guardadas
    if (!savedScores.includes(newScore)) savedScores.push(newScore); // Agregar nueva puntuación si no está ya guardada
    savedScores.sort((a, b) => b - a); // Ordenar las puntuaciones de mayor a menor
    savedScores = savedScores.slice(0, 5); // Mantener solo las 5 mejores puntuaciones
    localStorage.setItem("highestScores", JSON.stringify(savedScores)); // Guardar las puntuaciones en localStorage
    setHighestScores(savedScores); // Actualizar el estado con las puntuaciones más altas
  };

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem("highestScores")) || []; // Cargar las puntuaciones guardadas
    setHighestScores(savedScores); // Actualizar el estado con las puntuaciones más altas
  }, []); // Solo ejecutarse una vez al montar el componente

  useEffect(() => {
    if (mode === "dificil" || mode === "imposible") {
      const intervalId = setInterval(() => {
        setIsWordVisible((prev) => !prev); // Alternar la visibilidad de la palabra

        if (mode === "imposible") {
          setWordPosition({
            top: `${Math.random() * 100}%`, // Posición aleatoria para el modo imposible
            left: `${Math.random() * 100}%`,
          });
        } else if (mode === "dificil") {
          setWordPosition({
            top: `${Math.random() * 50 + 25}%`, // Posición aleatoria para el modo difícil
            left: `${Math.random() * 50 + 25}%`,
          });
        }

        setWordColor(["#FF5733", "#33FF57", "#3357FF", "#F0E130", "#9C27B0"][Math.floor(Math.random() * 5)]); // Cambiar el color de la palabra aleatoriamente
      }, mode === "imposible" ? 50 : 100); // Intervalo más rápido para el modo imposible

      return () => clearInterval(intervalId); // Limpiar el intervalo al cambiar el modo
    }
  }, [mode]); // Efecto que se activa cuando cambia el modo

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMode(null); // Reiniciar el juego al presionar Escape
        resetTranscript(); // Reiniciar la transcripción
      }
    };

    window.addEventListener("keydown", handleKeyDown); // Escuchar la tecla Escape
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Limpiar el evento al desmontar el componente
    };
  }, [resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Tu navegador no soporta reconocimiento de voz.</span>; // Mostrar un mensaje si el navegador no soporta reconocimiento de voz
  }

  return (
    <div className="app-main" style={{ position: "relative", height: "100vh", width: "100%" }}>
      {showConfetti && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <ConfettiEffect show={showConfetti} /> {/* Mostrar el componente de confeti */}
        </div>
      )}

      <div ref={gameAreaRef} className="game-area" style={{ position: "relative", width: "100%", height: "100%" }}>
        {mode === null ? (
          <div className="flex flex-col items-center space-y-4 p-6 rounded-xl shadow-xl bg-white bg-opacity-20">
            <h2 className="text-2xl font-semibold">Selecciona un modo de juego</h2>
            <button className="btn btn-green" onClick={() => startGame("facil")}>Modo Fácil</button>
            <button className="btn btn-red" onClick={() => startGame("dificil")}>Modo Difícil</button>
            <button className="btn btn-black" onClick={() => startGame("imposible")}>Modo Imposible</button>

            <div className="text-center mt-4">
              <h3 className="text-xl font-bold">🏆 Mejor récord: {highestScores[0] || 0} puntos</h3>
              <h4 className="text-lg font-bold mt-2">Ranking:</h4>
              {highestScores.length > 0 ? highestScores.map((score, i) => (
                <p key={i} className="text-lg">{i + 1}. {score} puntos</p>
              )) : <p className="text-lg">No hay puntajes aún.</p>}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">Modo: {mode}</p>
            <p className="text-2xl mb-4">Puntuación: {score}</p>
            <p className="text-xl mb-4">Tiempo Restante: {timeLeft}s</p>

            {mode === "facil" ? (
              <h2 className="text-3xl font-bold">{currentWord}</h2>
            ) : (
              <h2
                className={`text-3xl font-bold ${shake ? "shake" : ""}`}
                style={{
                  position: "absolute",
                  top: wordPosition.top,
                  left: wordPosition.left,
                  color: wordColor,
                }}
              >
                {isWordVisible ? currentWord : ""}
              </h2>
            )}

            <button
              className="btn btn-blue"
              onMouseDown={SpeechRecognition.startListening}
              onMouseUp={() => {
                SpeechRecognition.stopListening();
                checkWord();
              }}
            >
              Mantén presionado para hablar
            </button>
            <p className="text-lg mt-4">Lo que dijiste: {transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HunterWord;
