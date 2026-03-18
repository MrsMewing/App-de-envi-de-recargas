import { BASE_DE_DATOS } from "./base_de_datos.js";
import { insertar_elementos_en_db, obtener_coleccion_completa_db } from "./funciones_de_historial_recargas.js";
import { iniciar_animacion_de_espera, detener_animacion_de_espera } from "./manejo_de_animacion_de_espera.js";
import { renderizar_seccion_principal, renderizar_opciones_de_compañia, updateFloatingButton, mostrar_texto_de_datos_no_existentes, renderizar_recargas_de_opciones} from "./renderizado_de_secciones.js";

const estado_inicio_sesion = localStorage.getItem("inicioSesion");

const base_de_datos_app = new BASE_DE_DATOS("db_recaragas", 25);

let compañia_actual_seleccionada = null;
let opcion_actual_seleccionada = null;

function ocultar_texto_de_datos_no_existentes (){
    const texto_principal_de_datos_nulos = document.getElementById("texto-de-datos-no-existentes");

    //si el texto esta activo actualmente, lo ocultamos 
    if (texto_principal_de_datos_nulos.style.display != "none") {texto_principal_de_datos_nulos.style.display = "none"; return null;}
}
async function inicializar_servicios_de_app() {
    try {
        iniciar_animacion_de_espera("Cargando recursos de la app..."); 

        const respuesta_de_apertura_de_db = await base_de_datos_app.iniciar_base_de_datos();

        renderizar_seccion_principal(base_de_datos_app);
    } catch (error) {
        alert("Error al iniciar la db u obtener datos de la misma db");
        console.log(error);
    }finally{
        setTimeout(() => { detener_animacion_de_espera(); }, 1200);
    }
}

inicializar_servicios_de_app()

let estado_usuario = ["main-options"];

localStorage.setItem("informacion_de_recarga", JSON.stringify({numero: null, compañia: null, descripcion: null, precio: null, fecha: null}));

if (!estado_inicio_sesion){

    alert("Bienvenido a un mundo más organizado, tienes todo lo que necesitas aqui :)"); 

    localStorage.setItem("inicioSesion", true);
}

updateFloatingButton();

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
    document.getElementById("input-pin-recarga").value = "";
    document.querySelectorAll(".company-item").forEach(item => item.classList.remove("selected"));
}

function abrirModalAddCompany() {
    document.getElementById("modal-add-company").style.display = "flex";
}

function cerrarModalAddCompany() {
    document.getElementById("modal-add-company").style.display = "none";
    document.getElementById("input-company-name").value = "";
}

function abrirModalAddOption() {
    document.getElementById("modal-add-option").style.display = "flex";
}

function cerrarModalAddOption() {
    document.getElementById("modal-add-option").style.display = "none";
    document.getElementById("input-option-name").value = "";
}

function abrirModalAddRecharge() {
    document.getElementById("modal-add-recharge").style.display = "flex";
}

function cerrarModalAddRecharge() {
    document.getElementById("modal-add-recharge").style.display = "none";
    document.getElementById("input-recharge-desc").value = "";
    document.getElementById("input-recharge-price").value = "";
    document.getElementById("input-recharge-ussd").value = "";
}

function valida_formulario_recarga() {
    const input_numero = document.getElementById("numeroInput");
    const input_pin = document.getElementById("input-pin-recarga");
    const input_checkbox = document.getElementById("checkbox-recordar-pin");

    const ussd = document.getElementById("USSD-CODE").innerText;
    const compañia = document.getElementById("nombre_compañia").innerText;

    if(input_checkbox.checked){
        localStorage.setItem(`pin_recargas_${compañia}`, String(input_pin.value));
    } 
    else {
        localStorage.removeItem(`pin_recargas_${compañia}`);
        input_pin.value = "";
    }

    const codigo_completo = ussd.replace("--PIN--", input_pin.value).replace("--TELEFONO--", input_numero.value);

    const informacion_de_recarga = localStorage.getItem("informacion_de_recarga")? JSON.parse(localStorage.getItem("informacion_de_recarga")) : {numero: null, compañia: null, descripcion: null, precio: null, fecha: null};

    informacion_de_recarga.numero = input_numero.value;

    localStorage.setItem("informacion_de_recarga", JSON.stringify(informacion_de_recarga));

    autocompletar_codigo_USSD(codigo_completo);

    setTimeout(() => {
        document.getElementById("recargaModal-bg").classList.add("activate");

        setTimeout(() => {
            const opcion_recarga_enviada = document.getElementById("input_recarga_enviada");
            const opcion_recarga_no_enviada = document.getElementById("input_recarga_no_enviada");

            //si alguno de los inputs fue seleccionado no hagas nada
            if (opcion_recarga_enviada.checked || opcion_recarga_no_enviada.checked) return null;

            //pero si no se selecciono nada despues de 10s, marca automaticamente la opcion por defecto
            const informacion_de_recarga = JSON.parse(localStorage.getItem("informacion_de_recarga"));
            guardar_datos_de_recarga(informacion_de_recarga.numero, informacion_de_recarga.compañia, informacion_de_recarga.descripcion, informacion_de_recarga.precio, obtener_fecha_actual(), "RECHAZADA");

            //cerrar todos los modals y dejar la pantalla limpia
            document.getElementById("recargaModal-bg").classList.remove("activate");
            cerrarModal();
        }, 8000);

    }, 1500);
}

function autocompletar_codigo_USSD(codigoUSSDCompleto){
    const uriCodificada = encodeURIComponent(codigoUSSDCompleto);
    window.location.href = `tel:${uriCodificada}`;
}

document.getElementById("formulario-envio-recarga").addEventListener("submit", (event) => {
    valida_formulario_recarga();
})

document.getElementById("boton-cerrar-modal").addEventListener("click", () => {
    cerrarModal();
})

document.getElementById("seccion-de-recargas").addEventListener("click", () => {
    document.getElementById("seccion-historial").style.display = "none";

    document.getElementById("btn-retroceder").style.display = "block";
    document.getElementById("main-content").style.display = "block";
});

document.getElementById("seccion-de-historial").addEventListener("click", () => {
    document.getElementsByClassName("history-list")[0].innerHTML = "";

    const boton_retroceder = document.getElementById("btn-retroceder");
    const cotenido_principal = document.getElementById("main-content");

    const contenido_historial = document.getElementById("seccion-historial");

    boton_retroceder.style.display = "none";
    cotenido_principal.style.display = "none";

    contenido_historial.style.display = "block";

    obtener_coleccion_completa_db().then((informacion_db) => {
        informacion_db.forEach((info_recarga) => {
            crear_recordatorio_en_historial(info_recarga.numero, info_recarga.compañia, info_recarga.descripcion, info_recarga.precio, info_recarga.fecha_de_envio, info_recarga.estado_recarga);
        });
    });

})

function obtener_fecha_actual(){
    const dias_semana = ["_", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
    const meses_año = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const objeto_fecha = new Date();
    return `${dias_semana[objeto_fecha.getDay()]} ${objeto_fecha.getDate()} de ${meses_año[objeto_fecha.getMonth()]} del ${objeto_fecha.getFullYear()} ${objeto_fecha.getHours()}:${objeto_fecha.getMinutes()} horas`;
}
async function guardar_datos_de_recarga(numero_cliente, compañia, descripcion, precio, fecha_de_envio, estado_recarga){
    const resultado = await insertar_elementos_en_db({id: numero_cliente, numero: numero_cliente, compañia: compañia, descripcion: descripcion, precio: precio ,fecha_de_envio: fecha_de_envio, estado_recarga: estado_recarga});

    if (resultado) crear_recordatorio_en_historial(numero_cliente, compañia, descripcion, precio, fecha_de_envio, estado_recarga);
}

document.getElementById("recargaModal-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const opcion_recarga_enviada = document.getElementById("input_recarga_enviada");
    const opcion_recarga_no_enviada = document.getElementById("input_recarga_no_enviada");

    if (opcion_recarga_enviada.checked) {
        const informacion_de_recarga = JSON.parse(localStorage.getItem("informacion_de_recarga"));
        guardar_datos_de_recarga(informacion_de_recarga.numero, informacion_de_recarga.compañia, informacion_de_recarga.descripcion, informacion_de_recarga.precio, obtener_fecha_actual(), "ENVIADA");
    }
    else if (opcion_recarga_no_enviada.checked) {
        const informacion_de_recarga = JSON.parse(localStorage.getItem("informacion_de_recarga"));
        guardar_datos_de_recarga(informacion_de_recarga.numero, informacion_de_recarga.compañia, informacion_de_recarga.descripcion, informacion_de_recarga.precio, obtener_fecha_actual(), "RECHAZADA");
    }

    //desactiva el modal de fomrulario cuando se envie la informacion 
    opcion_recarga_enviada.checked = false;
    opcion_recarga_no_enviada.checked = false;
    
    document.getElementById("recargaModal-bg").classList.remove("activate");
});

function crear_recordatorio_en_historial(numero_telefonico, compañia, informacion, precio, fecha, estado){
    const cotenedor_historial = document.getElementsByClassName("history-list")[0];

    const contenedor_principal = document.createElement("div");
    contenedor_principal.setAttribute("class", "history-entry");

    const de = document.createElement("div");
    de.setAttribute("class", "entry-left");

    const texto_numero = document.createElement("div");
    texto_numero.setAttribute("class", "entry-phone");
    texto_numero.appendChild(document.createTextNode(`+502 ${numero_telefonico}`));

    const texto_compañia = document.createElement("div");
    texto_compañia.setAttribute("class", "entry-company");
    texto_compañia.appendChild(document.createTextNode(`COMPAÑIA ${compañia.toUpperCase()}`));

    const texto_de = document.createElement("div");
    texto_de.setAttribute("class", "entry-type")
    texto_de.appendChild(document.createTextNode(informacion));

    de.appendChild(texto_numero);
    de.appendChild(texto_compañia);
    de.appendChild(texto_de);

    const informacion_estado_recarga = document.createElement("div");
    informacion_estado_recarga.setAttribute("class", "entry-right");

    const texto_precio = document.createElement("div");
    texto_precio.setAttribute("class", "entry-price");
    texto_precio.appendChild(document.createTextNode(`PRECIO PAGADO Q${precio}`));

    const texto_fecha_de_envio = document.createElement("div");
    texto_fecha_de_envio.setAttribute("class", "entry-datetime");
    texto_fecha_de_envio.appendChild(document.createTextNode(fecha));

    const texto_estado_recarga = document.createElement("div");
    const estado_recarga = estado.toLowerCase() == "enviada"? "sent" : "failed";
    texto_estado_recarga.setAttribute("class", "entry-status " + estado_recarga);
    texto_estado_recarga.appendChild(document.createTextNode(estado));
    
    informacion_estado_recarga.appendChild(texto_precio);
    informacion_estado_recarga.appendChild(texto_fecha_de_envio);
    informacion_estado_recarga.appendChild(texto_estado_recarga);

    contenedor_principal.appendChild(de);
    contenedor_principal.appendChild(informacion_estado_recarga);

    cotenedor_historial.appendChild(contenedor_principal);
}

document.getElementById("add-company").addEventListener("click", () => {
    abrirModalAddCompany();
})

document.getElementById("add-option").addEventListener("click", () => {
    abrirModalAddOption();
})

document.getElementById("add-recharge").addEventListener("click", () => {
    abrirModalAddRecharge();
})

document.getElementById("form-add-company").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("input-company-name").value.trim();
    if (!nombre) return;

    base_de_datos_app.agregar_nueva_compañia(nombre).then(() => {
        const contenedor = document.querySelector(".grid-options");
        ocultar_texto_de_datos_no_existentes();
        const opcion = document.createElement("div");
        opcion.className = "option-tile";
        opcion.id = "opcion-valida";
        opcion.innerText = nombre;
        contenedor.appendChild(opcion);
        cerrarModalAddCompany();
    }).catch(console.log);
})

document.getElementById("cancel-add-company").addEventListener("click", cerrarModalAddCompany);

document.getElementById("form-add-option").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("input-option-name").value.trim();
    if (!nombre) return;

    const nombreCompania = document.getElementById("main-title").getAttribute("class");

    base_de_datos_app.agregar_nueva_opcion(nombreCompania, nombre).then(() => {
        ocultar_texto_de_datos_no_existentes();
        let nuevaOpcion = document.createElement("div");
        nuevaOpcion.className = "option-tile recharge-tile";
        nuevaOpcion.id = nombre;
        nuevaOpcion.innerHTML = `<h3 id="${nombre}">Recarga ${nombreCompania}</h3><p id="${nombre}">${nombre}</p>`;
        document.querySelector(".grid-options").appendChild(nuevaOpcion);
        cerrarModalAddOption();
    }).catch(console.log);
})

document.getElementById("cancel-add-option").addEventListener("click", cerrarModalAddOption);

document.getElementById("form-add-recharge").addEventListener("submit", (event) => {
    event.preventDefault();
    const desc = document.getElementById("input-recharge-desc").value.trim();
    const precio = parseFloat(document.getElementById("input-recharge-price").value);
    const ussd = document.getElementById("input-recharge-ussd").value.trim();
    if (!desc || isNaN(precio) || !ussd) return;

    const nombreCompania = compañia_actual_seleccionada;
    const nombreOpcion = opcion_actual_seleccionada;

    // Obtener el índice de la opción
    base_de_datos_app.obtener_informacion_de_compañia(nombreCompania).then(compania => {
        const indice = compania.opciones.findIndex(op => op.nombre === nombreOpcion);
        if (indice === -1) return;

        const nuevaRecarga = { descripcion: desc, precio, ussd };
        return base_de_datos_app.agregar_nueva_recarga(nombreCompania, indice, nuevaRecarga);
    }).then(() => {
        // Re-renderizar las recargas
        ocultar_texto_de_datos_no_existentes();
        renderizar_recargas_de_opciones(base_de_datos_app, nombreCompania, nombreOpcion);
        cerrarModalAddRecharge();
    }).catch(console.log);
})

document.getElementById("cancel-add-recharge").addEventListener("click", cerrarModalAddRecharge);

document.querySelector(".grid-options").addEventListener("click", function(activador_de_evento){
    const contenedor_actual_de_opciones = document.querySelector(".grid-options");

    //verifica si actualmente el cotenedor esta mostrando las opciones principales
    if (contenedor_actual_de_opciones.getAttribute("id") == "main-options"){
        const informacion_de_evento = activador_de_evento.target;

        //verifica que haya sido una opcion valida
        if (informacion_de_evento.getAttribute("id") == "opcion-valida"){
            const nombre_de_compañia_seleccionada = informacion_de_evento.innerText;


            renderizar_opciones_de_compañia( base_de_datos_app, nombre_de_compañia_seleccionada)
            compañia_actual_seleccionada = nombre_de_compañia_seleccionada;
        }
    }

    //verifica si se muestran las opciones de la compañia seleccionada
    else if (contenedor_actual_de_opciones.getAttribute("id") == "opciones-recargas"){
        let elemento_clickeado = activador_de_evento.target;
        let nombre_de_elemento_clickeado = elemento_clickeado.tagName;

        let etiquedas_validas_como_opcion = ["P", "H3", "DIV"];

        if(etiquedas_validas_como_opcion.includes(nombre_de_elemento_clickeado)){
            opcion_actual_seleccionada = elemento_clickeado.id;       
            renderizar_recargas_de_opciones(base_de_datos_app, compañia_actual_seleccionada, elemento_clickeado.id)
        }
    }
});

document.getElementById("btn-retroceder").addEventListener("click", function(){
    const nombre_de_seccion_actual = document.querySelector(".grid-options").getAttribute("id");

    if (nombre_de_seccion_actual == "opciones-recargas"){
        renderizar_seccion_principal(base_de_datos_app);
    }
    else if (nombre_de_seccion_actual == "menu-de-recargas"){
        renderizar_opciones_de_compañia(base_de_datos_app, compañia_actual_seleccionada);
        console.log(opcion_actual_seleccionada);
    }
});