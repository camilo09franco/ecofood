// =========================================================
// ECOFOOD - LóGICA DE APLICACIóN E INTERACTIVIDAD PERSONAL
// =========================================================

// Variables de estado del usuario activo
let alimentos = [];
let recordatorios = [];
let usuarioStats = {
    dineroAhorrado: 0,
    alimentosAprovechados: 0,
    desperdicioEvitadoKg: 0,
    rachaDias: 1,
    historialSemanal: [0, 0, 0, 0, 0, 0, 0] // Lun, Mar, Mió, Jue, Vie, Sób, Dom
};
let usuarioConfig = {
    moneda: "COP",
    notificaciones: 2
};
let onboardingCompletado = false;

let alimentoSeleccionado = null;
let fotoTemporalSubida = null;

// RECETAS RECOMENDADAS (VINCULADAS A INGREDIENTES REALES)
const recetas = [
    {
        id: 1,
        titulo: "Tortilla de verduras",
        subtitulo: "Con lo que tienes en casa",
        tiempo: "20 min",
        categoria: "Desayunos",
        emoji: "🥚",
         foto: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["2 huevos", "1/2 zanahoria rallada", "Espinacas o lechuga picada", "1 tomate en cubitos", "Sal y pimienta"],
        ingredientesClave: ["verduras", "zanahoria", "lechuga", "tomate", "espinaca", "huevos"],
        preparacion: "Bate los huevos con sal y pimienta. Saltea las verduras 3 minutos en sartón con un poco de aceite de oliva. Vierte los huevos batidos y cocina a fuego medio 3 minutos por lado hasta dorar."
    },
    {
        id: 2,
        titulo: "Batido de frutas maduras",
        subtitulo: "Aprovecha frutas antes que venzan",
        tiempo: "10 min",
        categoria: "Desayunos",
        emoji: "🥚",
        foto: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["1 taza de fresas o fruta madura", "1 vaso de leche o yogur", "1 cucharada de miel", "Hielo al gusto"],
        ingredientesClave: ["fresa", "fresas", "frutas", "fruta", "leche", "yogur"],
        preparacion: "Lava bien las frutas, colócalas en la licuadora con la leche o yogur y la miel. Licóa por 1 minuto hasta obtener una mezcla suave y cremosa."
    },
    {
        id: 3,
        titulo: "Ensalada fresca crocante",
        subtitulo: "Rápida, fresca y nutritiva",
        tiempo: "10 min",
        categoria: "Almuerzos",
        emoji: "🥗",
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["Lechuga o espinaca troceada", "2 tomates en rodajas", "Queso en cubos", "Aceite de oliva y limón"],
        ingredientesClave: ["lechuga", "tomates", "tomate", "queso", "verduras"],
        preparacion: "Mezcla la lechuga con los tomates y el queso. Adereza con aceite de oliva, jugo de limón, sal y una pizca de orógano."
    },
    {
        id: 4,
        titulo: "Salteado de verduras y pollo",
        subtitulo: "Fácil y lleno de sabor",
        tiempo: "25 min",
        categoria: "Cenas",
        emoji: "🍳",
        foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["Zanahorias en bastones", "Pechuga de pollo en tiras", "Cebolla", "Salsa de soja"],
        ingredientesClave: ["pollo", "carnes", "carne", "verduras", "zanahoria", "cebolla"],
        preparacion: "Saltea el pollo en un wok bien caliente con aceite. Agrega las verduras cortadas y saltea por 6 minutos a fuego vivo con un toque de salsa de soja."
    }
];

// =========================================================
// GESTIóN DE ALMACENAMIENTO PERSONAL POR USUARIO
// =========================================================

function obtenerUsuarioClave() {
    try {
        let user = typeof currentUser !== "undefined" && currentUser ? currentUser : null;
        if (!user) {
            const raw = localStorage.getItem("ecofood_user_session");
            if (raw) user = JSON.parse(raw);
        }
        if (user) {
            const id = user.uid || user.email || "demo_user";
            return "usr_" + id.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
        }
    } catch(e) {}
    return "usr_invitado";
}

function formatearFechaHoy() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function sumarDiasFecha(dias) {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function calcularDiasRestantes(fechaStr) {
    if (!fechaStr) return 1;
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const venc = new Date(fechaStr + "T00:00:00");
        const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
        return diff < 1 ? 1 : diff;
    } catch(e) {
        return 1;
    }
}

// Carga o inicializa los datos de la persona activa
function cargarDatosUsuario() {
    const userKey = obtenerUsuarioClave();
    const storageKeyAlim = `ecofood_alimentos_${userKey}`;
    const storageKeyRec = `ecofood_recordatorios_${userKey}`;
    const storageKeyStats = `ecofood_stats_${userKey}`;
    const storageKeyConf = `ecofood_config_${userKey}`;
    const storageKeyOnboarding = `ecofood_onboarding_${userKey}`;

    const rawAlim = localStorage.getItem(storageKeyAlim);
    const rawRec = localStorage.getItem(storageKeyRec);
    const rawStats = localStorage.getItem(storageKeyStats);
    const rawConf = localStorage.getItem(storageKeyConf);
    const rawOnboarding = localStorage.getItem(storageKeyOnboarding);

    if (rawAlim === null) {
        // =========================================================
        // USUARIO NUEVO: INICIALIZACIóN CON EJEMPLOS EDUCATIVOS
        // =========================================================
        alimentos = [
            {
                id: 101,
                nombre: "Leche entera",
                categoria: "Lácteos",
                cantidad: "1 litro",
                fechaVencimiento: sumarDiasFecha(2),
                diasRestantes: 2,
                emoji: "🥛",
                foto: null,
                esEjemplo: true
            },
            {
                id: 102,
                nombre: "Fresas frescas",
                categoria: "Frutas",
                cantidad: "250 gramos",
                fechaVencimiento: sumarDiasFecha(4),
                diasRestantes: 4,
                emoji: "🍓",
                foto: null,
                esEjemplo: true
            },
            {
                id: 103,
                nombre: "Manzanas rojas",
                categoria: "Frutas",
                cantidad: "1 kilo",
                fechaVencimiento: sumarDiasFecha(8),
                diasRestantes: 8,
                emoji: "🍎",
                foto: null,
                esEjemplo: true
            }
        ];

        recordatorios = [
            {
                id: 201,
                emoji: "🥛",
                texto: "Ejemplo: La leche vence en 2 días, ópreparamos un batido?",
                tiempo: "Para hoy o mañana",
                completado: false,
                esEjemplo: true
            },
            {
                id: 202,
                emoji: "🗓️",
                texto: "Ejemplo: Revisar verduras en la gaveta baja",
                tiempo: "En 3 días",
                completado: false,
                esEjemplo: true
            }
        ];

        usuarioStats = {
            dineroAhorrado: 0,
            alimentosAprovechados: 0,
            desperdicioEvitadoKg: 0,
            rachaDias: 1,
            historialSemanal: [0, 0, 0, 0, 0, 0, 0]
        };

        usuarioConfig = {
            moneda: "COP",
            notificaciones: 2
        };

        onboardingCompletado = false;

        guardarAlimentosUsuario();
        guardarRecordatoriosUsuario();
        guardarStatsUsuario();
        guardarConfigUsuario();
        localStorage.setItem(storageKeyOnboarding, "false");
    } else {
        // Cargar datos existentes del usuario
        try { alimentos = JSON.parse(rawAlim) || []; } catch(e) { alimentos = []; }
        try { recordatorios = JSON.parse(rawRec) || []; } catch(e) { recordatorios = []; }
        try { usuarioStats = JSON.parse(rawStats) || usuarioStats; } catch(e) {}
        try { usuarioConfig = JSON.parse(rawConf) || usuarioConfig; } catch(e) {}
        onboardingCompletado = (rawOnboarding === "true");

        // Recalcular días restantes para fechas reales
        alimentos.forEach(a => {
            if (a.fechaVencimiento) {
                a.diasRestantes = calcularDiasRestantes(a.fechaVencimiento);
            }
        });
    }

    // Sincronizar selector de moneda en UI
    const selMoneda = document.getElementById("configMoneda");
    if (selMoneda && usuarioConfig.moneda) {
        selMoneda.value = usuarioConfig.moneda;
    }
}

function guardarAlimentosUsuario() {
    const userKey = obtenerUsuarioClave();
    localStorage.setItem(`ecofood_alimentos_${userKey}`, JSON.stringify(alimentos));
}

function guardarRecordatoriosUsuario() {
    const userKey = obtenerUsuarioClave();
    localStorage.setItem(`ecofood_recordatorios_${userKey}`, JSON.stringify(recordatorios));
}

function guardarStatsUsuario() {
    const userKey = obtenerUsuarioClave();
    localStorage.setItem(`ecofood_stats_${userKey}`, JSON.stringify(usuarioStats));
}

function guardarConfigUsuario() {
    const userKey = obtenerUsuarioClave();
    localStorage.setItem(`ecofood_config_${userKey}`, JSON.stringify(usuarioConfig));
}

// Sincronizador global llamado por Firebase o login
window.sincronizarDatosUsuario = function(user) {
    cargarDatosUsuario();
    renderizarTodo();
};

// =========================================================
// INICIALIZACIóN
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosUsuario();
    renderizarTodo();
});

function renderizarTodo() {
    renderizarResumenDashboard();
    renderizarExpiringInicio();
    renderizarAlimentos('Todas');
    renderizarVencer();
    renderizarRecetasInicio();
    renderizarRecetasCompletas('Todas');
    renderizarRecordatorios();
    renderizarEstadisticas();
    actualizarContadores();
    actualizarVisibilidadGuia();
}

function formatearDinero(monto) {
    const num = Math.round(monto || 0);
    const moneda = (usuarioConfig && usuarioConfig.moneda) ? usuarioConfig.moneda : "COP";
    if (moneda === "USD") return `$ ${num.toLocaleString('en-US')} USD`;
    if (moneda === "EUR") return `ó ${num.toLocaleString('es-ES')} EUR`;
    if (moneda === "MXN") return `$ ${num.toLocaleString('es-MX')} MXN`;
    return `$ ${num.toLocaleString('es-CO')}`;
}

// =========================================================
// GUóA DE BIENVENIDA Y EJEMPLOS PARA USUARIOS NUEVOS
// =========================================================

function actualizarVisibilidadGuia() {
    const banner = document.getElementById("bannerBienvenidaUsuario");
    if (banner) {
        banner.style.display = onboardingCompletado ? "none" : "block";
    }

    const hintAlim = document.getElementById("hintBannerAlimentos");
    if (hintAlim) {
        const tieneEjemplos = alimentos.some(a => a.esEjemplo);
        hintAlim.style.display = tieneEjemplos ? "flex" : "none";
    }
}

function cerrarGuiaBienvenida() {
    onboardingCompletado = true;
    const userKey = obtenerUsuarioClave();
    localStorage.setItem(`ecofood_onboarding_${userKey}`, "true");
    actualizarVisibilidadGuia();
    mostrarAlertaToast("¡Guía completada! Tu despensa estó lista para ti 🌿", "success");
}

function reabrirGuiaBienvenida() {
    onboardingCompletado = false;
    actualizarVisibilidadGuia();
    mostrar('inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarAlimentosEjemplo() {
    if (confirm("¡Deseas eliminar los alimentos de ejemplo y empezar tu despensa desde cero?")) {
        alimentos = alimentos.filter(a => !a.esEjemplo);
        recordatorios = recordatorios.filter(r => !r.esEjemplo);
        guardarAlimentosUsuario();
        guardarRecordatoriosUsuario();
        renderizarTodo();
        mostrarAlertaToast("Alimentos de ejemplo eliminados. ¡Agrega tus propios productos reales! 🌱", "info");
    }
}

// =========================================================
// GESTIóN DE FOTO DE PERFIL PERSONAL
// =========================================================

function cambiarFotoPerfil(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen vólido (JPG, PNG, WebP).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoBase64 = e.target.result;
        
        let user = typeof currentUser !== "undefined" && currentUser ? currentUser : null;
        if (!user) {
            user = {
                uid: "user-" + Date.now(),
                displayName: "Usuario",
                email: "mi.cuenta@ecofood.com",
                photoURL: fotoBase64,
                isDemo: true
            };
        } else {
            user.photoURL = fotoBase64;
        }

        currentUser = user;
        guardarSesionLocal(currentUser);

        if (typeof guardarUsuarioRegistrado === "function" && currentUser.email) {
            guardarUsuarioRegistrado(currentUser);
        }
        if (typeof guardarCuentaGoogle === "function" && currentUser.isGoogle) {
            guardarCuentaGoogle(currentUser);
        }

        actualizarUIConUsuario(currentUser);
        mostrarAlertaToast("¡Tu foto de perfil se actualizó correctamente! ✅", "success");
    };
    reader.readAsDataURL(file);
}

function quitarFotoPerfil() {
    if (typeof currentUser !== "undefined" && currentUser) {
        currentUser.photoURL = null;
        guardarSesionLocal(currentUser);

        if (typeof guardarUsuarioRegistrado === "function" && currentUser.email) {
            guardarUsuarioRegistrado(currentUser);
        }
        if (typeof guardarCuentaGoogle === "function" && currentUser.isGoogle) {
            guardarCuentaGoogle(currentUser);
        }

        actualizarUIConUsuario(currentUser);
        mostrarAlertaToast("Foto de perfil eliminada.", "info");
    }
}

function cambiarMonedaPreferencia(nuevaMoneda) {
    usuarioConfig.moneda = nuevaMoneda;
    guardarConfigUsuario();
    renderizarTodo();
    mostrarAlertaToast(`Moneda de ahorro actualizada a ${nuevaMoneda}.`, "info");
}

// =========================================================
// CONTROL DE NAVEGACIÓN Y VISTAS
// =========================================================

function mostrar(nombreSeccion) {
    const vistas = document.querySelectorAll(".app-view");
    vistas.forEach(v => v.classList.remove("active-view"));

    const vistaActiva = document.getElementById(nombreSeccion);
    if (vistaActiva) {
        vistaActiva.classList.add("active-view");
    }

    const sidebarBtns = document.querySelectorAll(".sidebar-btn");
    sidebarBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(`'${nombreSeccion}'`)) {
            btn.classList.add("active");
        }
    });

    const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
    bottomNavItems.forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(`'${nombreSeccion}'`)) {
            item.classList.add("active");
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// RENDERIZADO Y DASHBOARD
// =========================================================

function actualizarContadores() {
    const totalAlimentos = alimentos.length;
    const proximosAVencer = alimentos.filter(a => a.diasRestantes <= 5).length;

    const elTotal = document.getElementById("totalAlimentosResumen");
    const elVencer = document.getElementById("totalVencerResumen");
    const elSidebarBadge = document.getElementById("badgeVencerSidebar");

    if (elTotal) elTotal.textContent = totalAlimentos;
    if (elVencer) elVencer.textContent = proximosAVencer;
    if (elSidebarBadge) elSidebarBadge.textContent = proximosAVencer;

    // Actualizar saludo personalizado con nombre real
    let nombre = "Usuario";
    if (typeof currentUser !== "undefined" && currentUser && currentUser.displayName) {
        nombre = currentUser.displayName.split(" ")[0];
    }
    const saludoEl = document.getElementById("saludoPrincipal");
    if (saludoEl) {
        saludoEl.innerHTML = `¡Hola, ${nombre}!`;
    }
    const subtituloEl = document.getElementById("subtituloPrincipal");
    if (subtituloEl) {
        subtituloEl.textContent = totalAlimentos === 0
            ? "Tu despensa estó lista para registrar alimentos."
            : `Tienes ${totalAlimentos} alimento${totalAlimentos === 1 ? '' : 's'} en tu despensa personal.`;
    }
}

function renderizarResumenDashboard() {
    actualizarContadores();

    const dineroEl = document.getElementById("dineroAhorradoInicio");
    if (dineroEl) {
        dineroEl.textContent = formatearDinero(usuarioStats.dineroAhorrado);
    }

    const aprovechadosSemanaEl = document.getElementById("alimentosAprovechadosSemana");
    if (aprovechadosSemanaEl) {
        aprovechadosSemanaEl.textContent = usuarioStats.alimentosAprovechados;
    }

    const textoImpactoEl = document.getElementById("textoImpactoSemanal");
    if (textoImpactoEl) {
        textoImpactoEl.textContent = `Has evitado que ${usuarioStats.desperdicioEvitadoKg} kg de alimentos se desperdicien esta semana.`;
    }

    // Grófico semanal dinómico
    renderizarGraficoSemanal();
}

function renderizarGraficoSemanal() {
    const hist = (usuarioStats && usuarioStats.historialSemanal) ? usuarioStats.historialSemanal : [0,0,0,0,0,0,0];
    const maxVal = Math.max(...hist, 4);

    hist.forEach((val, idx) => {
        const pct = Math.max(12, Math.round((val / maxVal) * 100));
        const barInicio = document.getElementById(`barDay${idx}`);
        if (barInicio) {
            barInicio.style.height = `${pct}%`;
            barInicio.title = `Día ${idx + 1}: ${val} aprovechados`;
        }
        const barStats = document.getElementById(`statBarDay${idx}`);
        if (barStats) {
            barStats.style.height = `${pct}%`;
            barStats.title = `Día ${idx + 1}: ${val} aprovechados`;
        }
    });
}

function renderizarEstadisticas() {
    const elAprov = document.getElementById("statAprovechados");
    const elKg = document.getElementById("statKgEvitados");
    const elCo2 = document.getElementById("statCo2Evitado");
    const elDinero = document.getElementById("statDineroAhorrado");
    const elRacha = document.getElementById("statRachaDias");

    if (elAprov) elAprov.textContent = usuarioStats.alimentosAprovechados;
    if (elKg) elKg.textContent = `${usuarioStats.desperdicioEvitadoKg} kg`;
    if (elCo2) {
        const co2 = (usuarioStats.desperdicioEvitadoKg * 2.5).toFixed(1);
        elCo2.textContent = `CO2 evitado: ${co2} kg`;
    }
    if (elDinero) elDinero.textContent = formatearDinero(usuarioStats.dineroAhorrado);
    if (elRacha) elRacha.textContent = `${usuarioStats.rachaDias} día${usuarioStats.rachaDias === 1 ? '' : 's'}`;
}

function obtenerBadgeClase(dias) {
    if (dias <= 2) return "badge-red";
    if (dias <= 5) return "badge-orange";
    return "badge-green";
}

// Renderiza lista rópida de próximos a vencer en el Dashboard
function renderizarExpiringInicio() {
    const contenedor = document.getElementById("listaExpiringInicio");
    if (!contenedor) return;

    if (alimentos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-4 text-muted small">
                <i class="bi bi-shield-check fs-2 text-success d-block mb-1"></i>
                No tienes alimentos próximos a vencer. óTu despensa estó fresca!
            </div>
        `;
        return;
    }

    const ordenados = [...alimentos].sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 4);

    contenedor.innerHTML = ordenados.map(item => `
        <div class="expiring-item" onclick="abrirDetalleAlimento(${item.id})">
            <div class="expiring-item-icon">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : item.emoji}
            </div>
            <div class="expiring-item-content">
                <strong>${item.nombre} ${item.esEjemplo ? '<span class="badge-ejemplo">Ejemplo</span>' : ''}</strong>
                <span>${formatearFechaTexto(item.fechaVencimiento)} ó ${item.cantidad}</span>
            </div>
            <span class="expiry-badge ${obtenerBadgeClase(item.diasRestantes)}">
                ${item.diasRestantes} días
            </span>
        </div>
    `).join("");
}

// Renderiza la lista completa de alimentos en despensa con filtro
function renderizarAlimentos(categoriaFiltro = 'Todas') {
    const contenedor = document.getElementById("alimentosGrid");
    if (!contenedor) return;

    const filtrados = categoriaFiltro === 'Todas' 
        ? alimentos 
        : alimentos.filter(a => a.categoria === categoriaFiltro);

    if (filtrados.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="fs-1 mb-2">🥗</div>
                <h5 class="fw-bold">No hay alimentos en esta categoría</h5>
                <p class="text-muted small">Agrega tus productos de la compra con el botón "+ Agregar alimento".</p>
                <button class="btn btn-sm btn-eco-primary" onclick="abrirModalAgregar()">
                    <i class="bi bi-plus-lg"></i> Agregar alimento
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = filtrados.map(item => `
        <div class="food-card position-relative">
            ${item.esEjemplo ? `<span class="badge-ejemplo position-absolute top-0 end-0 m-2" style="z-index:2;"><i class="bi bi-lightbulb"></i> Ejemplo</span>` : ''}
            <div class="food-card-img-wrap">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
            </div>
            <div class="food-card-body">
                <h3 class="food-card-title">${item.nombre}</h3>
                <p class="food-card-meta">${item.categoria} ó ${item.cantidad}</p>
                <div class="food-card-footer mt-auto">
                    <span class="expiry-badge ${obtenerBadgeClase(item.diasRestantes)}">
                        ${item.diasRestantes} días
                    </span>
                    <button class="btn-card-detail" onclick="abrirDetalleAlimento(${item.id})">
                        Ver detalle
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Renderiza alimentos próximos a vencer
function renderizarVencer() {
    const contenedor = document.getElementById("vencerCardsGrid");
    if (!contenedor) return;

    if (alimentos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="fs-1 mb-2">?</div>
                <h5 class="fw-bold">No tienes alimentos en riesgo de vencer</h5>
                <p class="text-muted small">óExcelente control de tu despensa!</p>
            </div>
        `;
        return;
    }

    const ordenados = [...alimentos].sort((a, b) => a.diasRestantes - b.diasRestantes);

    contenedor.innerHTML = ordenados.map(item => `
        <div class="food-card position-relative">
            ${item.esEjemplo ? `<span class="badge-ejemplo position-absolute top-0 end-0 m-2" style="z-index:2;"><i class="bi bi-lightbulb"></i> Ejemplo</span>` : ''}
            <div class="food-card-img-wrap">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
            </div>
            <div class="food-card-body">
                <h3 class="food-card-title">${item.nombre}</h3>
                <p class="food-card-meta">${item.categoria} ó Vence: ${formatearFechaTexto(item.fechaVencimiento)}</p>
                <div class="food-card-footer mt-auto">
                    <span class="expiry-badge ${obtenerBadgeClase(item.diasRestantes)}">
                        ${item.diasRestantes} días
                    </span>
                    <button class="btn-card-detail" onclick="abrirDetalleAlimento(${item.id})">
                        Ver detalle
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Detecta si el usuario tiene ingredientes para una receta
function tieneIngredientesParaReceta(receta) {
    if (!alimentos || alimentos.length === 0) return false;
    const nombresAlimentos = alimentos.map(a => a.nombre.toLowerCase());
    const categoriasAlimentos = alimentos.map(a => a.categoria.toLowerCase());

    return receta.ingredientesClave.some(clave => {
        const c = clave.toLowerCase();
        return nombresAlimentos.some(n => n.includes(c)) || categoriasAlimentos.some(cat => cat.includes(c));
    });
}

// Renderiza recetas recomendadas en el inicio
function renderizarRecetasInicio() {
    const contenedor = document.getElementById("recetasInicioGrid");
    if (!contenedor) return;

    contenedor.innerHTML = recetas.slice(0, 2).map(r => {
        const coincide = tieneIngredientesParaReceta(r);
        return `
            <div class="recipe-card" onclick="verRecetaModal(${r.id})">
                <div class="recipe-card-media">
                    ${r.foto ? `<img src="${r.foto}" alt="${r.titulo}">` : `<span>${r.emoji}</span>`}
                    <span class="recipe-badge-time">? ${r.tiempo}</span>
                </div>
                <div class="recipe-card-info">
                    ${coincide ? `<div class="recipe-match-badge"><i class="bi bi-stars"></i> óTienes ingredientes en tu despensa!</div>` : ''}
                    <h4>${r.titulo}</h4>
                    <p>${r.subtitulo}</p>
                </div>
            </div>
        `;
    }).join("");
}

// Renderiza recetas completas en la sección Recetas
function renderizarRecetasCompletas(categoria = 'Todas') {
    const contenedor = document.getElementById("recetasCompletasGrid");
    if (!contenedor) return;

    const filtradas = categoria === 'Todas' ? recetas : recetas.filter(r => r.categoria === categoria);

    contenedor.innerHTML = filtradas.map(r => {
        const coincide = tieneIngredientesParaReceta(r);
        return `
            <div class="recipe-card" onclick="verRecetaModal(${r.id})">
                <div class="recipe-card-media">
                    ${r.foto ? `<img src="${r.foto}" alt="${r.titulo}">` : `<span>${r.emoji}</span>`}
                    <span class="recipe-badge-time">? ${r.tiempo}</span>
                </div>
                <div class="recipe-card-info">
                    ${coincide ? `<div class="recipe-match-badge"><i class="bi bi-stars"></i> óTienes ingredientes en tu despensa!</div>` : ''}
                    <h4>${r.titulo}</h4>
                    <p>${r.subtitulo}</p>
                </div>
            </div>
        `;
    }).join("");
}

// Renderiza recordatorios personales
function renderizarRecordatorios() {
    const contenedor = document.getElementById("listaRecordatorios");
    if (!contenedor) return;

    if (recordatorios.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-bell-slash fs-1 d-block mb-2 text-secondary"></i>
                <h6 class="fw-bold">No tienes recordatorios activos</h6>
                <p class="small mb-3">Crea un recordatorio para tus compras o para consumir alimentos antes de que venzan.</p>
                <button class="btn btn-sm btn-eco-primary" onclick="abrirModalRecordatorio()">
                    <i class="bi bi-plus-lg"></i> Nuevo recordatorio
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = recordatorios.map(rec => `
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white shadow-sm">
            <div class="d-flex align-items-center gap-3">
                <span class="fs-3">${rec.emoji || '?'}</span>
                <div>
                    <div class="d-flex align-items-center gap-2">
                        <strong class="d-block text-dark ${rec.completado ? 'text-decoration-line-through text-muted' : ''}">${rec.texto}</strong>
                        ${rec.esEjemplo ? `<span class="badge-ejemplo">Ejemplo</span>` : ''}
                    </div>
                    <small class="text-muted">${rec.tiempo}</small>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm ${rec.completado ? 'btn-success text-white' : 'btn-outline-success'} rounded-circle" style="width:36px;height:36px;" onclick="toggleRecordatorio(${rec.id})" title="${rec.completado ? 'Desmarcar' : 'Marcar completado'}">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="eliminarRecordatorio(${rec.id})" title="Eliminar">
                    <i class="bi bi-trash fs-5"></i>
                </button>
            </div>
        </div>
    `).join("");
}

function toggleRecordatorio(id) {
    const rec = recordatorios.find(r => r.id === id);
    if (rec) {
        rec.completado = !rec.completado;
        guardarRecordatoriosUsuario();
        renderizarRecordatorios();
        if (rec.completado) {
            mostrarAlertaToast("¡Recordatorio completado con éxito! ?", "success");
        }
    }
}

function eliminarRecordatorio(id) {
    recordatorios = recordatorios.filter(r => r.id !== id);
    guardarRecordatoriosUsuario();
    renderizarRecordatorios();
    mostrarAlertaToast("Recordatorio eliminado.", "info");
}

function abrirModalRecordatorio() {
    const inputTexto = document.getElementById("nuevoRecordatorioTexto");
    const inputTiempo = document.getElementById("nuevoRecordatorioTiempo");
    if (inputTexto) inputTexto.value = "";
    if (inputTiempo) inputTiempo.value = "";

    const modalEl = document.getElementById("modalRecordatorio");
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function guardarNuevoRecordatorio() {
    const inputTexto = document.getElementById("nuevoRecordatorioTexto");
    const inputTiempo = document.getElementById("nuevoRecordatorioTiempo");
    const selectEmoji = document.getElementById("nuevoRecordatorioEmoji");

    const texto = inputTexto ? inputTexto.value.trim() : "";
    const tiempo = inputTiempo ? inputTiempo.value.trim() : "";
    const emoji = selectEmoji ? selectEmoji.value : "?";

    if (!texto) {
        alert("Por favor escribe el mensaje de tu recordatorio.");
        return;
    }

    const nuevo = {
        id: Date.now(),
        emoji: emoji,
        texto: texto,
        tiempo: tiempo || "Próximamente",
        completado: false,
        esEjemplo: false
    };

    recordatorios.unshift(nuevo);
    guardarRecordatoriosUsuario();

    const modalEl = document.getElementById("modalRecordatorio");
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    renderizarRecordatorios();
    mostrarAlertaToast("¡Recordatorio personal guardado! 🔔", "success");
}

// =========================================================
// FILTROS
// =========================================================

function filtrarCategoria(cat, btn) {
    document.querySelectorAll(".category-filter-pills .pill-filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderizarAlimentos(cat);
}

function filtrarRecetas(cat, btn) {
    document.querySelectorAll("#recetas .category-filter-pills .pill-filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderizarRecetasCompletas(cat);
}

// =========================================================
// MODAL: AGREGAR ALIMENTO
// =========================================================

function abrirModalAgregar() {
    fotoTemporalSubida = null;
    document.getElementById("nombreAlimento").value = "";
    document.getElementById("fechaAlimento").value = "";
    document.getElementById("cantidadAlimento").value = "";
    document.getElementById("categoriaAlimento").value = "Frutas";
    
    const preview = document.getElementById("previewFotoSubida");
    const boxContent = document.getElementById("uploadBoxContenido");
    if (preview) {
        preview.style.display = "none";
        preview.src = "";
    }
    if (boxContent) {
        boxContent.style.display = "block";
    }

    const modal = new bootstrap.Modal(document.getElementById("modalAlimento"));
    modal.show();
}

function previsualizarFotoAlimento(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoTemporalSubida = e.target.result;
            const preview = document.getElementById("previewFotoSubida");
            const boxContent = document.getElementById("uploadBoxContenido");
            if (preview && boxContent) {
                preview.src = fotoTemporalSubida;
                preview.style.display = "block";
                boxContent.style.display = "none";
            }
        };
        reader.readAsDataURL(file);
    }
}

function guardarNuevoAlimento() {
    const nombre = document.getElementById("nombreAlimento").value.trim();
    const fecha = document.getElementById("fechaAlimento").value;
    const cantNum = document.getElementById("cantidadAlimento").value.trim();
    const unidadEl = document.getElementById("unidadAlimento");
    const unidad = unidadEl ? unidadEl.value : "unidades";
    const categoria = document.getElementById("categoriaAlimento").value;

    if (!nombre || !fecha || !cantNum) {
        alert("Por favor completa el nombre, la fecha de vencimiento y la cantidad de tu alimento.");
        return;
    }

    const diasRestantes = calcularDiasRestantes(fecha);

    let emoji = "🥫";
    if (categoria === "Frutas") emoji = "🍎";
    else if (categoria === "Verduras") emoji = "🥬";
    else if (categoria === "Lácteos") emoji = "🥛";
    else if (categoria === "Carnes") emoji = "🍗";
    else if (categoria === "Otros") emoji = "🍞";

    const nuevoAlimento = {
        id: Date.now(),
        nombre: nombre,
        categoria: categoria,
        cantidad: `${cantNum} ${unidad}`,
        fechaVencimiento: fecha,
        diasRestantes: diasRestantes,
        emoji: emoji,
        foto: fotoTemporalSubida,
        esEjemplo: false
    };

    alimentos.unshift(nuevoAlimento);
    guardarAlimentosUsuario();

    const modalEl = document.getElementById("modalAlimento");
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();

    renderizarTodo();
    mostrarAlertaToast(`¡"${nombre}" fue agregado a tu despensa! ✅`, "success");
}

// =========================================================
// MODAL: DETALLE DE ALIMENTO Y CONSUMO
// =========================================================

function abrirDetalleAlimento(id) {
    const item = alimentos.find(a => a.id === id);
    if (!item) return;

    alimentoSeleccionado = item;

    const mediaWrap = document.getElementById("detalleHeroMedia");
    const titulo = document.getElementById("detalleTituloNombre");
    const fecha = document.getElementById("detalleFechaVencimiento");
    const badge = document.getElementById("detalleBadgeDias");
    const cantidad = document.getElementById("detalleCantidad");
    const categoria = document.getElementById("detalleCategoria");

    if (item.foto) {
        mediaWrap.innerHTML = `<img src="${item.foto}" alt="${item.nombre}">`;
    } else {
        mediaWrap.innerHTML = `<span style="font-size:75px;">${item.emoji}</span>`;
    }

    if (titulo) {
        titulo.innerHTML = `${item.emoji} ${item.nombre} ${item.esEjemplo ? '<span class="badge-ejemplo ms-2">Ejemplo</span>' : ''}`;
    }
    if (fecha) fecha.textContent = formatearFechaTexto(item.fechaVencimiento);
    if (badge) {
        badge.textContent = `${item.diasRestantes} días`;
        badge.className = `expiry-badge ${obtenerBadgeClase(item.diasRestantes)}`;
    }
    if (cantidad) cantidad.textContent = item.cantidad;
    if (categoria) categoria.textContent = item.categoria;

    const modal = new bootstrap.Modal(document.getElementById("modalDetalleAlimento"));
    modal.show();
}

function marcarAlimentoConsumido() {
    if (!alimentoSeleccionado) return;

    const itemConsumido = { ...alimentoSeleccionado };
    alimentos = alimentos.filter(a => a.id !== itemConsumido.id);
    guardarAlimentosUsuario();

    // Sumar ahorro y registrar impacto positivo en las estadísticas del usuario
    const valorAhorro = (usuarioConfig.moneda === "USD" || usuarioConfig.moneda === "EUR") ? 1.5 : 4500;
    usuarioStats.dineroAhorrado += valorAhorro;
    usuarioStats.alimentosAprovechados += 1;
    usuarioStats.desperdicioEvitadoKg = +(usuarioStats.desperdicioEvitadoKg + 0.35).toFixed(1);

    // Sumar al día actual de la semana (0=Dom, 1=Lun en JS -> convertimos a 0=Lun .. 6=Dom)
    const diaSemanaJs = new Date().getDay();
    const indiceSemana = diaSemanaJs === 0 ? 6 : diaSemanaJs - 1;
    usuarioStats.historialSemanal[indiceSemana] = (usuarioStats.historialSemanal[indiceSemana] || 0) + 1;

    guardarStatsUsuario();

    const modalEl = document.getElementById("modalDetalleAlimento");
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();

    renderizarTodo();
    mostrarAlertaToast(`✅ ¡Excelente! Has aprovechado "${itemConsumido.nombre}". Sumaste ${formatearDinero(valorAhorro)} a tu ahorro personal.`, "success");
}

function eliminarAlimentoActual() {
    if (!alimentoSeleccionado) return;

    if (confirm(`¡Seguro que deseas eliminar "${alimentoSeleccionado.nombre}" de tu despensa?`)) {
        const nombreEliminado = alimentoSeleccionado.nombre;
        alimentos = alimentos.filter(a => a.id !== alimentoSeleccionado.id);
        guardarAlimentosUsuario();

        const modalEl = document.getElementById("modalDetalleAlimento");
        const modalInst = bootstrap.Modal.getInstance(modalEl);
        if (modalInst) modalInst.hide();

        renderizarTodo();
        mostrarAlertaToast(`"${nombreEliminado}" fue eliminado de tu despensa.`, "info");
    }
}

// =========================================================
// MODAL: VER RECETA
// =========================================================

function verRecetaModal(id) {
    const receta = recetas.find(r => r.id === id);
    if (!receta) return;

    const coincide = tieneIngredientesParaReceta(receta);
    const mensajeCoincidencia = coincide 
        ? "? óGenial! Tienes los ingredientes necesarios en tu despensa para cocinar este plato.\n\n" 
        : "";

    alert(`🍳 ${receta.titulo} (${receta.tiempo})\n\n${mensajeCoincidencia}Ingredientes:\nó ${receta.ingredientes.join('\nó ')}\n\nPreparación:\n${receta.preparacion}`);
}

// =========================================================
// TOAST NOTIFICATIONS FLOTANTES
// =========================================================

function mostrarAlertaToast(mensaje, tipo = "success") {
    let container = document.getElementById("ecoToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "ecoToastContainer";
        container.className = "eco-toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `eco-toast ${tipo === 'success' ? 'success' : 'info'}`;
    toast.innerHTML = `
        <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill text-warning' : 'bi-info-circle-fill text-info'} fs-5"></i>
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastSlideDown 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

// =========================================================
// MANEJADORES DE AUTENTICACIóN FIREBASE
// =========================================================

function abrirModalAuth(tab = 'login') {
    cambiarTabAuth(tab);
    limpiarAlertaAuth();
    
    const loginEmail = document.getElementById("loginEmail");
    const loginPass = document.getElementById("loginPassword");
    const regNombre = document.getElementById("regNombre");
    const regEmail = document.getElementById("regEmail");
    const regPass = document.getElementById("regPassword");
    if (loginEmail) loginEmail.value = "";
    if (loginPass) loginPass.value = "";
    if (regNombre) regNombre.value = "";
    if (regEmail) regEmail.value = "";
    if (regPass) regPass.value = "";

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalAuth"));
    modal.show();
}

function cambiarTabAuth(tab) {
    limpiarAlertaAuth();
    const tabLogin = document.getElementById("tabBtnLogin");
    const tabRegister = document.getElementById("tabBtnRegister");
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    const formRecover = document.getElementById("formRecover");

    if (tab === 'login') {
        if (tabLogin) tabLogin.classList.add("active");
        if (tabRegister) tabRegister.classList.remove("active");
        if (formLogin) formLogin.style.display = "block";
        if (formRegister) formRegister.style.display = "none";
        if (formRecover) formRecover.style.display = "none";
    } else if (tab === 'register') {
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabRegister) tabRegister.classList.add("active");
        if (formLogin) formLogin.style.display = "none";
        if (formRegister) formRegister.style.display = "block";
        if (formRecover) formRecover.style.display = "none";
    }
}

function mostrarRecuperarPass() {
    limpiarAlertaAuth();
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    const formRecover = document.getElementById("formRecover");
    if (formLogin) formLogin.style.display = "none";
    if (formRegister) formRegister.style.display = "none";
    if (formRecover) formRecover.style.display = "block";
}

function togglePasswordVis(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
    }
}

function mostrarAlertaAuth(mensaje, tipo = "error") {
    const alertBox = document.getElementById("authAlert");
    if (!alertBox) return;
    alertBox.textContent = mensaje;
    alertBox.className = `auth-alert-message ${tipo === 'error' ? 'auth-alert-error' : 'auth-alert-success'}`;
    alertBox.style.display = "block";
}

function limpiarAlertaAuth() {
    const alertBox = document.getElementById("authAlert");
    if (alertBox) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
    }
}

async function manejarLoginEmail(e) {
    e.preventDefault();
    limpiarAlertaAuth();

    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;

    const res = await loginConEmail(email, pass);
    if (res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`¡Bienvenid@ de nuevo, ${res.user.displayName || 'Usuario'}! 🌿`, "success");
    } else {
        mostrarAlertaAuth(res.error, "error");
    }
}

async function manejarRegistroEmail(e) {
    e.preventDefault();
    limpiarAlertaAuth();

    const nombre = document.getElementById("regNombre").value;
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPassword").value;

    const res = await registrarConEmail(nombre, email, pass);
    if (res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`¡Cuenta creada con éxito! Bienvenido a EcoFood, ${nombre} 🌿`, "success");
    } else {
        mostrarAlertaAuth(res.error, "error");
    }
}

async function manejarLoginGoogle() {
    limpiarAlertaAuth();
    const res = await loginConGoogle();
    if (res && res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`¡Sesión iniciada con Google! Hola, ${res.user.displayName} 🌿`, "success");
    } else if (res && res.error) {
        mostrarAlertaAuth(res.error, "error");
    }
}

function abrirModalGoogleLogin() {
    renderizarCuentasGoogleGuardadas();
    const modalEl = document.getElementById("modalGoogleLogin");
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function cerrarModalGoogleLogin() {
    const modalEl = document.getElementById("modalGoogleLogin");
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
}

function renderizarCuentasGoogleGuardadas() {
    const contenedor = document.getElementById("contenedorCuentasGoogle");
    const lista = document.getElementById("listaCuentasGoogle");
    if (!contenedor || !lista) return;

    const cuentas = typeof obtenerCuentasGoogle === "function" ? obtenerCuentasGoogle() : [];
    if (cuentas.length === 0) {
        contenedor.style.display = "none";
        lista.innerHTML = "";
        return;
    }

    contenedor.style.display = "block";
    const googleColors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];
    lista.innerHTML = cuentas.map(cta => {
        const inicial = (cta.displayName || cta.email || "G").charAt(0).toUpperCase();
        const color = cta.avatarColor || googleColors[Math.abs(inicial.charCodeAt(0)) % googleColors.length];
        return `
            <button type="button" class="google-account-card" onclick="iniciarConCuentaGoogleGuardada('${cta.email}')">
                <div class="google-account-avatar" style="background:${color};">
                    ${cta.photoURL ? `<img src="${cta.photoURL}" alt="${cta.displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : inicial}
                </div>
                <div class="google-account-info">
                    <div class="google-account-name">${cta.displayName}</div>
                    <div class="google-account-email">${cta.email}</div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
            </button>
        `;
    }).join("");
}

function iniciarConCuentaGoogleGuardada(email) {
    const cuentas = typeof obtenerCuentasGoogle === "function" ? obtenerCuentasGoogle() : [];
    const cta = cuentas.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (cta) {
        currentUser = { ...cta, isGoogle: true, isDemo: true };
        guardarSesionLocal(currentUser);
        actualizarUIConUsuario(currentUser);
        cerrarModalGoogleLogin();
        mostrarAlertaToast(`¡Bienvenid@, ${currentUser.displayName}! Sesión de Google iniciada 🌿`, "success");
    }
}

function manejarAccesoGoogleForm(e) {
    e.preventDefault();
    const nombre = document.getElementById("googleInputNombre").value.trim();
    const email = document.getElementById("googleInputEmail").value.trim().toLowerCase();

    if (!nombre || !email) return;

    const googleColors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];
    const inicial = nombre.charAt(0).toUpperCase();
    const color = googleColors[Math.abs(inicial.charCodeAt(0)) % googleColors.length];

    const nuevoGoogleUser = {
        uid: "google-" + Date.now(),
        displayName: nombre,
        email: email,
        isGoogle: true,
        isDemo: true,
        avatarColor: color,
        photoURL: null
    };

    if (typeof guardarCuentaGoogle === "function") {
        guardarCuentaGoogle(nuevoGoogleUser);
    }
    currentUser = nuevoGoogleUser;
    guardarSesionLocal(currentUser);
    actualizarUIConUsuario(currentUser);

    document.getElementById("googleInputNombre").value = "";
    document.getElementById("googleInputEmail").value = "";

    cerrarModalGoogleLogin();
    mostrarAlertaToast(`¡Sesión iniciada con Google! Bienvenido, ${nombre} 🌿`, "success");
}

async function manejarModoInvitado() {
    limpiarAlertaAuth();
    const res = await loginInvitado();
    if (res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`Has ingresado en Modo Invitado 👋`, "info");
    }
}

async function manejarRecuperarPass(e) {
    e.preventDefault();
    const email = document.getElementById("recoverEmail").value;
    const res = await recuperarContrasena(email);
    if (res.success) {
        mostrarAlertaAuth(res.message, "success");
    } else {
        mostrarAlertaAuth(res.error, "error");
    }
}

function cerrarModalAuth() {
    const modalEl = document.getElementById("modalAuth");
    if (modalEl) {
        const modalInst = bootstrap.Modal.getInstance(modalEl);
        if (modalInst) modalInst.hide();
    }
}

function abrirMenuOPerfil() {
    if (typeof currentUser !== "undefined" && currentUser) {
        mostrar('perfil');
    } else {
        abrirModalAuth('login');
    }
}

async function confirmarCerrarSesion() {
    if (confirm("¡Deseas cerrar tu sesión actual en EcoFood?")) {
        await cerrarSesion();
        window.location.replace("login.html");
    }
}

function guardarConfiguracion() {
    const nuevoNombre = document.getElementById("configNombre").value.trim();
    if (typeof currentUser === "undefined" || !currentUser) {
        mostrarAlertaToast("Inicia sesión para guardar tus preferencias personales.", "info");
        abrirModalAuth('login');
        return;
    }
    if (nuevoNombre) {
        currentUser.displayName = nuevoNombre;
        guardarSesionLocal(currentUser);
        if (typeof guardarUsuarioRegistrado === "function" && currentUser.email) {
            guardarUsuarioRegistrado(currentUser);
        }
        if (typeof guardarCuentaGoogle === "function" && currentUser.isGoogle) {
            guardarCuentaGoogle(currentUser);
        }
        actualizarUIConUsuario(currentUser);
        mostrarAlertaToast("¡Preferencias personales guardadas! ✅", "success");
    }
}

// =========================================================
// UTILIDADES Y BóSQUEDA
// =========================================================

function buscarEnApp(e) {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
        renderizarAlimentos('Todas');
        return;
    }

    const coincidentes = alimentos.filter(a => 
        a.nombre.toLowerCase().includes(q) || 
        a.categoria.toLowerCase().includes(q)
    );

    if (coincidentes.length > 0) {
        mostrar('alimentos');
        const grid = document.getElementById("alimentosGrid");
        if (grid) {
            grid.innerHTML = coincidentes.map(item => `
                <div class="food-card position-relative">
                    ${item.esEjemplo ? `<span class="badge-ejemplo position-absolute top-0 end-0 m-2"><i class="bi bi-lightbulb"></i> Ejemplo</span>` : ''}
                    <div class="food-card-img-wrap">
                        ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
                    </div>
                    <div class="food-card-body">
                        <h3 class="food-card-title">${item.nombre}</h3>
                        <p class="food-card-meta">${item.categoria} ó ${item.cantidad}</p>
                        <div class="food-card-footer mt-auto">
                            <span class="expiry-badge ${obtenerBadgeClase(item.diasRestantes)}">
                                ${item.diasRestantes} días
                            </span>
                            <button class="btn-card-detail" onclick="abrirDetalleAlimento(${item.id})">
                                Ver detalle
                            </button>
                        </div>
                    </div>
                </div>
            `).join("");
        }
    }
}

function formatearFechaTexto(fechaStr) {
    if (!fechaStr) return "Próximamente";
    try {
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const partes = fechaStr.split("-");
        if (partes.length === 3) {
            const anio = partes[0];
            const mes = meses[parseInt(partes[1], 10) - 1];
            const dia = parseInt(partes[2], 10);
            return `${dia} ${mes} ${anio}`;
        }
    } catch(e) {}
    return fechaStr;
}
