# Marcatexto · Video LP

Landing page de Marcatexto (videos para redes sociales, Hermosillo, Sonora). Construida en
**Vue 3 + Vite**, sin backend propio — **Firebase** se usa únicamente como Hosting para
publicar el sitio estático. No hay formulario ni base de datos: los CTAs abren WhatsApp o
el calendario de citas directamente.

Convertida a partir del export estático (`MARCATEXTO - Video.zip`) del prototipo original.

## Stack

- Vue 3 (`<script setup>`) + Vite
- Vue Router 4 (una sola ruta + 404)
- Firebase Hosting (deploy del sitio estático — sin Firestore, sin Functions)
- GitHub Actions para deploy automático

## Estructura

```
src/
  views/HomeView.vue     Toda la landing (hero, marcas, formatos, testimonios, planes, FAQs)
  views/NotFoundView.vue 404
  lib/interactions.js    JS de interacción original (CTAs, marquee, carruseles, FAQ, reveal-on-scroll)
  router/index.js        Ruta única (/) + 404
  style.css               Hoja de estilos original del diseño
public/images/             Logos y fotos reales (extraídos del prototipo)
.github/workflows/         Deploy automático (producción + previews de PR)
```

### Nota sobre "Formatos de Video"

La sección **Formatos de Video** (Ventas / Educativos / IA / UGC / Aspiracional / Generales)
tiene 6 espacios por categoría para videos de ejemplo — en el prototipo original ninguno se
había subido todavía, así que hoy se muestran como placeholders oscuros ("Sube un video").
Para completarlos:

1. Agrega los clips/imagenes a `public/images/` (ej. `caso-1-1.mp4` o `.jpg`).
2. En `src/views/HomeView.vue`, busca el grupo `data-caso="1"` (Ventas), `data-caso="2"`
   (Educativos), etc., y reemplaza el `<div class="caso-slide-empty">...</div>` correspondiente
   por un `<img>` (o `<video>`) apuntando al archivo.

## 1. Desarrollo local

```bash
npm install
npm run dev
```

## 2. Crear el proyecto de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar
   proyecto** (el plan gratuito **Spark** alcanza para un sitio de este tamaño).
2. Copia el **Project ID** (Configuración del proyecto).
3. Edita `.firebaserc` y reemplaza `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` con ese ID.

## 3. Deploy manual (primera vez / puntual)

```bash
npm i -g firebase-tools   # una sola vez
firebase login
npm run build
firebase deploy
```

Tu sitio queda en `https://TU-PROYECTO.web.app`.

## 4. Git

```bash
git add .
git commit -m "Initial commit: Marcatexto Video LP en Vue 3 + Firebase"
git remote add origin <URL-de-tu-repo-en-GitHub>
git push -u origin main
```

## 5. Deploy automático (GitHub Actions)

Este repo ya trae dos workflows:

- `.github/workflows/deploy.yml` — al hacer push a `main`, compila y despliega a Hosting
  (canal `live`).
- `.github/workflows/deploy-preview.yml` — en cada Pull Request, despliega un canal de
  vista previa temporal (útil para revisar cambios antes de fusionar).

Para que funcionen, agrega estos **secrets** en GitHub (`Settings → Secrets and variables →
Actions → New repository secret`):

| Secret | De dónde sale |
|---|---|
| `FIREBASE_PROJECT_ID` | el mismo Project ID del paso 2 |
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo de una service account (ver abajo) |

Para generar `FIREBASE_SERVICE_ACCOUNT`:

1. En la consola de Firebase → ⚙️ *Configuración del proyecto* → **Cuentas de servicio**.
2. **Generar nueva clave privada** → descarga el JSON.
3. Copia todo el contenido del archivo JSON como valor del secret
   `FIREBASE_SERVICE_ACCOUNT` (pégalo tal cual, no hace falta codificarlo).

Con eso, cada push a `main` publica el sitio solo. No necesitas correr `firebase deploy`
a mano nunca más.
