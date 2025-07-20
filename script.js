document.getElementsByClassName("grid-options")[0].childNodes.forEach(element => {
    element.addEventListener("click", (event)=> {
    
    let contenedor = document.getElementsByClassName("main-content")[0]

    contenedor.style.display = "none"
})  
});
