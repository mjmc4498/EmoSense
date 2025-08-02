document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const context = canvas.getContext('2d');
  const statusOutput = document.getElementById('status-output');
  const sensitivitySelect = document.getElementById('sensitivity');
  const emotionLog = document.getElementById('emotion-log');

  let lastSpokenEmotion = "";
  let modelsLoaded = false;

  const emotionTranslations = {
    neutral: 'neutral',
    happy: 'feliz',
    sad: 'triste',
    angry: 'enfadada',
    fearful: 'asustada',
    disgusted: 'asqueada',
    surprised: 'sorprendida'
  };

  function speak(text, interrupt = false) {
    if (interrupt) {
      speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  }

  function updateStatus(message, shouldSpeak = false) {
    statusOutput.textContent = message;
    if (shouldSpeak) {
      speak(message, true);
    }
  }

  function logEmotion(message) {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    const logEntry = document.createElement('li');
    logEntry.textContent = `[${timestamp}] ${message}`;
    // Prepend to show the latest entry on top, and limit log size
    emotionLog.prepend(logEntry);
    if (emotionLog.children.length > 20) { // Keep last 20 entries
        emotionLog.removeChild(emotionLog.lastChild);
    }
  }

  async function setupCamera() {
    try {
      updateStatus("Accediendo a la cámara...", true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      updateStatus("Error: No se pudo acceder a la cámara. Asegúrate de dar permiso.", true);
    }
  }

  async function loadModels() {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    try {
      updateStatus("Cargando modelos de IA...", true);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      modelsLoaded = true;
      updateStatus("Modelos cargados.", true);
    } catch (err) {
      console.error("Error al cargar modelos:", err);
      updateStatus("Error: No se pudieron cargar los modelos de IA. Comprueba tu conexión a internet.", true);
    }
  }

  async function detectEmotions() {
    if (!modelsLoaded || video.paused || video.ended) {
      return;
    }

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (detections.length > 0) {
      // Dibuja el recuadro y las expresiones (opcional, bueno para depuración)
      // faceapi.draw.drawDetections(canvas, detections);
      // faceapi.draw.drawFaceExpressions(canvas, detections);

      const expressions = detections[0].expressions;
      const sensitivity = parseFloat(sensitivitySelect.value);

      const [topEmotionName, topEmotionValue] = Object.entries(expressions)
        .sort((a, b) => b[1] - a[1])[0];

      if (topEmotionValue >= sensitivity) {
        const translatedEmotion = emotionTranslations[topEmotionName] || topEmotionName;
        if (translatedEmotion !== lastSpokenEmotion) {
          lastSpokenEmotion = translatedEmotion;
          const message = `La persona parece estar ${translatedEmotion}`;
          updateStatus(message, true);
          logEmotion(message);
        }
      } else {
         if (lastSpokenEmotion !== 'indefinida') {
             lastSpokenEmotion = 'indefinida';
             updateStatus("Emoción no detectada con claridad.", false);
         }
      }

    } else {
        if (lastSpokenEmotion !== 'cara no detectada') {
            lastSpokenEmotion = 'cara no detectada';
            updateStatus("No se detecta ninguna cara.", false);
        }
    }

    requestAnimationFrame(detectEmotions);
  }

  video.addEventListener('play', () => {
    updateStatus("Cámara activa. Buscando caras...", true);
    requestAnimationFrame(detectEmotions);
  });

  async function start() {
    updateStatus("Iniciando EmoSense...", true);
    await loadModels();
    if (modelsLoaded) {
      await setupCamera();
    }
  }

  start();
});
