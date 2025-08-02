document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const context = canvas.getContext('2d');
  const statusOutput = document.getElementById('status-output');

  let model = null;
  let lastSpokenGesture = "";

  // Define gestures for all 26 letters of the ASL alphabet using Fingerpose

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
    'J': (()=>{ const d=new fp.GestureDescription('J');d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);return d })(), // J is dynamic, this is a static approximation
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
    'Z': (()=>{ const d=new fp.GestureDescription('Z');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.HorizontalLeft,1);for(let f of[fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(), // Z is dynamic, this is a static approximation
  };

  const words = {
    'I_love_you': (()=>{ const d=new fp.GestureDescription('Te quiero');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.9);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.HorizontalLeft,.9);for(let f of[fp.Finger.Middle,fp.Finger.Ring]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(),
    'Yes': (()=>{ const d=new fp.GestureDescription('Sí');d.addCurl(fp.Finger.Index,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Ring,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Ring,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Pinky,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Pinky,fp.FingerDirection.VerticalDown,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalDown,1);return d })(), // This is a fist, often used for 'Yes'
    'No': (()=>{ const d=new fp.GestureDescription('No');d.addCurl(fp.Finger.Index,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Index,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Middle,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Middle,fp.FingerDirection.VerticalUp,1);d.addCurl(fp.Finger.Thumb,fp.FingerCurl.FullCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.VerticalUp,.8);for(let f of[fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.FullCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,.9)}return d })(), // Index and middle finger together pointing up
    'Hello': (()=>{ const d=new fp.GestureDescription('Hola');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky,fp.Finger.Thumb]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.VerticalUp,1)}return d })(), // Open hand, approximation of a wave
    'Thank_you': (()=>{ const d=new fp.GestureDescription('Gracias');for(let f of[fp.Finger.Index,fp.Finger.Middle,fp.Finger.Ring,fp.Finger.Pinky]){d.addCurl(f,fp.FingerCurl.NoCurl,1);d.addDirection(f,fp.FingerDirection.DiagonalUpLeft,1)}d.addCurl(fp.Finger.Thumb,fp.FingerCurl.NoCurl,1);d.addDirection(fp.Finger.Thumb,fp.FingerDirection.DiagonalUpLeft,.8);return d })(), // Flat hand moving from chin
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

  const allGestures = [...Object.values(letters), ...Object.values(words)];
  const gestureEstimator = new fp.GestureEstimator(allGestures);

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
