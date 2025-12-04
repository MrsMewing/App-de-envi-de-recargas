let solicitud_de_apertura_de_db = indexedDB.open("historial_recargas", 1);
let base_de_datos_recargas = null;

//manejo de eventos al abrir la base de datos
solicitud_de_apertura_de_db.onupgradeneeded = function (event) {
    base_de_datos_recargas = event.target.result;
    base_de_datos_recargas.createObjectStore("recargas", {keyPath: "id"});
    console.log(base_de_datos_recargas);
}

solicitud_de_apertura_de_db.onsuccess = function (event) {
    base_de_datos_recargas = event.target.result;
    console.log("Base de datos existente, abierta")
}

solicitud_de_apertura_de_db.onerror = function (event) {
    alert("Error en la db: " + event.target.error);
    console.log("Error ", event.target.error);
}

//funciones para interactuar con la base de datos
export function insertar_elementos_en_db(objecto){
    return new Promise((resolve, reject) => {
        const solicitud_de_apertura_de_db = indexedDB.open("historial_recargas", 1);

        solicitud_de_apertura_de_db.onsuccess = function (event) {
            const base_de_datos_recargas = event.target.result;

            const transaccion = base_de_datos_recargas.transaction("recargas", "readwrite");
            const alamacenaciento = transaccion.objectStore("recargas");

            alamacenaciento.add(objecto);

            transaccion.oncomplete = function () { resolve(true)}
        }
    })
}

export function obtener_coleccion_completa_db(){
    return new Promise((resolve, reject) => {
        const solicitud_de_apertura_de_db = indexedDB.open("historial_recargas", 1);

        solicitud_de_apertura_de_db.onsuccess = function (event) {
            const base_de_datos_recargas = event.target.result;

            const transaccion = base_de_datos_recargas.transaction("recargas", "readonly");
            const alamacenaciento = transaccion.objectStore("recargas");

            const datos_de_almacen = alamacenaciento.getAll();

            datos_de_almacen.onsuccess = function () { resolve(datos_de_almacen.result)}
        }
    })
}