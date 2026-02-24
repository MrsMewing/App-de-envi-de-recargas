export function iniciar_animacion_de_espera(informacion_para_animacion_de_espera){    

    const nombre_por_defecto_de_animacion_de_espera = document.querySelector(".loading-spinner p");
    nombre_por_defecto_de_animacion_de_espera.innerText = informacion_para_animacion_de_espera;

    document.getElementById('loading-spinner').classList.remove('hidden');
}

export function detener_animacion_de_espera(){    
    document.getElementById('loading-spinner').classList.add('hidden');
}