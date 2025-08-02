# EmoSense - Detector de Emociones y Señas en Tiempo Real

EmoSense es una aplicación web innovadora diseñada como una herramienta de asistencia para personas con discapacidad visual y/o del habla. Utiliza inteligencia artificial directamente en el navegador para interpretar y verbalizar emociones faciales y gestos de la Lengua de Señas Americana (ASL) en tiempo real.

## ✨ Características Principales

- **Detección de Emociones:** Identifica 7 emociones faciales diferentes (feliz, triste, enfadada, etc.) y las anuncia por voz.
- **Reconocimiento de Gestos:** Interpreta las 26 letras del abecedario de la Lengua de Señas Americana (ASL) y varias palabras comunes como "Hola", "Gracias", "Sí", "No" y "Te quiero".
- **Salida por Voz (Text-to-Speech):** Comunica todas las detecciones en español, haciendo la aplicación accesible para personas con discapacidad visual.
- **Registro de Eventos:** Mantiene un historial de las últimas detecciones para un fácil seguimiento.
- **Interfaz Unificada:** Combina ambas funcionalidades en una sola pantalla para una experiencia de usuario fluida.
- **Sin Servidores y Gratuito:** Funciona completamente en el navegador del cliente, utilizando bibliotecas de IA de código abierto. No requiere instalación ni servidores.

## 🚀 Cómo Usar la Aplicación

1.  **Abrir la Aplicación:** Simplemente abre el archivo `index.html` en un navegador web moderno (como Chrome, Firefox, o Edge) o accede al enlace de GitHub Pages.
2.  **Permiso de Cámara:** La primera vez que la uses, el navegador te pedirá permiso para acceder a tu cámara. **Debes hacer clic en "Permitir"** para que la aplicación pueda funcionar.
3.  **Iniciar Detección:**
    *   **Para Emociones:** Simplemente muestra tu cara frente a la cámara. La aplicación detectará tu emoción principal y la mostrará en pantalla.
    *   **Para Gestos:** Muestra una mano haciendo una de las señas del abecedario ASL o una de las palabras soportadas. Coloca la mano a una distancia donde se vea claramente.
4.  **Ajustar Sensibilidad:** Puedes ajustar la sensibilidad de la detección de emociones usando el menú desplegable. "Alta" requiere una expresión muy clara, mientras que "Baja" es más permisiva.

## 🌐 Guía de Despliegue en GitHub Pages

Puedes alojar esta aplicación de forma gratuita en la web usando GitHub Pages. Solo sigue estos sencillos pasos:

1.  **Sube el Código a un Repositorio:** Asegúrate de que todo el código (`index.html`, `app.js`, `style.css`, `README.md`) esté en un repositorio de tu cuenta de GitHub.
2.  **Ve a la Configuración:** En la página de tu repositorio, haz clic en la pestaña **"Settings"** (Configuración).
3.  **Navega a "Pages":** En el menú de la izquierda, busca y haz clic en la sección **"Pages"** (Páginas).
4.  **Configura la Fuente:**
    *   En la sección "Build and deployment", bajo "Source", selecciona **"Deploy from a branch"**.
    *   Asegúrate de que la rama seleccionada sea la que contiene el código final (por ejemplo, `main` o `master`).
    *   En la carpeta, deja la opción por defecto `/(root)`.
5.  **Guarda los Cambios:** Haz clic en el botón **"Save"**.
6.  **¡Espera un Momento!** GitHub tardará uno o dos minutos en construir y desplegar tu sitio. Una vez que esté listo, aparecerá un recuadro verde en la parte superior de la sección "Pages" con el enlace a tu aplicación.

## 🔗 Enlace a la Aplicación en Vivo

Una vez desplegada, podrás acceder a tu aplicación desde el siguiente enlace. ¡No olvides reemplazar los placeholders!

`https://mjmc4498.github.io/EmoSense/`

---
*Creado con la ayuda de Jules, tu asistente de ingeniería de software.*
