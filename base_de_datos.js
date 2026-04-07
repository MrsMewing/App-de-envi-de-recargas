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
        return new Promise((resolve, reject) => {
            const solicitud_de_apertura_de_db = indexedDB.open(this.nombre_de_base_de_datos, this.version_de_base_de_datos);

            solicitud_de_apertura_de_db.onerror = (evento_de_error) => {
                reject(evento_de_error);
            }

            solicitud_de_apertura_de_db.onupgradeneeded = (evento) => {
                const sesion_de_base_de_datos = evento.target.result; 

                sesion_de_base_de_datos.createObjectStore("recargas", { keyPath: "nombre" });
            }

            solicitud_de_apertura_de_db.onsuccess = (event) => {
                this.sesion_de_base_de_datos = event.target.result;
                resolve("La base de datos fue iniciada correctamente");
            }  
        })
    }
    
    async obtener_registro_de_compañias(){
        const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_de_obtencion_de_registro = await this.procesar_solicitud_db(registro_de_compañias_guardadas.getAll());

        return respuesta_de_obtencion_de_registro;
    }

    async obtener_informacion_de_compañia (nombre_de_compañia) {
        const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_de_obtencion_de_infor_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.get(nombre_de_compañia));

        return respuesta_de_obtencion_de_infor_de_compañia.target.result;
    }

    async agregar_nueva_compañia (nombre_de_compañia, id) {
        const almacen_de_recargas = this.iniciar_transaccion(["recargas"], "recargas");

        const estructura_de_opcion_compañia = {nombre: nombre_de_compañia, id: id, opciones: []};
        const respuesta_de_solicitud = await this.procesar_solicitud_db(almacen_de_recargas.add(estructura_de_opcion_compañia));

        return respuesta_de_solicitud;
    }

    async agregar_nueva_opcion (nombre_de_compañia_objetivo, nombre_de_nueva_opcion, id) {
        const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_de_obtencion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.get(nombre_de_compañia_objetivo));

        const informacion_de_compañia = respuesta_de_obtencion_de_compañia.target.result;
        const nueva_opcion = {nombre: nombre_de_nueva_opcion, id: id, recargas: []};

        informacion_de_compañia.opciones.push(nueva_opcion);

        const respuesta_de_actualizacion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.put(informacion_de_compañia));

        return respuesta_de_actualizacion_de_compañia
    }

    async agregar_nueva_recarga (nombre_de_compañia_objetivo, indice_de_opcion_objetivo, informacion_de_nueva_recarga) {
        const registro_de_compañias_guardadas = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_de_obtencion_de_compañia = await this.procesar_solicitud_db(registro_de_compañias_guardadas.get(nombre_de_compañia_objetivo));

        const informacion_de_compañia = respuesta_de_obtencion_de_compañia.target.result;
        const opciones_de_compañia = informacion_de_compañia.opciones;

        const opcion_seleccionada = opciones_de_compañia[indice_de_opcion_objetivo];

        opcion_seleccionada.recargas.push(informacion_de_nueva_recarga);

        const respuesta_de_actualizacion_de_opcion = await this.procesar_solicitud_db(registro_de_compañias_guardadas.put(informacion_de_compañia));

        return [respuesta_de_actualizacion_de_opcion, null];
    }

    async eliminar_compañia(nombre_compañia) {
        const almacen = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta = await this.procesar_solicitud_db(almacen.delete(nombre_compañia));

        return respuesta;
    }

    async eliminar_opcion(nombre_compañia, id_opcion) {
        const almacen = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_obtencion = await this.procesar_solicitud_db(almacen.get(nombre_compañia));

        const compañia = respuesta_obtencion.target.result;

        compañia.opciones = compañia.opciones.filter(opcion => opcion.id != id_opcion);

        const respuesta_actualizacion = await this.procesar_solicitud_db(almacen.put(compañia));

        return respuesta_actualizacion;
    }

    async eliminar_recarga(nombre_compañia, nombre_opcion, id_recarga) {
        const almacen = this.iniciar_transaccion(["recargas"], "recargas");

        const respuesta_obtencion = await this.procesar_solicitud_db(almacen.get(nombre_compañia));

        const compañia = respuesta_obtencion.target.result;

        const opcion = compañia.opciones.find(op => op.nombre == nombre_opcion);

        if (opcion) {
            opcion.recargas = opcion.recargas.filter(recarga => recarga.id != id_recarga);
        }

        const respuesta_actualizacion = await this.procesar_solicitud_db(almacen.put(compañia));

        return respuesta_actualizacion;
    }
}