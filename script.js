import {obtener_opciones_compañia} from "./base_de_datos.js";

//recorre cada opcion y asignale una funcion para que se active cuando se presione la opcion
Array.from(document.getElementsByClassName("grid-options")[0].children).forEach(element => {

    element.addEventListener("click", (event) => {
        const nombre_compañia = event.target.textContent.trim();
        
        document.getElementById("main-options").style.display = "none";
        document.getElementById("main-title").textContent = "Selecciona alguna opcion de " + nombre_compañia + ":";

        const contenedor_opciones = document.getElementById("opciones-recargas");
        contenedor_opciones.innerHTML = "";

        const informacion_compañia = obtener_opciones_compañia(nombre_compañia);

        if(informacion_compañia.length < 1) {
            const mensaje = document.createElement("h1");
            mensaje.innerText = "No hay opciones disponibles \n404";
            contenedor_opciones.appendChild(mensaje);
            contenedor_opciones.style.display = "grid";
            return;
        }

        for (let opcion of informacion_compañia[0].opciones){
            let div_opcion = document.createElement("div");
            div_opcion.className = "option-tile recharge-tile";
            div_opcion.innerHTML = `<h3>Recarga ${nombre_compañia}</h3><p>${opcion.nombre}</p>`;
            div_opcion.onclick = function (){

                if (opcion.recargas.length < 1) {
                    document.getElementById("opciones-recargas").style.display = "none";

                    const mensaje_informativo = document.createElement("h1");

                    mensaje_informativo.innerText = "No hay recargas disponibles \n404";
                    document.getElementById("menu-de-recargas").appendChild(mensaje_informativo);

                    document.getElementById("menu-de-recargas").style.display = "grid";
                    return;
                }

                mostrar_menu_opciones(opcion.recargas, opcion.nombre.trim());
            }

            contenedor_opciones.appendChild(div_opcion);
        }

        contenedor_opciones.style.display = "grid";

    })

});

function mostrar_menu_opciones(opciones, nombre_opcion){
    let contenedor_recargas = document.getElementById("menu-de-recargas");
    document.getElementById("opciones-recargas").style.display = "none";

    contenedor_recargas.innerHTML = "";

    for(let opcion of opciones){
        let div_opcion = document.createElement("div");
        div_opcion.className = "option-tile recharge tile";
        div_opcion.innerHTML = `<h3>Q${opcion.precio}</h3><p>${opcion.descripcion}</p> <a href="#" style="display: none;">${opcion.ussd} </a>`;
        div_opcion.onclick = function (){
            abrirModal(`${opcion.tipo} de Q${opcion.precio}`, opcion.ussd);
        }

        contenedor_recargas.appendChild(div_opcion)
    }

    document.getElementById("menu-de-recargas").style.display = "grid";
}

function abrirModal(infoRecarga, ussd) {
    document.getElementById("modal-title").textContent = "Seleccionaste: " + infoRecarga;
    document.getElementById("USSD-CODE").textContent = ussd.trim();
    document.getElementById("modal-recarga").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-recarga").style.display = "none";
    document.getElementById("numeroInput").value = "";
    document.querySelectorAll(".company-item").forEach(item => item.classList.remove("selected"));
}


function confirmarRecarga() {
    const numero = document.getElementById("numeroInput").value;
    const ussd = document.getElementById("USSD-CODE").innerText;

    if (!numero) {
    alert("Por favor, introduce el número");
    return;
    }
    
    const [codigoInicio, _ , codigoFinal] = ussd.split("--");
    const codigo_completo = codigoInicio + numero + codigoFinal;

    console.log(codigoInicio, codigoFinal)

    abrirAppConUSSD(codigo_completo);

    alert(`Recarga enviada a ${numero}`);
    cerrarModal();
}

function abrirAppConUSSD(codigoUSSDCompleto){
    const uriCodificada = encodeURIComponent(codigoUSSDCompleto);
    window.location.href = `tel:${uriCodificada}`;
}

document.getElementById("boton-confirmacion-de-recarga").addEventListener("click", (event) => {
    confirmarRecarga();
})

document.getElementById("boton-cerrar-modal").addEventListener("click", () => {
    cerrarModal();
})