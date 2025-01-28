import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const HunterWord = ({ onCorrectWord }) => {
  const [mode, setMode] = useState(null);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("Comienza a jugar");
  const [obstacles, setObstacles] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);  // Temporizador en segundos
  const [highestScore, setHighestScore] = useState(0); // Guardar la puntuación más alta
  const [isWordVisible, setIsWordVisible] = useState(true); // Para alternar la visibilidad de la palabra
  const [wordPosition, setWordPosition] = useState({ top: "50%", left: "50%" }); // Posición aleatoria de la palabra
  const [wordColor, setWordColor] = useState("#FF5733"); // Color inicial de la palabra
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const wordsList = ["gato", "perro", "casa", "árbol", "sol", "luna", "fuego", "nube", "mar", "río"];

  // Genera una palabra aleatoria
  const randomWord = () => wordsList[Math.floor(Math.random() * wordsList.length)];

  // Iniciar el juego
  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setObstacles(selectedMode === "dificil");
    setScore(0);
    setCurrentWord(randomWord());
    resetTranscript();
    setTimeLeft(30);  // Resetea el temporizador a 30 segundos al iniciar
  };

  // Comprobar si la palabra es correcta
  const checkWord = () => {
    if (transcript.trim().toLowerCase() === currentWord.toLowerCase()) {
      setScore(score + 1);
      setCurrentWord(randomWord());
      onCorrectWord(); // Llama a la función que cambia el fondo
      resetTranscript();
    } else {
      // Si la palabra es incorrecta, resetea la puntuación y activa el temblor
      setScore(0);
      setShake(true);
      setTimeout(() => setShake(false), 500); // El temblor dura 0.5 segundos
    }
  };

  // Regresar al menú con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMode(null);
        resetTranscript();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetTranscript]);

  // Temporizador que cuenta hacia atrás
  useEffect(() => {
    if (timeLeft > 0 && mode !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // 1 segundo de intervalo
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      alert("¡Se acabó el tiempo! Fin del juego.");
      
      // Guardar la puntuación más alta en el localStorage
      const savedHighestScore = localStorage.getItem('highestScore');
      if (savedHighestScore === null || score > savedHighestScore) {
        localStorage.setItem('highestScore', score);
        setHighestScore(score);  // Actualiza el estado del record
      } else {
        setHighestScore(savedHighestScore);  // Si no es la más alta, mantiene la anterior
      }

      // Refrescar la página para volver al menú
      window.location.reload();  // Esto recargará la página
    }
  }, [timeLeft, mode, score]);

  // Cargar la puntuación más alta desde el localStorage
  useEffect(() => {
    const savedHighestScore = localStorage.getItem('highestScore');
    if (savedHighestScore) {
      setHighestScore(parseInt(savedHighestScore, 10));
    }
  }, []);

  // Para hacer que el texto cambie de color de fondo a blanco intermitentemente en modo difícil
  useEffect(() => {
    if (mode === "dificil") {
      const intervalId = setInterval(() => {
        setIsWordVisible((prev) => !prev); // Alterna entre visible y no visible

        // Cambiar posición aleatoria de la palabra
        setWordPosition({
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        });

        // Cambiar color aleatorio entre diferentes colores
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#F0E130", "#FF5733", "#9C27B0"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setWordColor(randomColor);

      }, 80); // Cambia cada 80ms para hacerlo aún más rápido

      return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonte
    }
  }, [mode]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Tu navegador no soporta reconocimiento de voz.</span>;
  }

  return (
    <div className={`app-main ${shake ? "shake" : ""}`} style={{ position: "relative" }}>
      {mode === null ? (
        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl shadow-xl bg-white bg-opacity-20">
          <h2 className="text-2xl font-semibold">Selecciona un modo de juego</h2>
          <button className="btn btn-green" onClick={() => startGame("facil")}>
            Modo Fácil
          </button>
          <button className="btn btn-red" onClick={() => startGame("dificil")}>
            Modo Difícil
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg mb-4">Modo: {mode}</p>
          <p className="text-2xl mb-4">Puntuación: {score}</p>
          <p className="text-xl mb-4">Tiempo Restante: {timeLeft}s</p> {/* Mostrar el tiempo */}
          
          {/* Estilo para mover la palabra y alternar colores */}
          {mode === "dificil" ? (
            <h2
              className={`text-3xl font-bold ${obstacles ? "blur-md" : ""}`}
              style={{
                position: "absolute",
                top: wordPosition.top,
                left: wordPosition.left,
                color: wordColor,  // Color aleatorio que cambia
                transition: "top 0.2s, left 0.2s",  // Animación suave para mover la palabra
              }}
            >
              {isWordVisible ? currentWord : ""}
            </h2>
          ) : (
            // Modo fácil: la palabra no cambia de posición ni de color
            <h2 className="text-3xl font-bold">{currentWord}</h2>
          )}

          <div className="flex justify-center space-x-4 mt-4">
            <button
              className="btn btn-blue"
              onMouseDown={SpeechRecognition.startListening}
              onMouseUp={() => {
                SpeechRecognition.stopListening();
                checkWord();  // Automáticamente comprueba la palabra cuando se suelta el botón
              }}
            >
              Mantén presionado para hablar
            </button>
          </div>
          <p className="text-lg mt-4">Lo que dijiste: {transcript}</p>
          <p className="mt-4 text-sm">Presiona <strong>Escape</strong> para regresar al menú.</p>
        </div>
      )}

      {/* Mostrar el record */}
      {mode === null && highestScore > 0 && (
        <div className="text-center mt-4">
          <p className="text-xl font-semibold">¡Tu Record: {highestScore}!</p>
        </div>
      )}
    </div>
  );
};

export default HunterWord;
