// =========================================================
// ECOFOOD - CATÁLOGO Y TIENDA
// =========================================================

function filtrar(categoria) {
    const productos = document.querySelectorAll(".catalogo-producto");
    const botones = document.querySelectorAll(".categorias button");

    botones.forEach(btn => btn.classList.remove("activo"));
    
    // Activar botón clickeado si existe evento
    if (event && event.target) {
        event.target.classList.add("activo");
    }

    productos.forEach(prod => {
        const catProd = prod.getAttribute("data-categoria");
        if (categoria === "todos" || catProd === categoria) {
            prod.style.display = "flex";
        } else {
            prod.style.display = "none";
        }
    });
}

// Buscador en Catálogo
const inputBuscarCat = document.getElementById("buscarCatalogo");
if (inputBuscarCat) {
    inputBuscarCat.addEventListener("keyup", (e) => {
        const query = e.target.value.toLowerCase();
        const productos = document.querySelectorAll(".catalogo-producto");
        productos.forEach(p => {
            const texto = p.textContent.toLowerCase();
            p.style.display = texto.includes(query) ? "flex" : "none";
        });
    });
}

// Buscador en Tienda
const inputBuscarTienda = document.getElementById("buscarTienda");
if (inputBuscarTienda) {
    inputBuscarTienda.addEventListener("keyup", (e) => {
        const query = e.target.value.toLowerCase();
        const productos = document.querySelectorAll(".catalogo-producto");
        productos.forEach(p => {
            const texto = p.textContent.toLowerCase();
            p.style.display = texto.includes(query) ? "flex" : "none";
        });
    });
}
