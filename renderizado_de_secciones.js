import { iniciar_animacion_de_espera, detener_animacion_de_espera } from "./manejo_de_animacion_de_espera.js"

function actualizar_contenedor_de_opciones(nuevo_titulo, nombre_de_opcion_seleccionada, nombre_de_nueva_seccion){
    //limpiamos el div principal donde estan las opciones
    document.querySelector(".grid-options").innerHTML = "";

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

export function renderizar_opciones_de_compañia( base_de_datos_app, nombre_de_compañia_seleccionada ){
    
    iniciar_animacion_de_espera("Buscando datos de opcion seleccioanda: " + nombre_de_compañia_seleccionada);

    actualizar_contenedor_de_opciones("Opciones disponibles de la compañia: " + nombre_de_compañia_seleccionada, nombre_de_compañia_seleccionada, "opciones-recargas");

    base_de_datos_app.obtener_informacion_de_compañia(nombre_de_compañia_seleccionada).then((compañia) => {
        if (compañia.opciones.length < 1) { mostrar_texto_de_datos_no_existentes("No hay opciones aun, puedes agregar algunas"); return null;}

        compañia.opciones.forEach((informacion_de_opcion_de_compañia) => {                    
        let nueva_opcion = document.createElement("div");
        nueva_opcion.className = "option-tile recharge-tile";
        nueva_opcion.id = informacion_de_opcion_de_compañia.nombre;
        nueva_opcion.innerHTML = `<h3 id="${informacion_de_opcion_de_compañia.nombre}">Recarga ${compañia.nombre}</h3><p id="${informacion_de_opcion_de_compañia.nombre}">${informacion_de_opcion_de_compañia.nombre}</p>`;

        document.querySelector(".grid-options").appendChild(nueva_opcion);
    });
    }).finally( () => {        
        setTimeout(() => {detener_animacion_de_espera()}, 1200);
    })
}

export function renderizar_recargas_de_opciones(base_de_datos, nombre_de_compañia_objetivo, opcion_seleccionada){

    iniciar_animacion_de_espera("Obteniendo recargas guardadas");

    actualizar_contenedor_de_opciones("Recargas disponibles de " + opcion_seleccionada, opcion_seleccionada, "menu-de-recargas");

    base_de_datos.obtener_informacion_de_compañia(nombre_de_compañia_objetivo).then((compañia) => {
        let informacion_de_opcion = null; 
        let contenedor_de_recargas = document.querySelector(".grid-options");

        //clasifica y obtiene la iformacion de la opcion que el usuario selecciono
        compañia.opciones.forEach((opcion) => {
            if(opcion.nombre == opcion_seleccionada) informacion_de_opcion = opcion;
        });

        if (informacion_de_opcion.recargas.length < 1) { mostrar_texto_de_datos_no_existentes("No hay recargas guardadas, puedes agregar algunas"); return null;}

        //itera cada recarga guardada en la opcion seleccioanda
        for (let recarga of informacion_de_opcion.recargas){
            let div_opcion = document.createElement("div");
            div_opcion.className = "option-tile recharge tile";
            div_opcion.innerHTML = `<h3>Q${recarga.precio}</h3><p>${recarga.descripcion}</p> <a href="#" style="display: none;">${recarga.ussd} </a>`;

            contenedor_de_recargas.appendChild(div_opcion);
        }
    }).finally(() => {        
        setTimeout(() => {detener_animacion_de_espera()}, 1200);
    });
}