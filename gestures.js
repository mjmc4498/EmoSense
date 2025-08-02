document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const context = canvas.getContext('2d');
  const statusOutput = document.getElementById('status-output');

  let model = null;
  let lastSpokenGesture = "";

  // Define gestures for letters A, B, C using Fingerpose
  const letterA = new fp.GestureDescription('A');
  letterA.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
  letterA.addDirection(fp.Finger.Thumb, fp.FingerDirection.HorizontalLeft, 0.9);
  letterA.addDirection(fp.Finger.Thumb, fp.FingerDirection.HorizontalRight, 0.9);
  for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    letterA.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
    letterA.addDirection(finger, fp.FingerDirection.VerticalDown, 0.9);
  }

  const letterB = new fp.GestureDescription('B');
  for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
    letterB.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    letterB.addDirection(finger, fp.FingerDirection.VerticalUp, 0.9);
  }
  letterB.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
  letterB.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.7);
  letterB.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 0.7);

  const letterC = new fp.GestureDescription('C');
  letterC.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 1.0);
  letterC.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 1.0);
  letterC.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 1.0);
  letterC.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 1.0);
  letterC.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
  for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky, fp.Finger.Thumb]) {
    letterC.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.9);
    letterC.addDirection(finger, fp.FingerDirection.HorizontalLeft, 0.9);
  }


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

  async function setupCamera() {
    try {
      updateStatus("Accediendo a la cámara...", true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = stream;
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(video);
        };
      });
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      updateStatus("Error: No se pudo acceder a la cámara. Asegúrate de dar permiso.", true);
    }
  }

  const gestureEstimator = new fp.GestureEstimator([letterA, letterB, letterC]);

  async function detectHands() {
    if (model) {
      const hands = await model.estimateHands(video, { flipHorizontal: true });
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (hands.length > 0) {
        const estimatedGestures = gestureEstimator.estimate(hands[0].landmarks, 8.5); // Confidence score 8.5

        if (estimatedGestures.gestures.length > 0) {
          const bestGesture = estimatedGestures.gestures.sort((a, b) => b.score - a.score)[0];
          const gestureName = bestGesture.name;

          if (gestureName !== lastSpokenGesture) {
            lastSpokenGesture = gestureName;
            const message = `Gesto detectado: ${gestureName}`;
            updateStatus(message, true);
          }
        } else {
            if(lastSpokenGesture !== '') {
                lastSpokenGesture = '';
                updateStatus("No se reconoce el gesto.", false);
            }
        }
      } else {
        if(lastSpokenGesture !== '') {
            lastSpokenGesture = '';
            updateStatus("No se detecta ninguna mano.", false);
        }
      }
    }
    requestAnimationFrame(detectHands);
  }

  async function main() {
    try {
      updateStatus("Cargando modelo de reconocimiento de manos...", true);
      model = await handpose.load();
      updateStatus("Modelo cargado.", true);

      await setupCamera();
      updateStatus("Cámara lista. Muestra una seña con la mano.", true);

      detectHands();

    } catch (err) {
      console.error("Error en la inicialización:", err);
      updateStatus("Error al inicializar la aplicación de gestos.", true);
    }
  }

  main();
});
