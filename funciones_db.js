
//guardar el id de cada elemento que he ido seleccionando, hasta el ultimo elemento que sera el objetivo
let RASTREO_DE_IDS = [];

export function guardar_id(indice){
    RASTREO_DE_IDS.push(indice);
}

export function quitar_id(indice){
    const indice_objetivo = RASTREO_DE_IDS.indexOf(indice);

    if (indice_objetivo < 0) return; 

    RASTREO_DE_IDS.splice(indice_objetivo, 1);
}

export function eliminacion_de_elemento(db, IDS) {

    function busqueda_de_elemento(elementos, index_id) {

        if (!elementos || index_id >= IDS.length) return;

        const id_actual = IDS[index_id];

        for (let i = 0; i < elementos.length; i++) {
            const elemento = elementos[i];

            if (elemento.id === id_actual) {

                if (index_id === IDS.length - 2) {

                    const id_objetivo = IDS[index_id + 1];

                    const indice_real = elemento.opciones.findIndex(
                        el => el.id === id_objetivo
                    );

                    if (indice_real !== -1) {
                        elemento.opciones.splice(indice_real, 1);
                    }

                    return;
                }

                return busqueda_de_elemento(elemento.opciones, index_id + 1);
            }
        }

        return;
    }

    busqueda_de_elemento(db, 0);
}