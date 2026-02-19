const nombre_de_base_de_datos = "db_de_recargas";
const version_de_base_de_datos = 23;

const solicitud_de_apertura_de_db = indexedDB.open(nombre_de_base_de_datos, version_de_base_de_datos);

let base_de_datos_de_recargas = null;

solicitud_de_apertura_de_db.onerror = (evento_de_error) => {
    alert("ocurrio un error al abrir la db, abre la consola para mas informacion");
    console.log(evento_de_error);

    //console.error(`Database error: ${evento_de_error.target.error?.message}`);
}

solicitud_de_apertura_de_db.onupgradeneeded = (evento) => {
    const sesion_de_base_de_datos = evento.target.result; 

    const almacen_de_recargas = sesion_de_base_de_datos.createObjectStore("recargas", { keyPath: "compañia" });
}

solicitud_de_apertura_de_db.onsuccess = (event) => {
    base_de_datos_de_recargas = event.target.result;
    alert("Base de datos abierta correctamente");
}

function procesar_solicitud_db (solicitud) {
    return new Promise((resolve, reject) => {
        //maneja los errores en caso de que algo pase, y no se guarden los datos
        solicitud.onerror = (error) => {
            reject(error);
        }
        solicitud.onsuccess = () => {
            resolve("Los datos se guardaron correctamente");
        }
    })
}

export async function agregar_nueva_compañia (nombre_de_compañia) {
    try {

        let resulado_de_solicitud = null; 

        //abrimos los almacenes por medio de una solicitud
        const transaccion = base_de_datos_de_recargas.transaction(["recargas"], "readwrite");

        //selecciona el almacen espesifico para trabajar
        const almacen_de_recargas = transaccion.objectStore("recargas");

        //prepara los datos que se van a guardar 
        const estructura_de_recarga = {compañia: nombre_de_compañia, opciones: []};

        //guarda los datos en la base de datos 
        const respuesta_de_solicitud = await procesar_solicitud_db(almacen_de_recargas.add(estructura_de_recarga));

        return [respuesta_de_solicitud, null]; 

    } catch (error) {
        return Promise.reject([null, error]);
    }

}