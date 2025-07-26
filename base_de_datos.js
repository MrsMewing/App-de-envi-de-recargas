let recargas = [
    {
        compañia: "tigo",
        opciones: [
            {
                nombre: "todo incluido",
                recargas: [
                    {
                    compañia: "tigo",
                    tipo: "todo incluido",
                    precio: "8",
                    descripcion: "1 día de internet de 800MB",
                    ussd: "*777*1326*7*4*2*-telefono-*1#"
                },
                ]
            },
            {
                nombre: "solo internet",
                recargas: [
                {
                    compañia: "tigo",
                    tipo: "internet",
                    precio: "8",
                    descripcion: "1 día de internet de 800MB",
                    ussd: "*777*1326*7*2*1*-telefono-*1#"
                },
                {
                    compañia: "tigo",
                    tipo: "internet",
                    precio: "13",
                    descripcion: "1 día de internet de 800MB",
                    ussd: "*777*1326*7*2*7*-telefono-*1#"
                }]
            },
            {
                nombre: "llamadas y sms",
                recargas: []
            },
            {
                nombre: "todo incluido con VIX",
                recargas: []
            },
            {
                nombre: "acceso futbol",
                recargas: []
            }
        ]
    },
    {
        compañia: "claro",
        opciones: [
            {
                nombre: "internet",
                recargas: []
            }, 
            {
                nombre: "minutos y mensajes", recargas: []
            },
            {
                nombre: "todo incluido", 
                recargas: []
            },
            {
                nombre: "redes sociales", 
                recargas: []
            }
        ]
    }
]

export function obtener_opciones_compañia(criterio_busqueda){
    return recargas.filter((opcion) => opcion.compañia.toLocaleLowerCase() == criterio_busqueda.toLocaleLowerCase());
}