import { iniciar_animacion_de_espera, detener_animacion_de_espera } from "./manejo_de_animacion_de_espera.js"

function actualizar_contenedor_de_opciones(nuevo_titulo, nombre_de_opcion_seleccionada, nombre_de_nueva_seccion){
    //limpiamos el div principal donde estan las opciones
    document.querySelector(".grid-options").innerHTML = "";

    document.getElementById("texto-de-datos-no-existentes").innerHTML = "";
    //actualiza el titulo del contenedor 
    document.getElementById("main-title").innerText = nuevo_titulo;

    //inserta el nombre de la opcion seleccionada en el titulo (no recuerdo para que)
    document.getElementById("main-title").setAttribute("class", nombre_de_opcion_seleccionada);
    document.querySelector(".grid-options").setAttribute("id", nombre_de_nueva_seccion);

    //actualiza el boton segun la seccion que se mostrara ahora
    updateFloatingButton();
}

export function mostrar_texto_de_datos_no_existentes (texto_para_mostrar = "No hay datos, agrega algunos elementos"){
    const texto_principal_de_datos_nulos = document.getElementById("texto-de-datos-no-existentes");

    texto_principal_de_datos_nulos.innerText = texto_para_mostrar;
    texto_principal_de_datos_nulos.style.display = "grid";

}

export function updateFloatingButton() {
    document.querySelectorAll('.floating').forEach(btn => btn.style.display = 'none');

    const nombre_de_contenedor_actual = document.querySelector(".grid-options").getAttribute("id");

    if (nombre_de_contenedor_actual === 'main-options') {
        document.getElementById('add-company').style.display = 'block';
    } else if (nombre_de_contenedor_actual === 'opciones-recargas') {
        document.getElementById('add-option').style.display = 'block';
    } else if (nombre_de_contenedor_actual === 'menu-de-recargas') {
        document.getElementById('add-recharge').style.display = 'block';
    }
}

export async function renderizar_seccion_principal(base_de_datos_app) {


    const respuesta_de_solicitud_extaccion_de_registro = await base_de_datos_app.obtener_registro_de_compañias();

    const registro_de_compañias_guardadas = respuesta_de_solicitud_extaccion_de_registro.target.result;

    if (registro_de_compañias_guardadas.length < 1 ){mostrar_texto_de_datos_no_existentes(); return null}

    actualizar_contenedor_de_opciones("Selecciona una de las compañias", "", "main-options");

    const contenedor_de_opciones_principales = document.querySelector(".grid-options");
    registro_de_compañias_guardadas.forEach((compañia) => {
        const opcion = document.createElement("div");
        opcion.className = "option-tile";
        opcion.id = "opcion-valida";

        const contenido_de_opcion = document.createElement("p");
        contenido_de_opcion.innerText = compañia.nombre;

        opcion.appendChild(contenido_de_opcion);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "×";
        deleteBtn.id = compañia.id;
        opcion.appendChild(deleteBtn);

        contenedor_de_opciones_principales.appendChild(opcion);
    })
}

export async function renderizar_opciones_de_compañia( base_de_datos_app, nombre_de_compañia_seleccionada ){
    
    iniciar_animacion_de_espera("Buscando datos de opcion seleccioanda: " + nombre_de_compañia_seleccionada);

    actualizar_contenedor_de_opciones("Opciones disponibles de la compañia: " + nombre_de_compañia_seleccionada, nombre_de_compañia_seleccionada, "opciones-recargas");

    const compañia = await base_de_datos_app.obtener_informacion_de_compañia(nombre_de_compañia_seleccionada)

    if (compañia.opciones.length < 1) { mostrar_texto_de_datos_no_existentes("No hay opciones aun, puedes agregar algunas"); setTimeout(() => {detener_animacion_de_espera()}, 1200); return null;}

    compañia.opciones.forEach((informacion_de_opcion_de_compañia) => {                    
    let nueva_opcion = document.createElement("div");
    nueva_opcion.className = "option-tile recharge-tile";
    nueva_opcion.id = informacion_de_opcion_de_compañia.nombre;
    nueva_opcion.innerHTML = `<h3 id="${informacion_de_opcion_de_compañia.nombre}">Recarga ${compañia.nombre}</h3><p id="${informacion_de_opcion_de_compañia.nombre}">${informacion_de_opcion_de_compañia.nombre}</p>`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerText = "×";
    deleteBtn.id = informacion_de_opcion_de_compañia.id;
    nueva_opcion.appendChild(deleteBtn);

    document.querySelector(".grid-options").appendChild(nueva_opcion);
    });  
        
    setTimeout(() => {detener_animacion_de_espera()}, 1200);
}

export async function renderizar_recargas_de_opciones(base_de_datos, nombre_de_compañia_objetivo, opcion_seleccionada){

    iniciar_animacion_de_espera("Obteniendo recargas guardadas");

    actualizar_contenedor_de_opciones("Recargas disponibles de " + opcion_seleccionada, opcion_seleccionada, "menu-de-recargas");

    let compañia = await base_de_datos.obtener_informacion_de_compañia(nombre_de_compañia_objetivo)
    let informacion_de_opcion = null; 
    let contenedor_de_recargas = document.querySelector(".grid-options");

    //clasifica y obtiene la iformacion de la opcion que el usuario selecciono
    compañia.opciones.forEach((opcion) => {
        if(opcion.nombre == opcion_seleccionada) informacion_de_opcion = opcion;
    });

    if (informacion_de_opcion.recargas.length < 1) { mostrar_texto_de_datos_no_existentes("No hay recargas guardadas, puedes agregar algunas"); setTimeout(() => {detener_animacion_de_espera()}, 1200); return null; }

    //itera cada recarga guardada en la opcion seleccioanda
    for (let recarga of informacion_de_opcion.recargas){
        let div_opcion = document.createElement("div");
        div_opcion.className = "option-tile recharge tile";
        div_opcion.innerHTML = `<h3>Q${recarga.precio}</h3><p>${recarga.descripcion}</p> <a href="#" style="display: none;">${recarga.ussd} </a>`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "×";
        deleteBtn.id = recarga.id;
        div_opcion.appendChild(deleteBtn);

        contenedor_de_recargas.appendChild(div_opcion);
    }

    setTimeout(() => {detener_animacion_de_espera()}, 1200);
}