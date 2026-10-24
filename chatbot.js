/* =============================================================
   ECOFOOD – MOTOR DEL CHATBOT
   No necesitas editar este archivo. El conocimiento y la
   personalización van en conocimiento.js y chatbot.css.
   =============================================================

   CONFIGURACIÓN OPCIONAL: IA real con Google Gemini (gratis)
   ─────────────────────────────────────────────────────────────
   Déjalo vacío ("") para usar solo la base de conocimiento.
   Pega aquí tu API Key de Google AI Studio para habilitar
   respuestas generadas por Gemini cuando el bot no encuentre
   una coincidencia en conocimiento.js.

   ⚠️  IMPORTANTE: Usar la API Key directamente en el frontend
   es aceptable solo para proyectos personales / demos. Para
   producción usa un backend o un Worker de Cloudflare.
   ============================================================= */
const GEMINI_API_KEY = "";
const GEMINI_WORKER_URL = "https://red-block-9395.andressantiago-garcia18.workers.dev/";
const GEMINI_MODELO  = "gemini-1.5-flash";

// ── Bootstrap ────────────────────────────────────────────────
(function () {

  /* Carga el conocimiento */
  const KB = window.CONOCIMIENTO || (typeof CONOCIMIENTO !== "undefined" ? CONOCIMIENTO : null);
  if (!KB) { console.error("EcoBot: falta conocimiento.js"); return; }

  /* ── Constantes ─────────────────────────────────────────── */
  const UMBRAL = 0.42;
  const STOP   = new Set(("a al algo algun alguna como con cual cuales de del ella ellos en es esa ese esto esta este esto la las le les lo los me mi mis muy no o para pero por quien se si sin sobre su sus te tu tus un una uno unos unas ya yo hay puedo puede pueden quiero quisiera saber favor usted ustedes ser son estan tienen tiene tengo hola").split(" "));

  /* ── Procesamiento de texto ─────────────────────────────── */
  const normalizar = t =>
    t.toLowerCase()
     .normalize("NFD").replace(/\p{Diacritic}/gu, "")
     .replace(/[^a-z0-9ñ\s]/g, " ")
     .replace(/\s+/g, " ")
     .trim();

  const raiz = w =>
    w.length > 5 && w.endsWith("es") ? w.slice(0, -2)
  : w.length > 3 && w.endsWith("s")  ? w.slice(0, -1)
  : w;

  function tokens(t) {
    const todas  = normalizar(t).split(" ").filter(Boolean);
    const utiles = todas.filter(w => !STOP.has(w));
    return (utiles.length ? utiles : todas).map(raiz);
  }

  /* ── Levenshtein ─────────────────────────────────────────── */
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(
          d[i-1][j] + 1,
          d[i][j-1] + 1,
          d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
        );
    return d[a.length][b.length];
  }

  function parecidas(a, b) {
    if (a === b) return 1;
    if (a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a))) return 0.9;
    const tol = Math.min(a.length, b.length) >= 7 ? 2 : Math.min(a.length, b.length) >= 4 ? 1 : 0;
    return tol && distancia(a, b) <= tol ? 0.8 : 0;
  }

  function similitud(tu, tp) {
    if (!tu.length || !tp.length) return 0;
    let suma = 0;
    for (const u of tu) suma += Math.max(0, ...tp.map(p => parecidas(u, p)));
    const cubreUsuario   = suma / tu.length;
    const cubrepregunta  = suma / tp.length;
    return 0.65 * cubreUsuario + 0.35 * Math.min(1, cubrepregunta);
  }

  /* ── Índice ──────────────────────────────────────────────── */
  const indice = KB.temas.map(t => ({
    tema: t,
    variantes: t.preguntas.map(tokens)
  }));

  function buscar(texto) {
    const tu = tokens(texto);
    let mejor = null, maxScore = 0;
    for (const { tema, variantes } of indice) {
      for (const tp of variantes) {
        const s = similitud(tu, tp);
        if (s > maxScore) { maxScore = s; mejor = tema; }
      }
    }
    return maxScore >= UMBRAL ? mejor : null;
  }

  /* ── Historial de conversación ───────────────────────────── */
  const historial = [];

  /* ── Gemini ──────────────────────────────────────────────── */
  async function preguntarGemini(mensaje) {
    if (!GEMINI_API_KEY && !GEMINI_WORKER_URL) throw new Error("Sin API Key ni Worker URL");

    const contexto = KB.temas
      .map(t => `- ${t.preguntas[0]}: ${t.respuesta}`)
      .join("\n")
      .slice(0, 6000);

    const instrucciones = `Eres el asistente virtual de EcoFood, una app para reducir el desperdicio de alimentos.
Responde SIEMPRE en español, de forma amable y breve (máximo 4 frases), usando solo esta información:
${contexto}
Si no sabes la respuesta o no tiene que ver con la app, dilo con amabilidad y sugiere ir a la sección de Ayuda. Nunca inventes precios ni datos.`;

    const contents = historial.slice(-6).map(m => ({
      role: m.rol === "bot" ? "model" : "user",
      parts: [{ text: String(m.texto).slice(0, 800) }]
    }));
    contents.push({ role: "user", parts: [{ text: mensaje }] });

    // Usa el Worker URL directamente si no hay API key propia
    const fetchURL = GEMINI_API_KEY
      ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELO}:generateContent?key=${GEMINI_API_KEY}`
      : GEMINI_WORKER_URL;

    const r = await fetch(
      fetchURL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instrucciones }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
        })
      }
    );
    if (!r.ok) throw new Error("Gemini error " + r.status);
    const data = await r.json();
    return data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "Lo siento, no pude responder en este momento. 🙏";
  }

  /* ── Formato Markdown básico ─────────────────────────────── */
  function formato(txt) {
    return txt
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  /* ── DOM ─────────────────────────────────────────────────── */
  const raizDOM = document.createElement("div");
  raizDOM.className = "cb";
  raizDOM.innerHTML = `
    <button class="cb-toggle" onclick="ecoBotAbrir(true)" aria-label="Abrir chat EcoBot">
      <span style="font-size:26px">🌿</span>
    </button>
    <div class="cb-ventana" role="dialog" aria-label="Chat EcoBot">
      <div class="cb-cabecera">
        <div class="cb-avatar">🌿</div>
        <div>
          <strong>${KB.nombreBot}</strong>
          <small>En línea</small>
        </div>
        <button class="cb-cerrar" onclick="ecoBotAbrir(false)" aria-label="Cerrar chat">✕</button>
      </div>
      <div class="cb-lista" id="cbLista"></div>
      <form class="cb-form" id="cbForm">
        <input
          class="cb-input"
          id="cbEntrada"
          type="text"
          placeholder="Escribe tu pregunta..."
          autocomplete="off"
          maxlength="300"
        >
        <button type="submit" class="cb-enviar" aria-label="Enviar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>`;
  document.body.appendChild(raizDOM);

  const lista   = document.getElementById("cbLista");
  const entrada = document.getElementById("cbEntrada");

  /* ── Helpers de UI ───────────────────────────────────────── */
  function agregar(html, clase) {
    const div = document.createElement("div");
    div.className = "cb-mensaje " + clase;
    div.innerHTML = html;
    lista.appendChild(div);
    lista.scrollTop = lista.scrollHeight;
    return div;
  }

  function responderBot(texto, accion, sugerencias) {
    const div = agregar(formato(texto), "bot");
    if (accion) {
      const b = document.createElement("a");
      b.className  = "cb-accion";
      b.textContent = accion.texto + " ›";
      b.href        = accion.url;
      // Si el link empieza con # es una sección interna de la SPA
      if (accion.url.startsWith("#")) {
        b.addEventListener("click", e => {
          e.preventDefault();
          const id = accion.url.slice(1);
          if (typeof mostrar === "function") mostrar(id);
          ecoBotAbrir(false);
        });
      }
      div.appendChild(b);
    }
    if (sugerencias?.length) {
      const cont = document.createElement("div");
      cont.className = "cb-chips";
      sugerencias.forEach(s => {
        const c = document.createElement("button");
        c.textContent = s;
        c.onclick = () => enviar(s);
        cont.appendChild(c);
      });
      lista.appendChild(cont);
    }
    historial.push({ rol: "bot", texto });
    lista.scrollTop = lista.scrollHeight;
  }

  const escribiendo = () => agregar(
    '<span class="cb-puntos"><i></i><i></i><i></i></span>',
    "bot cb-escribiendo"
  );

  /* ── Envío de mensaje ────────────────────────────────────── */
  async function enviar(texto) {
    texto = texto.trim();
    if (!texto) return;
    lista.querySelectorAll(".cb-chips").forEach(c => c.remove());
    agregar(esc(texto), "usuario");
    historial.push({ rol: "usuario", texto });
    entrada.value = "";

    const tema     = buscar(texto);
    const cargando = escribiendo();

    if (tema) {
      await new Promise(r => setTimeout(r, 450 + Math.random() * 400));
      cargando.remove();
      responderBot(tema.respuesta, tema.accion);
      return;
    }

    if (GEMINI_API_KEY || GEMINI_WORKER_URL) {
      try {
        const resp = await preguntarGemini(texto);
        cargando.remove();
        responderBot(resp);
        return;
      } catch (e) {
        console.warn("EcoBot Gemini:", e.message);
      }
    }

    await new Promise(r => setTimeout(r, 400));
    cargando.remove();
    responderBot(KB.noEntiendo, null, KB.sugerencias);
  }

  function esc(t) {
    return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  /* ── Eventos ─────────────────────────────────────────────── */
  document.getElementById("cbForm").onsubmit = e => {
    e.preventDefault();
    enviar(entrada.value);
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") ecoBotAbrir(false);
  });

  /* ── Control abierto/cerrado ─────────────────────────────── */
  window.ecoBotAbrir = function(abrir) {
    raizDOM.classList.toggle("cb-abierto", abrir);
    if (abrir) entrada.focus();
  };

  /* ── Bienvenida automática ───────────────────────────────── */
  responderBot(KB.bienvenida, null, KB.sugerencias);

  /* ── Función de prueba en consola ────────────────────────── */
  window.ecoBotProbar = t => {
    const r = buscar(t);
    console.log(r ? r.preguntas[0] : "sin coincidencia");
  };

})();
