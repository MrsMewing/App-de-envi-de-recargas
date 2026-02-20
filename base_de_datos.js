const nombre_de_base_de_datos = "db_de_recargas";
const version_de_base_de_datos = 23;

export class BASE_DE_DATOS {
    constructor(nombre_de_base_de_datos, version_de_base_de_datos){
        this.nombre_de_base_de_datos = nombre_de_base_de_datos;
        this.version_de_base_de_datos = version_de_base_de_datos;
        this.sesion_de_base_de_datos = null;
    }

    procesar_solicitud_db(solicitud){
        return new Promise((resolve, reject) => {
            //maneja los errores en caso de que algo pase, y no se guarden los datos
            solicitud.onerror = (error) => {
                reject(error);
            }
            solicitud.onsuccess = (respuesta_de_solicitud) => {
                resolve(respuesta_de_solicitud);
            }
        })
    }

    iniciar_transaccion(almacenes, almacen) {
        //abrimos los almacenes por medio de una solicitud
        const transaccion = this.sesion_de_base_de_datos.transaction(almacenes, "readwrite");

        //selecciona el almacen espesifico para trabajar
        return transaccion.objectStore(almacen);
    }

    iniciar_base_de_datos() {
        const solicitud_de_apertura_de_db = indexedDB.open(this.nombre_de_base_de_datos, this.version_de_base_de_datos);

        solicitud_de_apertura_de_db.onerror = (evento_de_error) => {
            alert("ocurrio un error al abrir la db, abre la consola para mas informacion");
            console.log(evento_de_error);

            //console.error(`Database error: ${evento_de_error.target.error?.message}`);
        }

        solicitud_de_apertura_de_db.onupgradeneeded = (evento) => {
            const sesion_de_base_de_datos = evento.target.result; 

            sesion_de_base_de_datos.createObjectStore("recargas", { keyPath: "compañia" });
        }

        solicitud_de_apertura_de_db.onsuccess = (event) => {
            this.sesion_de_base_de_datos = event.target.result;
            alert("Base de datos abierta correctamente");
        }
    }

    async agregar_nueva_compañia (nombre_de_compañia) {
        try {
            const almacen_de_recargas = this.iniciar_transaccion(["recargas"], "recargas");

            const estructura_de_opcion_compañia = {compañia: nombre_de_compañia, opciones: []};
            const respuesta_de_solicitud = await this.procesar_solicitud_db(almacen_de_recargas.add(estructura_de_opcion_compañia));

            return [respuesta_de_solicitud, null];
        }catch(error){
            return [null, error];
        }
    }

    async agregar_nueva_opcion (nombre_de_compañia_objetivo, nombre_de_nueva_opcion) {
        try {
            const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

            const respuesta_de_obtencion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.get(nombre_de_compañia_objetivo));

            const informacion_de_compañia = respuesta_de_obtencion_de_compañia.target.result;
            const nueva_opcion = {nombre: nombre_de_nueva_opcion, recargas: []};

            informacion_de_compañia.opciones.push(nueva_opcion);

            const respuesta_de_actualizacion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.put(informacion_de_compañia));

            return [respuesta_de_actualizacion_de_compañia, null];
        }catch(error){
            return [null, error];
        }
    }

    async agregar_nueva_recarga (nombre_de_compañia_objetivo, indice_de_opcion_objetivo, informacion_de_nueva_recarga) {
        try {
            const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

            const respuesta_de_obtencion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.get(nombre_de_compañia_objetivo));

            const informacion_de_compañia = respuesta_de_obtencion_de_compañia.target.result;
            const opciones_de_compañia = informacion_de_compañia.opciones;

            const opcion_seleccionada = opciones_de_compañia[indice_de_opcion_objetivo];

            opcion_seleccionada.recargas.push(informacion_de_nueva_recarga);

            const respuesta_de_actualizacion_de_opcion = await this.procesar_solicitud_db(registro_de_compañias_guardadas.put(informacion_de_compañia));

            return [respuesta_de_actualizacion_de_opcion, null];

        }catch(error){
            return [null, error];
        }
    }
}