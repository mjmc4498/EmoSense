/**
 * EmoSense - Real-time Emotion and Gesture Recognition
 *
 * This script integrates two main functionalities:
 * 1. Facial emotion recognition using face-api.js.
 * 2. Hand gesture recognition (ASL alphabet and common words) using TensorFlow.js, Handpose, and Fingerpose.
 * It loads all models, runs detections in a unified loop, and provides visual and auditory feedback.
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const context = canvas.getContext('2d');
  const emotionOutput = document.getElementById('emotion-output');
  const gestureOutput = document.getElementById('gesture-output');
  const eventLog = document.getElementById('event-log');
  const sensitivitySelect = document.getElementById('sensitivity');
  const instructionsPanel = document.getElementById('instructions');
  const closeButton = document.getElementById('close-instructions');

  // --- State Variables ---
  let lastSpokenEmotion = "";
  let lastSpokenGesture = "";
  let lastSpeechTime = 0;
  const speechCooldown = 3000; // 3 seconds

  // --- Event Listeners ---
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      instructionsPanel.style.display = 'none';
    });
  }

  // --- Data Definitions ---

  // Emotion translations
  const emotionTranslations = {
    neutral: 'neutral', happy: 'feliz', sad: 'triste', angry: 'enfadada',
    fearful: 'asustada', disgusted: 'asqueada', surprised: 'sorprendida'
  };

  // Gesture definitions for ASL alphabet
  const letters = {
    'A': (()=>{ const d=new fp.GestureDescription('A');d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.9);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.9);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpRight,.9);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'B': (()=>{ const d=new fp.GestureDescription('B');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,1)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.8);return d })(),
    'C': (()=>{ const d=new fp.GestureDescription('C');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.HalfCurl,1);d.addDirection(f,fp.FingerDirection.HorizontalLeft,.9);d.addDirection(f,fp.FingerDirection.DiagonalUpLeft,.9)}return d })(),
    'D': (()=>{ const d=new fp.GestureDescription('D');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.HalfCurl,.9);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.9);return d })(),
    'E': (()=>{ const d=new fp.GestureDescription('E');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.HalfCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.9);return d })(),
    'F': (()=>{ const d=new fp.GestureDescription('F');d.addCurl(fp.Finger.Index,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,.9);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,1)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'G': (()=>{ const d=new fp.GestureDescription('G');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.HorizontalLeft,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,.8);return d })(),
    'H': (()=>{ const d=new fp.GestureDescription('H');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.HorizontalLeft,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.HorizontalLeft,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,.8);return d })(),
    'I': (()=>{ const d=new fp.GestureDescription('I');d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'J': (()=>{ const d=new fp.GestureDescription('J');d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'K': (()=>{ const d=new fp.GestureDescription('K');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.DiagonalUpLeft,1);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.9);return d })(),
    'L': (()=>{ const d=new fp.GestureDescription('L');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'M': (()=>{ const d=new fp.GestureDescription('M');d.addCurl(fp.Finger.Thumb,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalDown,.8);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalDown,1)}d.addCurl(fp.Finger.Pinky,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalDown,.9);return d })(),
    'N': (()=>{ const d=new fp.GestureDescription('N');d.addCurl(fp.Finger.Thumb,fp.FingerCurl.HalfCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalDown,.8);for(let f of[fp.Finger.Index,fp.Finger.Middle]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalDown,1)}for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalDown,.9)}return d })(),
    'O': (()=>{ const d=new fp.GestureDescription('O');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.HalfCurl,1);d.addDirection(f,fp.FingerDirection.DiagonalUpLeft,.9);d.addDirection(f,fp.FingerDirection.HorizontalLeft,.9)}return d })(),
    'P': (()=>{ const d=new fp.GestureDescription('P');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.HorizontalLeft,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalDown,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,.8);return d })(),
    'Q': (()=>{ const d=new fp.GestureDescription('Q');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalDown,.8);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalDown,.9)}return d })(),
    'R': (()=>{ const d=new fp.GestureDescription('R');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.DiagonalUpLeft,.9);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'S': (()=>{ const d=new fp.GestureDescription('S');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'T': (()=>{ const d=new fp.GestureDescription('T');d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);d.addCurl(fp.Finger.Index,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'U': (()=>{ const d=new fp.GestureDescription('U');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'V': (()=>{ const d=new fp.GestureDescription('V');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'W': (()=>{ const d=new fp.GestureDescription('W');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Ring,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Ring,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,.9);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'X': (()=>{ const d=new fp.GestureDescription('X');d.addCurl(fp.Finger.Index,fp.FingerCurl.HalfCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(),
    'Y': (()=>{ const d=new fp.GestureDescription('Y');d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'Z': (()=>{ const d=new fp.GestureDescription('Z');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
  };

  // Gesture definitions for common words
  const words = {
    'I_love_you': (()=>{ const d=new fp.GestureDescription('Te quiero');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.9);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,.9);for(let f of[fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'Yes': (()=>{ const d=new fp.GestureDescription('Sí');d.addCurl(fp.Finger.Index,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Ring,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Ring,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalDown,1);return d })(),
    'No': (()=>{ const d=new fp.GestureDescription('No');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'Hello': (()=>{ const d=new fp.GestureDescription('Hola');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,1)}return d })(),
    'Thank_you': (()=>{ const d=new fp.GestureDescription('Gracias');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.DiagonalUpLeft,1)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.8);return d })(),
  };

  const allGestures = [...Object.values(letters), ...Object.values(words)];

  // --- Helper Functions ---

  /**
   * Uses the browser's Speech Synthesis API to speak text aloud.
   * Includes a cooldown to prevent spamming the user.
   * @param {string} text The text to be spoken.
   * @param {boolean} interrupt If true, cancels any ongoing speech.
   */
  function speak(text, interrupt = false) {
    const now = Date.now();
    if (now - lastSpeechTime < speechCooldown) {
      return; // Cooldown active, do not speak
    }
    lastSpeechTime = now;

    if (interrupt) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  }

  /**
   * Adds a new entry to the event log on the UI.
   * @param {string} message The message to log.
   */
  function logEvent(message) {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    const logEntry = document.createElement('li');
    logEntry.textContent = `[${timestamp}] ${message}`;
    eventLog.prepend(logEntry);
    if (eventLog.children.length > 20) {
      eventLog.removeChild(eventLog.lastChild);
    }
  }

  /**
   * Updates a status element on the UI, with options to speak and log the message.
   * Also triggers a visual feedback animation.
   * @param {HTMLElement} element The DOM element to update.
   * @param {string} message The message to display.
   * @param {boolean} shouldSpeak If true, the message will be spoken aloud.
   * @param {boolean} shouldLog If true, the message will be added to the event log.
   */
  function updateStatus(element, message, shouldSpeak = false, shouldLog = false) {
    element.textContent = message;

    // Trigger visual feedback animation
    element.classList.add('detected');
    setTimeout(() => {
      element.classList.remove('detected');
    }, 500); // Must match the animation duration in style.css

    if (shouldSpeak) speak(message, true);
    if (shouldLog) logEvent(message);
  }

  // --- Main Application Logic ---

  /**
   * The main function to initialize the application.
   * Loads all AI models and sets up the camera.
   */
  async function main() {
    console.log("EmoSense: Initializing main function.");
    updateStatus(emotionOutput, "Cargando modelos de IA...", true);

    // Load all models in parallel for efficiency
    console.log("EmoSense: Loading AI models...");
    const [faceApiModel, handposeModel] = await Promise.all([
      (async () => {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        console.log("EmoSense: Loading face-api models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("EmoSense: Face-api models loaded.");
        return true;
      })(),
      // (async () => {
      //   console.log("EmoSense: Loading handpose model...");
      //   const model = await handpose.load();
      //   console.log("EmoSense: Handpose model loaded.");
      //   return model;
      // })()
      Promise.resolve(null) // Resolve with null for handpose
    ]).catch(err => {
      console.error("Error loading models:", err);
      updateStatus(emotionOutput, "Error al cargar modelos de IA. Por favor, comprueba tu conexión a internet y recarga la página.", true);
      return [null, null];
    });

    if (!faceApiModel || !handposeModel) {
      console.error("One or more models failed to load. Halting execution.");
      updateStatus(emotionOutput, "Fallo en la carga de un modelo. La aplicación no puede continuar.", true);
      return;
    }

    // Initialize the gesture estimator with all defined gestures
    const gestureEstimator = new fp.GestureEstimator(allGestures);

    updateStatus(emotionOutput, "Modelos cargados. Iniciando cámara...", true);
    console.log("EmoSense: Setting up camera...");

    // Set up and start the webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        console.log("EmoSense: Camera ready. Starting detection loop.");
        updateStatus(emotionOutput, "Detección de emociones activa.", false);
        updateStatus(gestureOutput, "Detección de gestos activa.", false);
        detect(handposeModel, gestureEstimator); // Start the detection loop
      };
    } catch(err) {
        console.error("Error accessing camera:", err);
        updateStatus(emotionOutput, "Error: No se pudo acceder a la cámara. Conceda permiso.", true);
    }

    /**
     * The main detection loop, running on every animation frame.
     */
    async function detect(handposeModel, gestureEstimator) {
      console.log("EmoSense: Detection loop running.");
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Run only face detection
      const faceDetections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      // const [faceDetections, handDetections] = await Promise.all([
      //   faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions(),
      //   handposeModel.estimateHands(video, { flipHorizontal: true })
      // ]);

      // --- Process Emotion Detections ---
      if (faceDetections.length > 0) {
        const expressions = faceDetections[0].expressions;
        const sensitivity = parseFloat(sensitivitySelect.value);
        const [topEmotionName, confidence] = Object.entries(expressions).sort((a,b) => b[1] - a[1])[0];

        if(confidence > sensitivity) {
            const translatedEmotion = emotionTranslations[topEmotionName] || topEmotionName;
            if (translatedEmotion !== lastSpokenEmotion) {
              lastSpokenEmotion = translatedEmotion;
              const message = `Emoción: ${translatedEmotion}`;
              updateStatus(emotionOutput, message, true, true);
            }
        }
      } else {
        lastSpokenEmotion = ""; // Reset if no face is detected
      }

      // --- Process Gesture Detections (Temporarily Disabled) ---
      // if (handDetections && handDetections.length > 0) {
      //   // Estimate gestures with a confidence score threshold
      //   const estimatedGestures = gestureEstimator.estimate(handDetections[0].landmarks, 8.5);

      //   if (estimatedGestures.gestures.length > 0) {
      //     const bestGesture = estimatedGestures.gestures.sort((a, b) => b.score - a.score)[0];
      //     const gestureName = bestGesture.name;

      //     if (gestureName !== lastSpokenGesture) {
      //       lastSpokenGesture = gestureName;
      //       const message = `Gesto: ${gestureName}`;
      //       updateStatus(gestureOutput, message, true, true);
      //     }
      //   } else {
      //       lastSpokenGesture = ""; // Reset if no gesture is recognized
      //   }
      // } else {
      //   lastSpokenGesture = ""; // Reset if no hand is detected
      // }

      // Continue the loop
      requestAnimationFrame(detect);
    }
  }

  // Start the application
  main();
});
