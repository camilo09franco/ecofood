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
// SISTEMA DE SESIÓN LOCAL (DEMO / PERSISTENCIA)
// =========================================================

const DEMO_STORAGE_KEY = "ecofood_user_session";

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
    // Usuario demo por defecto (Sara de la maqueta)
    return {
        uid: "demo-user-sara-123",
        displayName: "Sara",
        email: "sara@ecofood.com",
        photoURL: null,
        isAnonymous: false,
        isDemo: true
    };
}

// Guardar sesión local
function guardarSesionLocal(user) {
    if (user) {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(DEMO_STORAGE_KEY);
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
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // Simulación en modo Demo
        await simularRetardo(600);
        const nombreExtraido = email.split("@")[0];
        const nombreFormateado = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);
        currentUser = {
            uid: "demo-" + Date.now(),
            displayName: nombreFormateado,
            email: email,
            photoURL: null,
            isDemo: true
        };
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
            // Actualizar nombre de visualización
            await user.updateProfile({
                displayName: nombre
            });
            currentUser = user;
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // Simulación en modo Demo
        await simularRetardo(600);
        currentUser = {
            uid: "demo-" + Date.now(),
            displayName: nombre.trim() || "Usuario",
            email: email,
            photoURL: null,
            isDemo: true
        };
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
            actualizarUIConUsuario(currentUser);
            return { success: true, user: currentUser };
        } catch (error) {
            return { success: false, error: traducirErrorFirebase(error.code) };
        }
    } else {
        // Simulación en modo Demo
        await simularRetardo(500);
        currentUser = {
            uid: "demo-google-" + Date.now(),
            displayName: "Sara García",
            email: "sara.garcia@gmail.com",
            photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
            isDemo: true
        };
        guardarSesionLocal(currentUser);
        actualizarUIConUsuario(currentUser);
        return { success: true, user: currentUser, isDemo: true };
    }
}

/**
 * Iniciar sesión como Invitado / Demo
 */
async function loginInvitado() {
    await simularRetardo(400);
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
        await simularRetardo(500);
        return { 
            success: true, 
            message: `(Simulación Demo) Se ha enviado el enlace de recuperación a: ${email}` 
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

// Actualiza todos los elementos de la interfaz con los datos del usuario
function actualizarUIConUsuario(user) {
    const nombreElemento = document.getElementById("headerNombreUsuario");
    const saludoElemento = document.getElementById("saludoPrincipal");
    const emailElemento = document.getElementById("perfilEmail");
    const inputNombreConfig = document.getElementById("configNombre");
    const inputEmailConfig = document.getElementById("configEmail");
    const avatarHeader = document.getElementById("headerAvatar");
    const avatarPerfil = document.getElementById("perfilAvatar");
    const btnAuthEstado = document.getElementById("btnAuthEstado");

    if (user) {
        const nombre = user.displayName || (user.email ? user.email.split("@")[0] : "Sara");
        const inicial = nombre.charAt(0).toUpperCase();

        if (nombreElemento) nombreElemento.textContent = `Hola, ${nombre}`;
        if (saludoElemento) saludoElemento.innerHTML = `¡Hola, ${nombre}! 🌿`;
        if (emailElemento) emailElemento.textContent = user.email || "sara@ecofood.com";
        if (inputNombreConfig) inputNombreConfig.value = nombre;
        if (inputEmailConfig) inputEmailConfig.value = user.email || "";

        // Avatar con imagen o inicial
        [avatarHeader, avatarPerfil].forEach(el => {
            if (el) {
                if (user.photoURL) {
                    el.innerHTML = `<img src="${user.photoURL}" alt="${nombre}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else {
                    el.innerHTML = `<span>${inicial}</span>`;
                }
            }
        });

        if (btnAuthEstado) {
            btnAuthEstado.innerHTML = `<i class="bi bi-box-arrow-right"></i> Cerrar sesión`;
            btnAuthEstado.onclick = () => confirmarCerrarSesion();
        }
    } else {
        if (nombreElemento) nombreElemento.textContent = "Iniciar sesión";
        if (saludoElemento) saludoElemento.innerHTML = "¡Bienvenid@! 🌿";
        if (emailElemento) emailElemento.textContent = "Inicia sesión para sincronizar tus alimentos";
        
        [avatarHeader, avatarPerfil].forEach(el => {
            if (el) el.innerHTML = `<i class="bi bi-person"></i>`;
        });

        if (btnAuthEstado) {
            btnAuthEstado.innerHTML = `<i class="bi bi-box-arrow-in-right"></i> Iniciar sesión`;
            btnAuthEstado.onclick = () => abrirModalAuth("login");
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    inicializarAuthListener();
});
