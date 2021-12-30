const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    nativeImage
} = require('electron');
const url = require('url');
const path = require('path');
//require('child_process').exec('start "" "c:\\Users"');
const {
    exec
} = require('child_process');
const ComprasController = require('./Controllers/Compras/Cotizador');
const PerfilController = require('./Controllers/Perfil/PerfilController');
const Cotizador = require('./Windows/Cotizador');

///Propiedades para eventos de guardado
if (process.env.NODE_ENV !== 'production') { //Revisa el estado del proyecto desarrollo o produccion
    require('electron-reload')(__dirname, { //Reinicia el proyecto html al guardar
        Electron: path.join(__dirname, '../node_modules', '.bin', 'electron') //Reiniciar electron al guardar cambios en js 
    })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Variables Globales
let mainWindow;
let ProfileWindow;
//Ventana Main comprueba si existe perfil para crearlo o sino proceder a pantall main
//Evento cuando la ventana esta lista "ready"
app.on('ready',  () => {

    (async function () { //Funcion en espera a que una promesa sea devuelta
        var Existencia = await PerfilController.RutaInstalacion();
        if (Existencia == false) {
            CrearPantallaPerfil()
        } else {//crear pantalla main
            CrearPantallaMain();
        }
    })()  
})

//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('NuevaCotizacion', (e, data) => {
    mainWindow.webContents.send('NuevaCotizacion', data); //Se envia evento y data a la pantalla principal
    ComprasController.pdf(data);
    //newProductWindow.close(); //cerrar ventan al terminar evento
});
function CrearPantallaMain() {
     //Propiedades de ventana principal
     mainWindow = new BrowserWindow({
        width: 1200,
        height: 720,
        title: "Principal",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });

    //Maximizar ventana
    //mainWindow.maximize();
    //Ruta donde se carga el html de la ventana principal
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }))

    //Inyecta las propiedades del menu
    const mainMenu = Menu.buildFromTemplate(require('./menu.js')) //Importando el menu por mediante url
    Menu.setApplicationMenu(mainMenu); //Inyecta la plantilla de menu a la aplicacion

    //Evento de cierre de ventana
    mainWindow.on('closed', () => {
        app.quit(); //Termina todo el proceso de la aplicacion
    })
}

 /************************************* PERFIL **********************************/
function CrearPantallaPerfil() {
    ProfileWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: "Perfil",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });

    ProfileWindow.removeMenu()//Quitar menu de windows
    //Maximizar ventana
    //mainWindow.maximize();
    //Ruta donde se carga el html de la ventana principal
    ProfileWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/Perfil/Perfil.html'),
        protocol: 'file',
        slashes: true
    })) 
}


//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('RegistrarPerfil', (e, data) => {
    console.log(data)
    let resultado = PerfilController.RegistrarPerfil(data);
    if(resultado){
        CrearPantallaMain();
    } 
});