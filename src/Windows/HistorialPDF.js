const windowAdmin = {};
const {BrowserWindow,ipcMain} = require('electron');

const url = require('url');
const path = require('path');
const Controller = require('../Controllers/Compras/Cotizador');
var moment = require("moment"); // require
const readXlsxFile = require('read-excel-file/node')


let VentanaExt;

//Ventana Modal
windowAdmin.CrearVentana = (RutaActual) => {
    //Propiedades de ventana Modal
    VentanaExt = new BrowserWindow({
        width: 1366,
        height: 768,
        title: "MalwarePig",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });

    module.exports.VentanaHistorialPDF = VentanaExt;
    //Maximizar ventana
    //VentanaExt.maximize();
    //Desactivar la barra de menu
    //VentanaExt.setMenu(null);
    //Ruta donde se carga el html de la ventana Modal
    //let RutaActual = path.join(__dirname, '/views/Modal.html')
    /* console.log("RutaActual "+ RutaActual) */
    VentanaExt.loadURL(url.format({
        pathname: RutaActual,
        protocol: 'file',
        slashes: true
    }))

    
    //Evento de cierre de ventana
    VentanaExt.on('closed', () => {
        VentanaExt = null; //Limpia la ventana
    })
}


///Evento para escuchar eventos de ventanas secundarias
ipcMain.on('ReporteCotizaciones', (e, data) => {
    (async function () { //Funcion en espera a que una promesa sea devuelta
        console.log("ReporteCotizaciones")
        let Arreglo = await Controller.Historial(data)
        VentanaExt.webContents.send('RespuestaHistorial', Arreglo); //Se envia evento y data a la pantalla principal
    })()
});


//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('EjecutarArchivoPDF', (e, data) => {
    console.log(data)
    Controller.EjecutarArchivoPDF(data)
});


//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('ExportRarPDF', (e, data) => {
    console.log(data)
    Controller.ComprimirRar(data)
});


//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('SolicitarObra', (e) => {
    (async function () { //Funcion en espera a que una promesa sea devuelta
        console.log("SolicitarObra")
        let Arreglo = await Controller.ListaObras()
        VentanaExt.webContents.send('CargaObra', Arreglo); //Se envia evento y data a la pantalla principal
    })()
});

module.exports = windowAdmin;