// =========================================================
// ECOFOOD - CONFIGURACIÓN E INTEGRACIÓN DE FIREBASE AUTH
// =========================================================

/**
 * INSTRUCCIONES PARA CONECTAR TU PROYECTO DE FIREBASE:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un proyecto nuevo (o usa uno existente) llamado "EcoFood".
 * 3. En la sección "Compilación" -> "Authentication", activa:
 *    - Correo electrónico / Contraseña
 *    - Google (Opcional)
 * 4. Ve a la Configuración del proyecto (icono de engranaje) -> Tus apps -> Web (</>).
 * 5. Copia los valores de tu 'firebaseConfig' y pégalos a continuación reemplazando los valores de ejemplo.
 */

const firebaseConfig = {
    apiKey: "AIzaSyYOUR_API_KEY_HERE_ECOFOOD",
    authDomain: "ecofood-app.firebaseapp.com",
    projectId: "ecofood-app",
    storageBucket: "ecofood-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Variable para verificar si Firebase está inicializado con credenciales reales
let isFirebaseReady = false;
let auth = null;
let googleProvider = null;

// Usuario activo en la sesión (Firebase o Modo Demo)
let currentUser = null;

// Inicialización de Firebase
try {
    if (typeof firebase !== "undefined" && firebase.initializeApp) {
        // Verificar si las credenciales fueron reemplazadas
        if (!firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            googleProvider = new firebase.auth.GoogleAuthProvider();
            isFirebaseReady = true;
            console.log("🌲 Firebase Auth inicializado con éxito.");
        } else {
            console.warn("🌱 Firebase: Usando modo de demostración local (configura tus claves en firebase-config.js cuando desees).");
        }
    }
} catch (error) {
    console.error("Error al inicializar Firebase:", error);
}

// =========================================================
// SISTEMA DE SESIÓN LOCAL & REGISTRO MULTIUSUARIO
// =========================================================

const DEMO_STORAGE_KEY = "ecofood_user_session";
const REGISTERED_USERS_KEY = "ecofood_registered_users";
const GOOGLE_ACCOUNTS_KEY = "ecofood_google_accounts";

// Cargar usuario guardado previamente en demo
function cargarSesionLocal() {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error leyendo sesión local:", e);
    }
    // Si no hay sesión iniciada, devolvemos null para que la app no imponga ningún nombre por defecto
    return null;
}

// Guardar sesión local
function guardarSesionLocal(user) {
    if (user) {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(DEMO_STORAGE_KEY);
    }
}

// Gestión de base de datos local de usuarios registrados
function obtenerUsuariosRegistrados() {
    try {
        const raw = localStorage.getItem(REGISTERED_USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function guardarUsuarioRegistrado(user) {
    try {
        const usuarios = obtenerUsuariosRegistrados();
        const index = usuarios.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (index >= 0) {
            usuarios[index] = { ...usuarios[index], ...user };
        } else {
            usuarios.push(user);
        }
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(usuarios));
    } catch (e) {
        console.error("Error guardando usuario registrado:", e);
    }
}

// Gestión de cuentas Google usadas localmente
function obtenerCuentasGoogle() {
    try {
        const raw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function guardarCuentaGoogle(account) {
    try {
        const cuentas = obtenerCuentasGoogle();
        const index = cuentas.findIndex(c => c.email.toLowerCase() === account.email.toLowerCase());
        if (index >= 0) {
            cuentas[index] = { ...cuentas[index], ...account };
        } else {
            cuentas.unshift(account);
        }
        localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(cuentas));
    } catch (e) {
        console.error("Error guardando cuenta Google:", e);
    }
}

// =========================================================
// FUNCIONES DE AUTENTICACIÓN
// =========================================================

/**
 * Iniciar sesión con Correo y Contraseña
 */
async function loginConEmail(email, password) {
    if (isFirebaseReady && auth) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            currentUser = userCredential.user;
            guardarSesionLocal(currentUser);
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // Modo Demo / Local
        await simularRetardo(400);
        const emailLimpio = email.trim().toLowerCase();
        const usuarios = obtenerUsuariosRegistrados();
        const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === emailLimpio);

        if (usuarioExistente) {
            if (usuarioExistente.password && usuarioExistente.password !== password) {
                return { success: false, error: "La contraseña ingresada no coincide con este usuario." };
            }
            currentUser = { ...usuarioExistente };
        } else {
            // Autocreación de perfil personalizado según el correo ingresado
            const parteNombre = emailLimpio.split("@")[0];
            const nombreFormateado = parteNombre.charAt(0).toUpperCase() + parteNombre.slice(1);
            currentUser = {
                uid: "user-" + Date.now(),
                displayName: nombreFormateado,
                email: emailLimpio,
                password: password,
                photoURL: null,
                isDemo: true
            };
            guardarUsuarioRegistrado(currentUser);
        }

        guardarSesionLocal(currentUser);
        actualizarUIConUsuario(currentUser);
        return { success: true, user: currentUser, isDemo: true };
    }
}

/**
 * Registro de nuevo usuario con Nombre, Correo y Contraseña
 */
async function registrarConEmail(nombre, email, password) {
    if (isFirebaseReady && auth) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await user.updateProfile({
                displayName: nombre
            });
            currentUser = user;
            guardarSesionLocal(currentUser);
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // Modo Demo / Local
        await simularRetardo(400);
        const emailLimpio = email.trim().toLowerCase();
        const usuarios = obtenerUsuariosRegistrados();
        const yaExiste = usuarios.find(u => u.email.toLowerCase() === emailLimpio);

        if (yaExiste) {
            return { success: false, error: "Este correo electrónico ya está registrado. Inicia sesión con tus credenciales." };
        }

        currentUser = {
            uid: "user-" + Date.now(),
            displayName: nombre.trim() || "Usuario",
            email: emailLimpio,
            password: password,
            photoURL: null,
            isDemo: true
        };

        guardarUsuarioRegistrado(currentUser);
        guardarSesionLocal(currentUser);
        actualizarUIConUsuario(currentUser);
        return { success: true, user: currentUser, isDemo: true };
    }
}

/**
 * Iniciar sesión con Google
 */
async function loginConGoogle() {
    if (isFirebaseReady && auth && googleProvider) {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            currentUser = result.user;
            currentUser.isGoogle = true;
            guardarSesionLocal(currentUser);
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // En modo local sin Firebase conectado:
        // Abre el selector de cuenta de Google personalizable
        cerrarModalAuth();
        abrirModalGoogleLogin();
        return { success: false, isCustomGoogle: true };
    }
}

/**
 * Iniciar sesión como Invitado / Demo
 */
async function loginInvitado() {
    await simularRetardo(300);
    currentUser = {
        uid: "invitado-" + Date.now(),
        displayName: "Invitad@",
        email: "invitado@ecofood.com",
        photoURL: null,
        isGuest: true,
        isDemo: true
    };
    guardarSesionLocal(currentUser);
    actualizarUIConUsuario(currentUser);
    return { success: true, user: currentUser };
}

/**
 * Recuperar contraseña (envío de email)
 */
async function recuperarContrasena(email) {
    if (isFirebaseReady && auth) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: "Te hemos enviado un correo para restablecer tu contraseña." };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        await simularRetardo(400);
        return { 
            success: true, 
            message: `(Demostración) Se ha enviado el enlace de recuperación a: ${email}` 
        };
    }
}

/**
 * Cerrar sesión
 */
async function cerrarSesion() {
    if (isFirebaseReady && auth) {
        try {
            await auth.signOut();
        } catch (e) {
            console.error("Error al cerrar sesión:", e);
        }
    }
    currentUser = null;
    guardarSesionLocal(null);
    actualizarUIConUsuario(null);
    return { success: true };
}

/**
 * Listener global del estado de autenticación
 */
function inicializarAuthListener() {
    if (isFirebaseReady && auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                actualizarUIConUsuario(user);
            } else {
                currentUser = null;
                actualizarUIConUsuario(null);
            }
        });
    } else {
        // Cargar usuario guardado en localStorage para demo
        const sesionGuardada = cargarSesionLocal();
        currentUser = sesionGuardada;
        actualizarUIConUsuario(currentUser);
    }
}

// =========================================================
// FUNCIONES AUXILIARES Y ACTUALIZACIÓN DE UI
// =========================================================

function simularRetardo(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function traducirErrorFirebase(codigo) {
    switch (codigo) {
        case "auth/user-not-found":
            return "No existe ninguna cuenta registrada con este correo.";
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "La contraseña ingresada es incorrecta.";
        case "auth/email-already-in-use":
            return "Este correo electrónico ya está registrado.";
        case "auth/invalid-email":
            return "El formato del correo electrónico no es válido.";
        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";
        case "auth/popup-closed-by-user":
            return "La ventana de inicio de sesión de Google fue cerrada.";
        default:
            return "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.";
    }
}

// Actualiza todos los elementos de la interfaz con los datos del usuario activo
function actualizarUIConUsuario(user) {
    const nombreElemento = document.getElementById("headerNombreUsuario");
    const saludoElemento = document.getElementById("saludoPrincipal");
    const nombrePerfil = document.getElementById("perfilNombre");
    const emailElemento = document.getElementById("perfilEmail");
    const inputNombreConfig = document.getElementById("configNombre");
    const inputEmailConfig = document.getElementById("configEmail");
    const avatarHeader = document.getElementById("headerAvatar");
    const avatarPerfil = document.getElementById("perfilAvatar");
    const btnAuthEstado = document.getElementById("btnAuthEstado");
    const perfilEstadoBadge = document.getElementById("perfilEstadoBadge");

    if (user) {
        const nombre = user.displayName || (user.email ? user.email.split("@")[0] : "Usuario");
        const inicial = nombre.charAt(0).toUpperCase();

        if (nombreElemento) nombreElemento.textContent = `Hola, ${nombre}`;
        if (saludoElemento) saludoElemento.innerHTML = `¡Hola, ${nombre}! 🌿`;
        if (nombrePerfil) nombrePerfil.textContent = nombre;
        if (emailElemento) emailElemento.textContent = user.email || "";
        if (inputNombreConfig) inputNombreConfig.value = nombre;
        if (inputEmailConfig) inputEmailConfig.value = user.email || "";

        if (perfilEstadoBadge) {
            if (user.isGoogle) {
                perfilEstadoBadge.className = "badge bg-primary-subtle text-primary border border-primary-subtle mt-2";
                perfilEstadoBadge.innerHTML = `<i class="bi bi-google"></i> Cuenta de Google Activa`;
            } else {
                perfilEstadoBadge.className = "badge bg-success-subtle text-success border border-success-subtle mt-2";
                perfilEstadoBadge.innerHTML = `<i class="bi bi-shield-check"></i> Cuenta Activa`;
            }
        }

        // Avatar con imagen o inicial
        [avatarHeader, avatarPerfil].forEach(el => {
            if (el) {
                if (user.photoURL) {
                    el.innerHTML = `<img src="${user.photoURL}" alt="${nombre}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else {
                    const googleColors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#10B981", "#6366F1"];
                    const color = user.avatarColor || googleColors[Math.abs(inicial.charCodeAt(0)) % googleColors.length];
                    el.innerHTML = `<span style="background:${color};color:white;width:100%;height:100%;display:grid;place-items:center;font-weight:700;border-radius:50%;">${inicial}</span>`;
                }
            }
        });

        if (btnAuthEstado) {
            btnAuthEstado.className = "btn btn-outline-danger px-4 rounded-3 fw-bold";
            btnAuthEstado.innerHTML = `<i class="bi bi-box-arrow-right"></i> Cerrar sesión`;
            btnAuthEstado.onclick = () => confirmarCerrarSesion();
        }
    } else {
        if (nombreElemento) nombreElemento.textContent = "Iniciar sesión";
        if (saludoElemento) saludoElemento.innerHTML = "¡Bienvenid@ a EcoFood! 🌿";
        if (nombrePerfil) nombrePerfil.textContent = "Sin sesión activa";
        if (emailElemento) emailElemento.textContent = "Inicia sesión para sincronizar tus alimentos";
        if (inputNombreConfig) inputNombreConfig.value = "";
        if (inputEmailConfig) inputEmailConfig.value = "";

        if (perfilEstadoBadge) {
            perfilEstadoBadge.className = "badge bg-secondary-subtle text-secondary border border-secondary-subtle mt-2";
            perfilEstadoBadge.innerHTML = `<i class="bi bi-person-x"></i> Sin sesión activa`;
        }

        [avatarHeader, avatarPerfil].forEach(el => {
            if (el) el.innerHTML = `<i class="bi bi-person"></i>`;
        });

        if (btnAuthEstado) {
            btnAuthEstado.className = "btn btn-eco-primary px-4 rounded-3 fw-bold";
            btnAuthEstado.innerHTML = `<i class="bi bi-box-arrow-in-right"></i> Iniciar sesión`;
            btnAuthEstado.onclick = () => abrirModalAuth("login");
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    inicializarAuthListener();
});
