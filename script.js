// ===============================
// CAMBIAR ENTRE PANTALLAS
// ===============================

function mostrar(nombre) {

    // Ocultar todas las secciones
    const secciones = document.querySelectorAll(".seccion");

    secciones.forEach(function(seccion) {
        seccion.classList.remove("activa");
    });


    // Mostrar la sección seleccionada
    const seleccionada = document.getElementById(nombre);

    if (seleccionada) {
        seleccionada.classList.add("activa");
    }


    // Cambiar botón activo
    const botones = document.querySelectorAll(".menu-btn");

    botones.forEach(function(boton) {
        boton.classList.remove("activo");
    });


    // Buscar botón correspondiente
    botones.forEach(function(boton) {

        if (boton.getAttribute("onclick") === `mostrar('${nombre}')`) {
            boton.classList.add("activo");
        }

    });

    window.scrollTo(0, 0);
}



// ===============================
// ABRIR MODAL
// ===============================

function abrirModal() {

    const modal = new bootstrap.Modal(
        document.getElementById("modalAlimento")
    );

    modal.show();
}



// ===============================
// AGREGAR ALIMENTO
// ===============================

function agregarAlimento() {

    const nombre =
        document.getElementById("nombreAlimento").value;

    const fecha =
        document.getElementById("fecha").value;

    const cantidad =
        document.getElementById("cantidad").value;

    const categoria =
        document.getElementById("categoria").value;


    // Validar campos
    if (
        nombre === "" ||
        fecha === "" ||
        cantidad === ""
    ) {

        alert("Por favor completa todos los campos.");

        return;
    }


    // Crear producto
    const lista =
        document.querySelector(".lista-alimentos");


    const producto =
        document.createElement("div");

    producto.classList.add("producto");


    // Emoji según categoría
    let emoji = "🥫";

    if (categoria === "Frutas") {
        emoji = "🍎";
    }

    if (categoria === "Verduras") {
        emoji = "🥬";
    }

    if (categoria === "Lácteos") {
        emoji = "🥛";
    }

    if (categoria === "Carnes") {
        emoji = "🍗";
    }


    producto.innerHTML = `

        <div class="producto-imagen">
            ${emoji}
        </div>

        <h3>${nombre}</h3>

        <p>
            ${categoria} · ${cantidad}
        </p>

        <span class="dias amarillo">
            Registrado
        </span>

        <button
            onclick="verDetalle(
                '${nombre}',
                '${emoji}',
                '${categoria} · ${cantidad}'
            )"
        >
            Ver detalle
        </button>

    `;


    lista.prepend(producto);


    // Cerrar modal
    const modal =
        bootstrap.Modal.getInstance(
            document.getElementById("modalAlimento")
        );

    modal.hide();


    // Limpiar formulario
    document.getElementById("nombreAlimento").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("cantidad").value = "";


    // Mensaje
    alert("¡Alimento agregado correctamente! 🌱");
}



// ===============================
// VER DETALLE
// ===============================

function verDetalle(nombre, emoji, informacion) {

    document.getElementById("detalleNombre")
        .textContent = nombre;

    document.getElementById("detalleEmoji")
        .textContent = emoji;

    document.getElementById("detalleInfo")
        .textContent = informacion;


    const modal =
        new bootstrap.Modal(
            document.getElementById("modalDetalle")
        );

    modal.show();
}



// ===============================
// RECORDATORIOS
// ===============================

function completar(boton) {

    boton.style.background = "#709c20";

    boton.style.color = "white";

    boton.innerHTML = "✓";

    alert("Recordatorio completado.");
}



// ===============================
// CONFIGURACIÓN
// ===============================

function guardar() {

    alert("¡Cambios guardados correctamente! 💚");

}



// ===============================
// BUSCADOR
// ===============================

document
    .getElementById("buscador")
    .addEventListener("keyup", function(event) {

        const texto =
            event.target.value.toLowerCase();


        // Si se escribe algo relacionado con alimentos
        if (
            texto.includes("fresa") ||
            texto.includes("leche") ||
            texto.includes("lechuga") ||
            texto.includes("tomate")
        ) {

            mostrar("alimentos");

        }

    });