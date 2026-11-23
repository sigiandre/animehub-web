---

### 2. `README.md` para el Frontend (`animehub-web`)

Guárdalo en la raíz de `E:\Programacion\AnimeHub\animehub-web\README.md`:

```markdown
# 🔥 AnimeHub Web — Frontend (React + TypeScript + Tailwind CSS)

Interfaz web moderna y responsiva de **AnimeHub**, construida con **React, TypeScript, Vite y Tailwind CSS v4**. Permite explorar el catálogo de animes, filtrar por categorías, visualizar fichas detalladas con videos embebidos de YouTube, gestionar contenido y administrar favoritos y notificaciones.

🔗 **Repositorio Backend:** [animehub-api](https://github.com/sigiandre/animehub-api)

---

## 🛠️ Stack Tecnológico

* **React 18+** & **TypeScript**
* **Vite** — Empaquetador y servidor de desarrollo ultrarrápido
* **Tailwind CSS v4** — Diseño responsivo en modo oscuro
* **React Router DOM** — Navegación y rutas protegidas
* **Axios** — Cliente HTTP con interceptores automáticos para tokens JWT
* **Lucide React** — Iconografía moderna

---

## ✨ Vistas y Funcionalidades

* **Catálogo (`/`)**: Grilla interactiva con buscador instantáneo y filtro por categorías.
* **Ficha de Anime (`/animes/:id`)**:
  * **Sagas y Episodios:** Visualización por arcos y formulario rápido para añadir sagas y capítulos.
  * **Personajes y Habilidades:** Tarjetas con biografía, *Seiyuu*, habilidades y creación directa desde la ficha.
  * **Videos:** Reproductor embebido automático para enlaces de YouTube (*Openings*, *Endings*, *Trailers*).
  * **Reseñas y Foro:** Publicación de puntuaciones, comentarios y temas de debate.
* **Panel de Gestión (`/manage`)**: Formulario administrativo para dar de alta animes, categorías, estudios y mangakas.
* **Mi Lista y Actividad (`/watchlist`)**: Administración de animes favoritos y revisión de notificaciones.
* **Autenticación (`/login`)**: Registro e inicio de sesión persistente con `AuthContext`.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* [Node.js 18+](https://nodejs.org/)
* Tener en ejecución el backend [animehub-api](https://github.com/sigiandre/animehub-api)

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/sigiandre/animehub-web.git](https://github.com/sigiandre/animehub-web.git)
   cd animehub-web

2. Instalar dependencias:
npm install

3. Configurar variables de entorno copiando .env.example a .env:
cp .env.example .env
Asegúrate de apuntar a la URL de tu backend:

Fragmento de código
VITE_API_BASE_URL=https://localhost:7202/api

4. Iniciar el servidor de desarrollo:
npm run dev

Abre http://localhost:5173 en tu navegador.

5. Compilación para Producción
npm run build

6. 👨‍💻 Autor
Sigi Andre Diaz Quiroz — Ingeniero de Software
