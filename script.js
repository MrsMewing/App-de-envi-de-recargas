import { BASE_DE_DATOS } from "./base_de_datos.js";
import { insertar_elementos_en_db, obtener_coleccion_completa_db } from "./funciones_de_historial_recargas.js";
import { iniciar_animacion_de_espera, detener_animacion_de_espera } from "./manejo_de_animacion_de_espera.js";
import { renderizar_opciones_de_compañia, updateFloatingButton, mostrar_texto_de_datos_no_existentes, renderizar_recargas_de_opciones} from "./renderizado_de_secciones.js";

const estado_inicio_sesion = localStorage.getItem("inicioSesion");

const base_de_datos_app = new BASE_DE_DATOS("db_recaragas", 25);

let compañia_actual_seleccionada = null;

function ocultar_texto_de_datos_no_existentes (){
    const texto_principal_de_datos_nulos = document.getElementById("texto-de-datos-no-existentes");

    //si el texto esta activo actualmente, lo ocultamos 
    if (texto_principal_de_datos_nulos.style.display != "none") {texto_principal_de_datos_nulos.style.display = "none"; return null;}
}
async function inicializar_servicios_de_app() {
    try {
        iniciar_animacion_de_espera("Cargando recursos de la app..."); 

        const respuesta_de_apertura_de_db = await base_de_datos_app.iniciar_base_de_datos();

        const respuesta_de_solicitud_extaccion_de_registro = await base_de_datos_app.obtener_registro_de_compañias();

        const registro_de_compañias_guardadas = respuesta_de_solicitud_extaccion_de_registro.target.result;

        if (registro_de_compañias_guardadas.length < 1 ){mostrar_texto_de_datos_no_existentes(); return null}

        const contenedor_de_opciones_principales = document.querySelector(".grid-options");
        registro_de_compañias_guardadas.forEach((compañia) => {
            const opcion = document.createElement("div");
            opcion.className = "option-tile";
            opcion.id = "opcion-valida";
            opcion.innerText = compañia.nombre;

            contenedor_de_opciones_principales.appendChild(opcion);
        })

    } catch (error) {
        alert("Error al iniciar la db u obtener datos de la misma db");
        console.log(error);
    }finally{
        setTimeout(() => { detener_animacion_de_espera(); }, 1200);
    }
}

inicializar_servicios_de_app();

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
    updateFloatingButton(estado_usuario[estado_usuario.length - 1]);
})

document.getElementById("seccion-de-recargas").addEventListener("click", () => {
    mostrar_seccion("main-options", "Selecciona una de las opciones");

    estado_usuario = ["main-options"];
    updateFloatingButton("main-options");
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
    const nombre_de_nueva_compañia = prompt("Introduce el nombre de la compañia nueva");

    if (!nombre_de_nueva_compañia) return null;

    base_de_datos_app.agregar_nueva_compañia(nombre_de_nueva_compañia).then((respuesta_de_solicitud_para_añadir_compañia) => {
        
        const contenedor_de_opciones_principales = document.querySelector(".grid-options");

        ocultar_texto_de_datos_no_existentes();

        const opcion = document.createElement("div");
        opcion.className = "option-tile";
        opcion.id = "opcion-valida";
        opcion.innerText = nombre_de_nueva_compañia;

        contenedor_de_opciones_principales.appendChild(opcion);
    }).catch((error) => {
        console.log(error);
    })
})

document.getElementById("add-option").addEventListener("click", () => {
    const nombre_de_nueva_opcion = prompt("Introduce el nombre de la oopcion");
    const nombre_de_compañia_seleccionada = document.getElementById("main-title").getAttribute("class");

    if (!nombre_de_nueva_opcion) return null;

    base_de_datos_app.agregar_nueva_opcion(nombre_de_compañia_seleccionada, nombre_de_nueva_opcion).then((respuesta_de_solicitud) => {

        ocultar_texto_de_datos_no_existentes();
        
        let nueva_opcion = document.createElement("div");
        nueva_opcion.className = "option-tile recharge-tile";
        nueva_opcion.id = nombre_de_nueva_opcion;
        nueva_opcion.innerHTML = `<h3 id="${nombre_de_nueva_opcion}">Recarga ${nombre_de_compañia_seleccionada}</h3><p id="${nombre_de_nueva_opcion}">${nombre_de_nueva_opcion}</p>`;

        document.querySelector(".grid-options").appendChild(nueva_opcion);
    })
})

document.querySelector(".grid-options").addEventListener("click", function(activador_de_evento){
    const contenedor_actual_de_opciones = document.querySelector(".grid-options");

    //verifica si actualmente el cotenedor esta mostrando las opciones principales
    if (contenedor_actual_de_opciones.getAttribute("id") == "main-options"){
        const informacion_de_evento = activador_de_evento.target;

        //solo toma en cuenta si se presiono alguna opcion, y cosas como espacios en blanco de la pagina
        if (informacion_de_evento.getAttribute("id") == "opcion-valida"){
            const nombre_de_compañia_seleccionada = informacion_de_evento.innerText;

            renderizar_opciones_de_compañia( base_de_datos_app, nombre_de_compañia_seleccionada);
            compañia_actual_seleccionada = nombre_de_compañia_seleccionada;
        }
    }

    //verifica si se muestran las opciones de la compañia seleccionada
    else if (contenedor_actual_de_opciones.getAttribute("id") == "opciones-recargas"){
        let elemento_clickeado = activador_de_evento.target;
        let nombre_de_elemento_clickeado = elemento_clickeado.tagName;

        let etiquedas_validas_como_opcion = ["P", "H3", "DIV"];

        if(etiquedas_validas_como_opcion.includes(nombre_de_elemento_clickeado)){

            renderizar_recargas_de_opciones(base_de_datos_app, compañia_actual_seleccionada, elemento_clickeado.id);
        }
    }
});

