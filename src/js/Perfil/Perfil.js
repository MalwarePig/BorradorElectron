const {ipcRenderer,dialog} = require('electron');
 
function AddPerfil() {
    let Nombre = document.getElementById("Nombre").value;
    let Contrasena = document.getElementById("Contrasena").value;
    let OneDrive = document.getElementById("OneDrive").value;

    let data = [Nombre,Contrasena,OneDrive];
    console.log(Nombre, Contrasena, OneDrive);
    if (OneDrive == '-') {
        alert('Selecciona unidad de instalación de OneDrive');
    } else {
        ipcRenderer.send('RegistrarPerfil', data); //desde el evento eventProductNew se envia el objeto
    }


    $('#FormularioPerfil')[0].reset();
}