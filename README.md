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

Los 25 videos reales viven en `public/videos/caso-N/`, comprimidos a 720p (desde los
originales en `~/Desktop/PÁGINA WEB`, 1.7GB → 97MB). Mapeo carpeta → categoría del sitio:

| Carpeta original | Categoría (tab) | data-caso | # videos |
|---|---|---|---|
| `1. Ventas` | Ventas | 1 | 6 |
| `2. Educativos` | Educativos | 2 | 4 |
| `3. Producto` | — (sin tab en el sitio) | 3 | 0 |
| `4. IA` | IA | 4 | 2 |
| `5. UGC` | UGC | 5 | 1 |
| `6. Aspiracional` | Aspiracional | **7** | 3 |
| `7. Generales` | Generales | **6** | 9 |

⚠️ Los últimos dos están cruzados a propósito: el nombre de la carpeta en Desktop no
coincidía con el `data-caso` que usa el sitio (Generales=6, Aspiracional=7 en el HTML).
Si agregas más videos, respeta el `data-caso`, no el número de la carpeta.

Para agregar/reemplazar un video: colócalo en `public/videos/caso-N/` y agrega/edita el
`<video src="/videos/caso-N/X.mp4" controls playsinline preload="metadata">` correspondiente
en `src/views/HomeView.vue`.

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

## 6. Dominio personalizado: video.marcatexto.mx

El DNS de `marcatexto.mx` está en **GoDaddy** (mismo lugar donde ya apuntaste
`crm.marcatexto.mx` a Firebase Hosting — este proceso es idéntico, solo que a un
proyecto de Firebase nuevo y dedicado a esta landing).

1. **Deploy manual primero** (necesitas un sitio ya publicado antes de poder agregarle
   dominio): sección 3 de este README.
2. En [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Hosting**
   → **Agregar dominio personalizado** → escribe `video.marcatexto.mx`.
3. Firebase te da un registro **TXT** para verificar que eres dueño del dominio. Agrégalo
   en GoDaddy: **Mi cuenta → Dominios → marcatexto.mx → DNS → Agregar registro** → Tipo
   `TXT`, Nombre el que te indique Firebase (normalmente `@` o `video`), Valor el que te
   dé Firebase. Guarda.
4. Vuelve a Firebase Console y confirma la verificación (puede tardar unos minutos).
5. Firebase te muestra entonces los registros **A** (o CNAME, según el caso) que debes
   agregar para el subdominio `video`. En GoDaddy: mismo lugar, Tipo `A`, Nombre `video`,
   Valor la(s) IP(s) exactas que te muestre Firebase en ese momento (no uses IPs de otra
   fuente — Firebase las asigna por proyecto y pueden cambiar).
6. Espera la propagación de DNS (minutos a un par de horas) y el certificado SSL
   automático de Firebase (Let's Encrypt, hasta 24h la primera vez, normalmente mucho
   menos). Cuando el estado en Firebase Console diga "Conectado", `https://video.marcatexto.mx`
   ya sirve el sitio.
7. Repite los secrets de GitHub (sección 5) con el **Project ID de este proyecto nuevo**
   para que el deploy automático siga funcionando — el dominio personalizado no cambia
   nada del workflow, solo necesita que `FIREBASE_PROJECT_ID`/`FIREBASE_SERVICE_ACCOUNT`
   apunten al proyecto correcto.
