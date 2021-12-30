const { app, BrowserWindow, Menu, ipcMain, nativeImage, dialog } = require("electron");
const Cotizador = require('../../Windows/Cotizador'); //Ventana de PDF
const { exec } = require("child_process"); //Ejecutar subprocesos
const path = require("path");
const url = require("url");
var fs = require("fs");
const Controller = {};

//Devuelve la informacion de perfil si existe
Controller.RutaInstalacion = () => {
    let RutaActual = path.join(__dirname);
    var RutaUsuario = "";
    let i = 0;
 
    while (i < 3) {
        RutaUsuario = RutaUsuario + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
        i++;
    }

    RutaUsuario = RutaUsuario + "\Documents\\PromesaAPP";
    if (fs.existsSync(RutaUsuario + '\\Profile.json')) {
        var perfilEnctrado = "0";
        const promesa = new Promise((resolve, reject) =>{
            fs.readFile(RutaUsuario + '\\Profile.json', (err, data) => {
                if (err) throw err;
                perfilEnctrado = JSON.parse(data);
              
               resolve(perfilEnctrado)
            })
        })
         
        return promesa
       
    } else {
        return false
    }
}



Controller.RegistrarPerfil = (data) => {
    let RutaActual = path.join(__dirname);
    var RutaUsuario = "";
    let i = 0;
    let Profile = {
        Usuario: data[0],
        Contraseña: data[1],
        OneDrive: data[2],
        Empresa: 'PROMESA',
        Referencia: 'PROYECTOS MECANICOS ELECTRICOS, SA DE CV',
        Direccion: 'Av. Cristobal Colón #1046 Ote, Oficina F',
        LugarTelefono: 'Monterrey Nuevo Leon. Tel 8340 6203'

    }
    var dataJSON = JSON.stringify(Profile);

    while (i < 3) {
        RutaUsuario = RutaUsuario + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
        i++;
    }

    RutaUsuario = RutaUsuario + "\Documents\\PromesaAPP";
    if (fs.existsSync(RutaUsuario)) {
        fs.writeFileSync(RutaUsuario + '\\Profile.json', dataJSON);
        return true
    } else {
       
        return false
    }
}

 




module.exports = Controller;