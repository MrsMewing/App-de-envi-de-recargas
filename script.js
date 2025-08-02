import {obtener_opciones_compañia} from "./base_de_datos.js";

const estado_inicio_sesion = localStorage.getItem("inicioSesion");

let estado_usuario = ["main-options"];

if (!estado_inicio_sesion){
    let codigo_cliente = prompt("Introduce tu PIN de recarga (ejemplo 2032, 2025 etc)");

    while (!codigo_cliente) codigo_cliente = prompt("Por favor ingresa tu PIN de recarga");

    alert("Gracias"); 

    localStorage.setItem("pin_recargas", codigo_cliente);
    localStorage.setItem("inicioSesion", true);
}

//recorre cada opcion y asignale una funcion para que se active cuando se presione la opcion
Array.from(document.getElementsByClassName("grid-options")[0].children).forEach(element => {

    element.addEventListener("click", (event) => {
        const nombre_compañia = event.target.textContent.trim();
        
        document.getElementById("main-options").style.display = "none";
        document.getElementById("main-title").textContent = "Selecciona alguna opcion de " + nombre_compañia + ":";

        const contenedor_opciones = document.getElementById("opciones-recargas");
        contenedor_opciones.innerHTML = "";
        estado_usuario.push("opciones-recargas");

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

                mostrar_menu_opciones(opcion.nombre, opcion.recargas, nombre_compañia);
            }

            contenedor_opciones.appendChild(div_opcion);
        }

        contenedor_opciones.style.display = "grid";

    })

});

function mostrar_menu_opciones(opcion, opciones, compañia){
    document.getElementById("main-title").textContent = "Selecciona una opcion de " + opcion;

    let contenedor_recargas = document.getElementById("menu-de-recargas");
    document.getElementById("opciones-recargas").style.display = "none";

    contenedor_recargas.innerHTML = "";
    estado_usuario.push("menu-de-recargas");

    for(let opcion of opciones){
        let div_opcion = document.createElement("div");
        div_opcion.className = "option-tile recharge tile";
        div_opcion.innerHTML = `<h3>Q${opcion.precio}</h3><p>${opcion.descripcion}</p> <a href="#" style="display: none;">${opcion.ussd} </a>`;
        div_opcion.onclick = function (){
            abrirModal(`${opcion.tipo} de Q${opcion.precio}`, opcion.ussd, compañia);
        }

        contenedor_recargas.appendChild(div_opcion)
    }

    document.getElementById("menu-de-recargas").style.display = "grid";
}

function abrirModal(infoRecarga, ussd, compañia) {
    document.getElementById("modal-title").textContent = "Seleccionaste: " + infoRecarga;
    document.getElementById("USSD-CODE").textContent = ussd.trim();
    document.getElementById("nombre_compañia").textContent = compañia.trim();
    document.getElementById("modal-recarga").style.display = "flex";

    //añadir logica para mostrar el pin correcto, dependiendo la opcion que se marco
    const pin = localStorage.getItem(`pin_recargas_${compañia}`);

    //verifica si existe en el almacenamiento local esta algun pin
    if(pin) {
        document.getElementById("input-pin-recarga").value = pin;
        document.getElementById("checkbox-recordar-pin").checked = true;
    }
}

function cerrarModal() {
    document.getElementById("modal-recarga").style.display = "none";
    document.getElementById("numeroInput").value = "";
    document.querySelectorAll(".company-item").forEach(item => item.classList.remove("selected"));
}


/*
cuando se presione el boton de enviar recarga valido lo siguiente
1) Que los inputs esten con algun valor,
*/
function confirmarRecarga() {
    const input_numero = document.getElementById("numeroInput");
    const input_pin = document.getElementById("input-pin-recarga");
    const input_checkbox = document.getElementById("checkbox-recordar-pin");
    const pin = localStorage.getItem("pin_recargas");

    const ussd = document.getElementById("USSD-CODE").innerText;
    const compañia = document.getElementById("nombre_compañia").innerText;

    if (!input_numero.value) {
        alert("Por favor, introduce el número");
        return;
    }
    if(!input_pin.value){
        alert("Por favor, introduce el PIN de recarga");
        return;
    }

    if(input_checkbox.checked){
        localStorage.setItem(`pin_recargas_${compañia}`, input_pin.value);
    } 
    else {
        localStorage.removeItem("pin_recargas");
        input_pin.value = "";
    }

    const codigo_completo = ussd.replace("--PIN--", pin).replace("--TELEFONO--", input_numero.value);

    abrirAppConUSSD(codigo_completo);

    alert(`Recarga enviada a ${input_numero.value}`);
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

function mostrar_seccion(id_seccion){
    let secciones = Array.from(document.getElementsByClassName("grid-options"));

    secciones.forEach((seccion) => {
        seccion.style.display = "none";
    })

    document.getElementById(id_seccion).style.display = "grid";
}

document.getElementById("btn-retroceder").addEventListener("click", () => {

    if(estado_usuario[estado_usuario.length - 1] != "main-options") estado_usuario.pop();

    mostrar_seccion(estado_usuario[estado_usuario.length - 1]);
})

document.getElementById("seccion-de-recargas").addEventListener("click", () => {
    mostrar_seccion("main-options", "Selecciona una de las opciones");

    estado_usuario = ["main-options"]
})