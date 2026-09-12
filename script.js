// =========================================================
// ECOFOOD - LÓGICA DE APLICACIÓN E INTERACTIVIDAD
// =========================================================

// DATOS INICIALES DE ALIMENTOS (COINCIDENTES CON EL DISEÑO DE LA IMAGEN)
let alimentos = [
    {
        id: 1,
        nombre: "Leche",
        categoria: "Lácteos",
        cantidad: "1 litro",
        fechaVencimiento: "2026-09-15",
        diasRestantes: 2,
        emoji: "🥛",
        foto: null
    }
];

// RECETAS RECOMENDADAS (COINCIDENTES CON LA IMAGEN)
const recetas = [
    {
        id: 1,
        titulo: "Tortilla de verduras",
        subtitulo: "Con lo que tienes en casa",
        tiempo: "20 min",
        categoria: "Desayunos",
        emoji: "🍳",
        foto: "https://images.unsplash.com/photo-1584947897667-8898b671a5c6?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["2 huevos", "1/2 zanahoria rallada", "Espinacas o lechuga picada", "1 tomate en cubitos", "Sal y pimienta"],
        preparacion: "Bate los huevos con sal y pimienta. Saltea las verduras 3 minutos en sartén con un poco de aceite de oliva. Vierte los huevos batidos y cocina a fuego medio 3 minutos por lado hasta dorar."
    },
    {
        id: 2,
        titulo: "Batido de frutas",
        subtitulo: "Aprovecha frutas maduras",
        tiempo: "10 min",
        categoria: "Desayunos",
        emoji: "🍓",
        foto: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["1 taza de fresas maduras", "1 vaso de leche o yogur", "1 cucharada de miel", "Hielo al gusto"],
        preparacion: "Lava bien las fresas, colócalas en la licuadora con la leche o yogur y la miel. Licúa por 1 minuto hasta obtener una mezcla suave y cremosa."
    },
    {
        id: 3,
        titulo: "Ensalada fresca",
        subtitulo: "Rápida y nutritiva",
        tiempo: "10 min",
        categoria: "Almuerzos",
        emoji: "🥗",
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["Lechuga fresca troceada", "2 tomates en rodajas", "Queso en cubos", "Aceite de oliva y limón"],
        preparacion: "Mezcla la lechuga con los tomates y el queso. Adereza con aceite de oliva, jugo de limón, sal y una pizca de orégano."
    },
    {
        id: 4,
        titulo: "Salteado de verduras",
        subtitulo: "Fácil y lleno de sabor",
        tiempo: "25 min",
        categoria: "Cenas",
        emoji: "🥘",
        foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80",
        ingredientes: ["Zanahorias en bastones", "Pechuga de pollo en tiras", "Cebolla", "Salsa de soja"],
        preparacion: "Saltea el pollo en un wok bien caliente con aceite. Agrega las verduras cortadas y saltea por 6 minutos a fuego vivo con un toque de salsa de soja."
    }
];

// RECORDATORIOS
let recordatorios = [
    { id: 1, emoji: "🥛", texto: "Leche próxima a vencer", tiempo: "Recordatorio para hoy", completado: false },
    { id: 2, emoji: "🍓", texto: "Fresas próximas a vencer", tiempo: "Recordatorio para mañana", completado: false },
    { id: 3, emoji: "🥬", texto: "Revisar verduras de la gaveta", tiempo: "En 3 días", completado: false }
];

let alimentoSeleccionado = null;
let fotoTemporalSubida = null;

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
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
    actualizarContadores();
}

// =========================================================
// CONTROL DE NAVEGACIÓN Y PANTALLAS (RESPONSIVE)
// =========================================================

function mostrar(nombreSeccion) {
    // 1. Ocultar todas las vistas
    const vistas = document.querySelectorAll(".app-view");
    vistas.forEach(v => v.classList.remove("active-view"));

    // 2. Mostrar la vista seleccionada
    const vistaActiva = document.getElementById(nombreSeccion);
    if (vistaActiva) {
        vistaActiva.classList.add("active-view");
    }

    // 3. Actualizar botones del Sidebar (Desktop)
    const sidebarBtns = document.querySelectorAll(".sidebar-btn");
    sidebarBtns.forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(`'${nombreSeccion}'`)) {
            btn.classList.add("active");
        }
    });

    // 4. Actualizar botones del Bottom Nav (Móvil)
    const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
    bottomNavItems.forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(`'${nombreSeccion}'`)) {
            item.classList.add("active");
        }
    });

    // Subir scroll suavemente al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// RENDERIZADO DE DATOS
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
}

function obtenerBadgeClase(dias) {
    if (dias <= 2) return "badge-red";
    if (dias <= 4) return "badge-orange";
    return "badge-green";
}

// Renderiza lista de próximos a vencer en el Dashboard
function renderizarExpiringInicio() {
    const contenedor = document.getElementById("listaExpiringInicio");
    if (!contenedor) return;

    const ordenados = [...alimentos].sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 4);

    contenedor.innerHTML = ordenados.map(item => `
        <div class="expiring-item" onclick="abrirDetalleAlimento(${item.id})">
            <div class="expiring-item-icon">
                ${item.emoji}
            </div>
            <div class="expiring-item-content">
                <strong>${item.nombre}</strong>
                <span>${formatearFechaTexto(item.fechaVencimiento)}</span>
            </div>
            <span class="expiry-badge ${obtenerBadgeClase(item.diasRestantes)}">
                ${item.diasRestantes} días
            </span>
        </div>
    `).join("");
}

// Renderiza la lista completa de alimentos con filtro
function renderizarAlimentos(categoriaFiltro = 'Todas') {
    const contenedor = document.getElementById("alimentosGrid");
    if (!contenedor) return;

    const filtrados = categoriaFiltro === 'Todas' 
        ? alimentos 
        : alimentos.filter(a => a.categoria === categoriaFiltro);

    if (filtrados.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="fs-1 mb-2">🌱</div>
                <h5 class="fw-bold">No hay alimentos en esta categoría</h5>
                <p class="text-muted small">Agrega tus productos presionando el botón superior.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = filtrados.map(item => `
        <div class="food-card">
            <div class="food-card-img-wrap">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
            </div>
            <div class="food-card-body">
                <h3 class="food-card-title">${item.nombre}</h3>
                <p class="food-card-meta">${item.categoria} · ${item.cantidad}</p>
                <div class="food-card-footer">
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

// Renderiza los que están próximos a vencer
function renderizarVencer() {
    const contenedor = document.getElementById("vencerCardsGrid");
    if (!contenedor) return;

    const ordenados = [...alimentos].sort((a, b) => a.diasRestantes - b.diasRestantes);

    contenedor.innerHTML = ordenados.map(item => `
        <div class="food-card">
            <div class="food-card-img-wrap">
                ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
            </div>
            <div class="food-card-body">
                <h3 class="food-card-title">${item.nombre}</h3>
                <p class="food-card-meta">${item.categoria} · Vence: ${formatearFechaTexto(item.fechaVencimiento)}</p>
                <div class="food-card-footer">
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

function renderizarResumenDashboard() {
    actualizarContadores();
}

function renderizarRecetasInicio() {
    const contenedor = document.getElementById("recetasInicioGrid");
    if (!contenedor) return;

    contenedor.innerHTML = recetas.slice(0, 2).map(r => `
        <div class="recipe-card" onclick="verRecetaModal(${r.id})">
            <div class="recipe-card-media">
                ${r.foto ? `<img src="${r.foto}" alt="${r.titulo}">` : `<span>${r.emoji}</span>`}
                <span class="recipe-badge-time">⏱ ${r.tiempo}</span>
            </div>
            <div class="recipe-card-info">
                <h4>${r.titulo}</h4>
                <p>${r.subtitulo}</p>
            </div>
        </div>
    `).join("");
}

function renderizarRecetasCompletas(categoria = 'Todas') {
    const contenedor = document.getElementById("recetasCompletasGrid");
    if (!contenedor) return;

    const filtradas = categoria === 'Todas' ? recetas : recetas.filter(r => r.categoria === categoria);

    contenedor.innerHTML = filtradas.map(r => `
        <div class="recipe-card" onclick="verRecetaModal(${r.id})">
            <div class="recipe-card-media">
                ${r.foto ? `<img src="${r.foto}" alt="${r.titulo}">` : `<span>${r.emoji}</span>`}
                <span class="recipe-badge-time">⏱ ${r.tiempo}</span>
            </div>
            <div class="recipe-card-info">
                <h4>${r.titulo}</h4>
                <p>${r.subtitulo}</p>
            </div>
        </div>
    `).join("");
}

function renderizarRecordatorios() {
    const contenedor = document.getElementById("listaRecordatorios");
    if (!contenedor) return;

    contenedor.innerHTML = recordatorios.map(rec => `
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white shadow-sm">
            <div class="d-flex align-items-center gap-3">
                <span class="fs-3">${rec.emoji}</span>
                <div>
                    <strong class="d-block text-dark ${rec.completado ? 'text-decoration-line-through text-muted' : ''}">${rec.texto}</strong>
                    <small class="text-muted">${rec.tiempo}</small>
                </div>
            </div>
            <button class="btn btn-sm ${rec.completado ? 'btn-success' : 'btn-outline-success'} rounded-circle" style="width:36px;height:36px;" onclick="toggleRecordatorio(${rec.id})">
                <i class="bi bi-check-lg"></i>
            </button>
        </div>
    `).join("");
}

function toggleRecordatorio(id) {
    const rec = recordatorios.find(r => r.id === id);
    if (rec) {
        rec.completado = !rec.completado;
        renderizarRecordatorios();
    }
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
    const cantidad = document.getElementById("cantidadAlimento").value.trim();
    const categoria = document.getElementById("categoriaAlimento").value;

    if (!nombre || !fecha || !cantidad) {
        alert("Por favor completa todos los campos para registrar tu alimento.");
        return;
    }

    // Calcular días restantes a partir de la fecha seleccionada
    const hoy = new Date();
    const fechaVenc = new Date(fecha + "T00:00:00");
    const diffTime = fechaVenc - hoy;
    let diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diasRestantes < 1) diasRestantes = 1;

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
        cantidad: cantidad,
        fechaVencimiento: fecha,
        diasRestantes: diasRestantes,
        emoji: emoji,
        foto: fotoTemporalSubida
    };

    alimentos.unshift(nuevoAlimento);

    // Cerrar modal
    const modalEl = document.getElementById("modalAlimento");
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();

    renderizarTodo();
}

// =========================================================
// MODAL: DETALLE DE ALIMENTO (ESTILO MAQUETA)
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

    if (titulo) titulo.textContent = `${item.emoji} ${item.nombre}`;
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

    // Eliminar de alimentos activos
    alimentos = alimentos.filter(a => a.id !== alimentoSeleccionado.id);

    const modalEl = document.getElementById("modalDetalleAlimento");
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();

    renderizarTodo();
    alert(`🎉 ¡Excelente! Has aprovechado "${alimentoSeleccionado.nombre}" y evitado el desperdicio. ¡Sumaste $4.500 a tu ahorro!`);
}

function eliminarAlimentoActual() {
    if (!alimentoSeleccionado) return;

    if (confirm(`¿Seguro que deseas eliminar "${alimentoSeleccionado.nombre}" de tu despensa?`)) {
        alimentos = alimentos.filter(a => a.id !== alimentoSeleccionado.id);
        const modalEl = document.getElementById("modalDetalleAlimento");
        const modalInst = bootstrap.Modal.getInstance(modalEl);
        if (modalInst) modalInst.hide();
        renderizarTodo();
    }
}

// =========================================================
// MODAL: VER RECETA
// =========================================================

function verRecetaModal(id) {
    const receta = recetas.find(r => r.id === id);
    if (!receta) return;

    alert(`📖 ${receta.titulo} (${receta.tiempo})\n\nIngredientes:\n• ${receta.ingredientes.join('\n• ')}\n\nPreparación:\n${receta.preparacion}`);
}

// =========================================================
// MANEJADORES DE AUTENTICACIÓN FIREBASE
// =========================================================

function abrirModalAuth(tab = 'login') {
    cambiarTabAuth(tab);
    limpiarAlertaAuth();
    
    // Limpiar campos de texto para evitar credenciales residuales
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
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formLogin.style.display = "block";
        formRegister.style.display = "none";
        formRecover.style.display = "none";
    } else if (tab === 'register') {
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
        formLogin.style.display = "none";
        formRegister.style.display = "block";
        formRecover.style.display = "none";
    }
}

function mostrarRecuperarPass() {
    limpiarAlertaAuth();
    document.getElementById("formLogin").style.display = "none";
    document.getElementById("formRegister").style.display = "none";
    document.getElementById("formRecover").style.display = "block";
}

function togglePasswordVis(inputId, icon) {
    const input = document.getElementById(inputId);
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
        mostrarAlertaToast(`¡Bienvenid@ de nuevo, ${res.user.displayName || 'Usuario'}! 🌱`);
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
        mostrarAlertaToast(`¡Cuenta creada con éxito! Bienvenido a EcoFood, ${nombre} 🌿`);
    } else {
        mostrarAlertaAuth(res.error, "error");
    }
}

async function manejarLoginGoogle() {
    limpiarAlertaAuth();
    const res = await loginConGoogle();
    if (res && res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`¡Sesión iniciada con Google! Hola, ${res.user.displayName} 🌿`);
    } else if (res && res.error) {
        mostrarAlertaAuth(res.error, "error");
    }
}

// ---------------------------------------------------------
// GESTIÓN DEL SELECTOR DE GOOGLE PERSONALIZADO
// ---------------------------------------------------------

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
        mostrarAlertaToast(`¡Bienvenid@, ${currentUser.displayName}! Sesión de Google iniciada 🌿`);
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

    // Limpiar campos
    document.getElementById("googleInputNombre").value = "";
    document.getElementById("googleInputEmail").value = "";

    cerrarModalGoogleLogin();
    mostrarAlertaToast(`¡Sesión iniciada con tu cuenta de Google! Bienvenido, ${nombre} 🌿`);
}

async function manejarModoInvitado() {
    limpiarAlertaAuth();
    const res = await loginInvitado();
    if (res.success) {
        cerrarModalAuth();
        mostrarAlertaToast(`Has ingresado en Modo Invitado 🌱`);
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
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();
}

function abrirMenuOPerfil() {
    if (currentUser) {
        mostrar('perfil');
    } else {
        abrirModalAuth('login');
    }
}

async function confirmarCerrarSesion() {
    if (confirm("¿Deseas cerrar tu sesión actual en EcoFood?")) {
        await cerrarSesion();
        window.location.replace("login.html");
    }
}

function guardarConfiguracion() {
    const nuevoNombre = document.getElementById("configNombre").value.trim();
    if (!currentUser) {
        mostrarAlertaToast("Inicia sesión para guardar tus preferencias.");
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
        mostrarAlertaToast("¡Preferencias guardadas correctamente! 💚");
    }
}

// =========================================================
// UTILIDADES & BÚSQUEDA
// =========================================================

function buscarEnApp(e) {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
        renderizarAlimentos('Todas');
        return;
    }

    // Filtrar alimentos en tiempo real
    const coincidentes = alimentos.filter(a => 
        a.nombre.toLowerCase().includes(q) || 
        a.categoria.toLowerCase().includes(q)
    );

    if (coincidentes.length > 0) {
        mostrar('alimentos');
        const grid = document.getElementById("alimentosGrid");
        grid.innerHTML = coincidentes.map(item => `
            <div class="food-card">
                <div class="food-card-img-wrap">
                    ${item.foto ? `<img src="${item.foto}" alt="${item.nombre}">` : `<span>${item.emoji}</span>`}
                </div>
                <div class="food-card-body">
                    <h3 class="food-card-title">${item.nombre}</h3>
                    <p class="food-card-meta">${item.categoria} · ${item.cantidad}</p>
                    <div class="food-card-footer">
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

function mostrarAlertaToast(mensaje) {
    console.log(mensaje);
}