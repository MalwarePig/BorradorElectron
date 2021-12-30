const Cotizador = require('./Windows/Cotizador');
const HistorialPDF = require('./Windows/HistorialPDF');
const url = require('url');
const path = require('path');

let newProductWindow;

///Menu
const templateMenu = [ //Plantilla de Menu
    {
        label: 'Archivo',
        submenu: [{
            label: 'Exit',
            accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q', //Compara si es Mac o Windows
            click() {
                app.quit(); //Termina todo el proceso de la aplicacion
            }
        }],
    },
    {
        label: "Cotizaciones",
        submenu: [{
            label: 'Nueva',
            accelerator: 'Ctrl+N',
            click() {
                let Destino = path.join(__dirname, 'views/Compras/Cotización/NuevoPDF.html'); //Ruta destino
                /*  console.log("Ruta menu: " + Destino) */
                Cotizador.CrearVentana(Destino);
            }
        }, {
            label: 'Historial',
            accelerator: 'Ctrl+H',
            click() {
                let Destino = path.join(__dirname, 'views/Compras/Cotización/HistorialPDF.html'); //Ruta destino
                /*  console.log("Ruta menu: " + Destino) */
                HistorialPDF.CrearVentana(Destino);
            }
        }]
    }
]

console.log("entorno: "+ typeof( process.env.NODE_ENV) + "*" +process.env.NODE_ENV+ "*"); 
if ('development '==process.env.NODE_ENV) { //Revisa el estado del proyecto desarrollo o produccion
  templateMenu.push({
        label: 'DevTolls',
        submenu: [{
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+p',
                click(item, focusedWindows) {
                    focusedWindows.toggleDevTools(); //Muestra la ventana de desarrollo web
                }
            },
            {
                role: 'reload' //Reinicia la app
            }
        ]
    })
}
module.exports = templateMenu;

 