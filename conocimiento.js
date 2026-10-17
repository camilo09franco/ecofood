/* =========================================================
   ECOFOOD – BASE DE CONOCIMIENTO DEL CHATBOT
   Edita este archivo para entrenar al asistente con la
   información real de la empresa / aplicación.
   ========================================================= */

window.CONOCIMIENTO = {

  // ── Identidad del bot ────────────────────────────────────
  nombreBot: "EcoBot 🌿",
  bienvenida:
    "¡Hola! 👋 Soy **EcoBot**, el asistente de **EcoFood**. Estoy aquí para ayudarte a reducir el desperdicio de alimentos y ahorrar dinero. ¿En qué te puedo ayudar?",
  noEntiendo:
    "Hmm, no encontré información sobre eso. Puedo ayudarte con temas como **agregar alimentos**, **recetas**, **recordatorios**, **estadísticas** o **cómo funciona EcoFood**. 🌱",

  // ── Sugerencias de inicio ─────────────────────────────────
  sugerencias: [
    "¿Qué es EcoFood?",
    "¿Cómo agrego un alimento?",
    "Quiero ver recetas",
    "¿Cómo inicio sesión?"
  ],

  // ── Temas ─────────────────────────────────────────────────
  temas: [

    // ── Qué es EcoFood ────────────────────────────────────
    {
      preguntas: [
        "que es ecofood",
        "para que sirve",
        "qué hace esta app",
        "de que trata",
        "presentate",
        "sobre ecofood",
        "info",
        "informacion"
      ],
      respuesta:
        "**EcoFood** es una aplicación web para **reducir el desperdicio de alimentos** en tu hogar. Te permite:\n\n🥬 Registrar alimentos con fecha de vencimiento\n⏰ Recibir recordatorios antes de que venzan\n🍳 Descubrir recetas con lo que tienes\n📊 Ver tu impacto ecológico y el dinero ahorrado\n\n¡Menos desperdicio, más ahorro! 🌎"
    },

    // ── Cómo agregar alimento ─────────────────────────────
    {
      preguntas: [
        "agregar alimento",
        "como agrego",
        "registrar comida",
        "nueva despensa",
        "añadir producto",
        "agregar producto",
        "como registro",
        "ingresar alimento",
        "nueva comida"
      ],
      respuesta:
        "Para agregar un alimento:\n\n1️⃣ Haz clic en el botón verde **+ Agregar alimento** (esquina superior derecha).\n2️⃣ Ingresa el **nombre**, la **fecha de vencimiento**, la **cantidad** y la **categoría**.\n3️⃣ Confirma y tu alimento quedará guardado en tu despensa. ✅",
      accion: { texto: "Ir a Mis alimentos", url: "#alimentos" }
    },

    // ── Próximos a vencer ─────────────────────────────────
    {
      preguntas: [
        "proximos a vencer",
        "alimentos por vencer",
        "que vence pronto",
        "caducidad",
        "fecha de vencimiento",
        "alertas de vencimiento",
        "que esta por vencer",
        "vencimiento"
      ],
      respuesta:
        "En la sección **Próximos a vencer** 📅 ves todos los alimentos ordenados por urgencia:\n\n🔴 **Rojo** – Quedan 1-2 días, consúmelos ya.\n🟡 **Amarillo** – Quedan 3-6 días, tenlos presentes.\n🟢 **Verde** – En buen estado.\n\n¡Usa el método FIFO: consume primero lo que vence antes! 🌱",
      accion: { texto: "Ver próximos a vencer", url: "#vencer" }
    },

    // ── Recetas ───────────────────────────────────────────
    {
      preguntas: [
        "recetas",
        "que puedo cocinar",
        "como usar mis alimentos",
        "que cocino",
        "sugerencias de comida",
        "receta",
        "preparar",
        "comida",
        "cocinar",
        "platos"
      ],
      respuesta:
        "En la sección **Recetas** 🍳 encontrarás ideas para aprovechar lo que tienes:\n\n🍳 **Tortilla de verduras** – 20 min\n🍓 **Batido de frutas** – 10 min\n🥗 **Ensalada fresca** – 10 min\n🥘 **Salteado de verduras** – 25 min\n\n¡Ningún alimento se desperdicia con EcoFood! 😄",
      accion: { texto: "Ver recetas", url: "#recetas" }
    },

    // ── Recordatorios ─────────────────────────────────────
    {
      preguntas: [
        "recordatorios",
        "notificaciones",
        "avisos",
        "alarmas",
        "alertas",
        "recordatorio",
        "me avisa",
        "me recuerda"
      ],
      respuesta:
        "EcoFood te envía **recordatorios automáticos** 🔔 cuando tus alimentos están por vencer.\n\nPuedes configurar los avisos con **1 o 2 días de anticipación** desde la sección **Perfil y Cuenta**. También puedes ver todos tus recordatorios activos en la sección de **Recordatorios**.",
      accion: { texto: "Ver recordatorios", url: "#recordatorios" }
    },

    // ── Estadísticas ──────────────────────────────────────
    {
      preguntas: [
        "estadisticas",
        "cuanto he ahorrado",
        "impacto",
        "dinero ahorrado",
        "desperdicio evitado",
        "co2",
        "estadistica",
        "metricas",
        "mi progreso",
        "logros"
      ],
      respuesta:
        "En **Estadísticas** 📊 puedes ver tu impacto real:\n\n💚 **Alimentos aprovechados** esta semana\n🌿 **Kilos de desperdicio evitado**\n💰 **Dinero ahorrado** este mes\n🔥 **Días de racha eco** consecutivos\n\n¡Cada alimento que no desperdicias, cuenta! 🌎",
      accion: { texto: "Ver estadísticas", url: "#estadisticas" }
    },

    // ── Inicio de sesión / registro ───────────────────────
    {
      preguntas: [
        "como inicio sesion",
        "login",
        "registrarse",
        "crear cuenta",
        "entrar",
        "acceder",
        "ingresar",
        "iniciar sesion",
        "registro",
        "contrasena",
        "contrasenna",
        "usuario"
      ],
      respuesta:
        "Puedes ingresar a EcoFood de varias formas:\n\n📧 **Correo y contraseña** – Crea una cuenta nueva o ingresa con tus datos.\n🟠 **Google** – Inicia sesión con un solo clic.\n👤 **Modo invitado** – Accede sin crear cuenta (los datos se guardan localmente).\n\nTus datos de sesión se recuerdan automáticamente. 🔒",
      accion: { texto: "Ir al login", url: "login.html" }
    },

    // ── Firebase ──────────────────────────────────────────
    {
      preguntas: [
        "firebase",
        "base de datos",
        "sincronizar",
        "nube",
        "datos",
        "almacenamiento",
        "como guarda los datos"
      ],
      respuesta:
        "EcoFood usa **Firebase** de Google para la autenticación de usuarios. Puedes conectar tus propias credenciales en el archivo `firebase-config.js` o usar el **modo demo** interactivo sin configuración adicional. 🔥"
    },

    // ── Categorías de alimentos ───────────────────────────
    {
      preguntas: [
        "categorias",
        "tipos de alimentos",
        "frutas",
        "verduras",
        "lacteos",
        "carnes",
        "despensa",
        "clasificar",
        "organizar alimentos"
      ],
      respuesta:
        "Puedes organizar tus alimentos en **5 categorías**:\n\n🍎 **Frutas**\n🥬 **Verduras**\n🥛 **Lácteos**\n🍗 **Carnes**\n🥫 **Despensa** (enlatados, granos, etc.)\n\nFiltrarlos en 'Mis alimentos' te ayuda a encontrarlos rápido. 😊"
    },

    // ── Consejos eco ──────────────────────────────────────
    {
      preguntas: [
        "consejos",
        "tips",
        "sugerencias",
        "como ahorrar",
        "como reducir desperdicio",
        "buenas practicas",
        "consejo",
        "medio ambiente",
        "planeta",
        "nevera"
      ],
      respuesta:
        "Aquí van algunos consejos EcoFood 🌱:\n\n🧊 **Método FIFO** – Coloca al frente los alimentos que vencen pronto.\n📝 **Planea tus compras** – Revisa tu despensa antes de ir al supermercado.\n🥗 **Aprovecha las sobras** – Las frutas maduras son ideales para batidos.\n🌎 **Impacto real** – El desperdicio alimentario produce el 10% de las emisiones globales de CO₂.",
      accion: { texto: "Ver todos los consejos", url: "#consejos" }
    },

    // ── Dinero ahorrado ───────────────────────────────────
    {
      preguntas: [
        "como calcula el ahorro",
        "como sabe cuanto ahorre",
        "calculo de ahorro",
        "precio",
        "valor",
        "costo",
        "plata",
        "cuanto vale"
      ],
      respuesta:
        "Cada vez que marcas un alimento como **consumido** antes de su fecha de vencimiento, EcoFood registra un ahorro estimado basado en el tipo de producto. Así puedes ver cuánto dinero has **evitado desperdiciar** al mes. 💰📈"
    },

    // ── Catálogo ──────────────────────────────────────────
    {
      preguntas: [
        "catalogo",
        "ver catalogo",
        "lista de alimentos",
        "alimentos disponibles",
        "que hay en el catalogo"
      ],
      respuesta:
        "El **Catálogo de alimentos** 🥬 es una vista de referencia con todos los productos registrados. Puedes buscarlos por nombre y filtrarlos por categoría para encontrar rápidamente lo que necesitas.",
      accion: { texto: "Ver catálogo", url: "catalogo.html" }
    },

    // ── Saludo ────────────────────────────────────────────
    {
      preguntas: [
        "hola",
        "buenas",
        "buen dia",
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "hey",
        "hi",
        "saludos"
      ],
      respuesta:
        "¡Hola! 👋 Soy **EcoBot**, el asistente de EcoFood. ¿En qué te puedo ayudar hoy? Puedo contarte sobre recetas, alimentos próximos a vencer, estadísticas y mucho más. 🌿"
    },

    // ── Perfil ────────────────────────────────────────────
    {
      preguntas: [
        "perfil",
        "mi cuenta",
        "mi perfil",
        "configuracion",
        "ajustes",
        "cambiar nombre",
        "cambiar correo",
        "cerrar sesion",
        "desconectar"
      ],
      respuesta:
        "En **Perfil y Cuenta** ⚙️ puedes:\n\n👤 Cambiar tu nombre y preferencias.\n🔔 Configurar notificaciones de vencimiento.\n💱 Seleccionar tu moneda de ahorro (COP, USD, EUR, MXN).\n🔒 Cerrar sesión o cambiar de cuenta.",
      accion: { texto: "Ir a Perfil", url: "#perfil" }
    },

    // ── Ayuda ─────────────────────────────────────────────
    {
      preguntas: [
        "ayuda",
        "help",
        "no entiendo",
        "como funciona",
        "preguntas frecuentes",
        "faq",
        "soporte",
        "manual"
      ],
      respuesta:
        "Estoy aquí para ayudarte 💚. También puedes revisar la sección **Ayuda y Preguntas Frecuentes** dentro de la app, donde encontrarás guías paso a paso para usar todas las funciones de EcoFood.",
      accion: { texto: "Ver ayuda", url: "#ayuda" }
    },

    // ── Despedida ─────────────────────────────────────────
    {
      preguntas: [
        "adios",
        "chao",
        "hasta luego",
        "bye",
        "gracias",
        "listo",
        "ok gracias",
        "eso es todo"
      ],
      respuesta:
        "¡Hasta pronto! 🌿 Recuerda: **menos desperdicio, más ahorro**. Cuida el planeta, un alimento a la vez. 🌎 Si necesitas algo más, aquí estaré."
    }

  ]
};
