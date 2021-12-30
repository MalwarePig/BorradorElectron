const windowAdmin = {};
const {
    BrowserWindow,
    ipcMain
} = require('electron');
const ComprasController = require('../Controllers/Compras/Cotizador');
const url = require('url');
const path = require('path');
var moment = require("moment"); // require
const readXlsxFile = require('read-excel-file/node')
var fs = require("fs");
var VentanaPDF;

//Ventana Modal
windowAdmin.CrearVentana = (RutaActual) => {
    //Propiedades de ventana Modal
    VentanaPDF = new BrowserWindow({
        width: 1366,
        height: 900,
        title: "MalwarePig",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    });
    module.exports.VentanaPDF = VentanaPDF;

    //Maximizar ventana
    //VentanaPDF.maximize();
    //Desactivar la barra de menu
    //VentanaPDF.setMenu(null);
    //Ruta donde se carga el html de la ventana Modal
    //let RutaActual = path.join(__dirname, '/views/Modal.html')
    console.log("RutaActual " + RutaActual)
    VentanaPDF.loadURL(url.format({
        pathname: RutaActual,
        protocol: 'file',
        slashes: true
    }))

    //Evento de cierre de ventana
    VentanaPDF.on('closed', () => {
        VentanaPDF = null; //Limpia la ventana
    })
}

/*
//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('ReporteCotizaciones', (e, data) => {
    (async function () { //Funcion en espera a que una promesa sea devuelta
        let Arreglo = await ComprasController.Historial(data)
        VentanaPDF.webContents.send('RespuestaHistorial', Arreglo); //Se envia evento y data a la pantalla principal
    })()
});
*/

//Evento para escuchar eventos de ventanas secundarias
ipcMain.on('SolicitarProveedor', (e) => {
	let RutaActual = path.join(__dirname);
    let RutaClientes = "";
	var RutaUsuario = "";
	let i = 0;
	var perfilEnctrado = "0";
	while (i < 3) {
		RutaUsuario = RutaUsuario + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
		i++;
	}

	RutaUsuario = RutaUsuario + "\Documents\\PromesaAPP";
	data = fs.readFileSync(RutaUsuario + '\\Profile.json');//se lee perfil
	perfilEnctrado = JSON.parse(data);
	console.log(perfilEnctrado)
	Instalacion = perfilEnctrado.OneDrive;
	console.log("Instalacion:" + Instalacion)
	if (Instalacion == 'C') { //Si la instalacion es en disco C
		RutaActual = path.join(__dirname);
		let i = 0;
		while (i < 3) {
			RutaClientes = RutaClientes + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
			i++;
		}

        RutaClientes = RutaClientes + "OneDrive\\PROMESA\\Proveedores\\PROVEEDORES.xlsx"; //Se concatena ruta exacta de usuario
		console.log("C:" + RutaClientes)
	} else {
        RutaClientes = "D:\OneDrive\\PROMESA\\Proveedores\\PROVEEDORES.xlsx"; //Se concatena ruta exacta de usuario
		console.log("D:" + RutaClientes)
	}

 

    // File path.
    readXlsxFile(RutaClientes).then((rows) => {
        VentanaPDF.webContents.send('CargaProveedor', rows); //Se envia evento y data a la pantalla principal
    })
});
 
module.exports = windowAdmin;