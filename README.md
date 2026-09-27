# 🏹 Ecos del Alba — Videojuego 3D de Acción & Exploración

Un videojuego 3D interactivo en la web desarrollado con **Three.js**, renderizado WebGL de alto rendimiento, efectos de sonido sintetizados con **Web Audio API** y persistencia en la nube mediante **Vercel Serverless Functions** y **Vercel Postgres (Neon)**.

Basado en el diseño y arte conceptual de **Aurora Studios**: *Hoja de Referencia de Modelo 3D de Personaje Principal*.

---

## 🌟 Características Destacadas

### 1. Modelo 3D y Rigging (`character.js`)
* **Protagonista Femenina Ancestral:**
  * Anatomía atlética y textura de piel con iluminación estándar PBR.
  * Peinado con trenzas pegadas (*cornrows*), gema rúnica y **coleta alta trenzada articulada en 7 segmentos** con simulación de inercia y física de balanceo.
  * Coraza metálica con runas frontales cian emisivas (`#39e6f5`), reborde de cuello y placa dorsal.
  * Hombreras (*pauldrons*) multicapa, brazaletes rúnicos detallados y cinturón de cuero con hebilla metálica anular y cartucheras utilitarias.
  * Faldar con el emblema de escudo ancestral rúnico en el muslo izquierdo.
* **Arco de Luz (*Desglose de Arco de Luz*):**
  * Geometría recurva compuesta con empuñadura ergonómica de cuero y anillos luminosos.
  * Hojas de energía cian cristalina a lo largo del arco interior y exterior.
  * Cuerda de energía etérea que se tensa dinámicamente y retrocede al disparar con ráfagas de partículas.
* **Dron Compañero (*Desglose de Dron Compañero*):**
  * Núcleo esférico aerodinámico con anillo antigravedad inferior.
  * Ojo/sensor concéntrico frontal con apertura luminosa y núcleo pulsante.
  * 3 aletas estabilizadoras a 120° con propulsores luminosos.
  * Comportamiento autónomo: flota suavemente sobre el hombro, ilumina el entorno y dispara ráfagas de energía sincronizadas en combate.

### 2. Modo de Inspección de Modelo 3D (Tecla `V`)
Permite pausar y admirar el modelo con cámaras dedicadas fieles a la hoja de referencia:
* **Vista Frontal**
* **Vista de Perfil**
* **Vista Posterior**
* **Arco de Luz**
* **Dron Compañero**
* **Órbita 360°** (rotación libre con arrastre y zoom con rueda)

### 3. Base de Datos & Tabla de Clasificación (`/api/scores.js`)
* Conectado a **Vercel Postgres / Neon** mediante `@vercel/postgres`.
* Tabla de líderes (*Leaderboard*) en tiempo real accesible con la tecla **`T`** o el botón del HUD.
* Registro de récords al ganar la partida: nombre del jugador, cristales activados, tiempo y puntuación total.
* Modo fallback en memoria automático para pruebas locales si la base de datos aún no está configurada.

---

## 🎮 Controles

| Tecla / Acción | Función |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Mover a la protagonista |
| <kbd>Ratón</kbd> | Apuntar el Arco de Luz |
| <kbd>Clic Izquierdo</kbd> / <kbd>Espacio</kbd> | Disparar flecha de luz |
| <kbd>T</kbd> | Abrir Tabla de Récords (Base de Datos) |
| <kbd>V</kbd> | Alternar Modo Inspección 3D |
| <kbd>R</kbd> | Reiniciar partida |
| <kbd>ESC</kbd> | Cerrar modal / Salir de inspección |

---

## 🚀 Despliegue en Vercel con Base de Datos

### Paso 1: Conectar el Repositorio a Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona el repositorio `ecos-del-alba`.
4. Deja la configuración por defecto y haz clic en **Deploy**.

### Paso 2: Crear y Vincular Vercel Postgres
1. En el panel de tu proyecto en Vercel, entra en la pestaña **Storage**.
2. Haz clic en **"Create Database"** y selecciona **Postgres (Neon)**.
3. Elige un nombre (por ejemplo: `ecos-db`) y tu región más cercana.
4. Haz clic en **"Connect Project"** para vincular la base de datos a tu proyecto.
5. Vercel inyectará automáticamente las variables `POSTGRES_URL` en tu proyecto.
6. ¡Listo! Vercel creará automáticamente la tabla `scores` en el primer envío y guardará todas las puntuaciones de forma permanente.

---

## 💻 Ejecución Local

Para probarlo localmente en tu máquina:

```bash
# Con Python
python -m http.server 8000

# O con cualquier servidor web local
```

Abre `http://localhost:8000` en tu navegador.
