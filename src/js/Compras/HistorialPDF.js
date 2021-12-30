const {
    ipcRenderer
} = require('electron');
var moment = require('moment'); // require
const Swal = require('sweetalert2')

function MostrarReporte() {
    var fechaInicio = document.getElementById("Anio").value;
    var Obra = document.getElementById("Obra").value;
    //Swal.fire('Any fool can use a computer')
    let TipoReporte = fechaInicio + '|' + '-' + '|' + Obra;
 
    ipcRenderer.send('ReporteCotizaciones',
        TipoReporte); //desde el evento eventProductNew se envia el objeto


    ipcRenderer.on('RespuestaHistorial', (e, data) => { //Recibir el data del js principal
        var item = document.getElementById("ListaGeneral"); //Limpiar lista
        console.log(data)
        if(data.length == 0){
            Swal.fire({
                icon: 'warning',
                title: 'Alerta',
                text: 'No se han encontrado registros',
            })
        }
        while (item.firstChild) {
            //The list is LIVE so it will re-index each call
            item.removeChild(item.firstChild);
        } 
       
        let li = document.createElement("li"); //Creo un nuevo div para la nueva tarjeta
        li.id = "li-Cabezera";
        li.innerHTML = 'Lista de cotizaciones';
        li.setAttribute('class', 'list-group-item active');
        document.getElementById("ListaGeneral").appendChild(li);
        for (let index = 0; index < data.length; index++) {
            let btn = document.createElement("button"); //Creo un nuevo div para la nueva tarjeta
            btn.setAttribute('id', 'boton' + index);
            btn.setAttribute('onclick', 'AbrirPDF("' + data[index] + '")');
            btn.setAttribute('class', 'btn btn-secondary btn-lg btn-block');
            btn.innerHTML = data[index]

            let li = document.createElement("li"); //Creo un nuevo div para la nueva tarjeta
            li.id = "li" + index;
            li.setAttribute('class', 'list-group-item');
            li.appendChild(btn);
            document.getElementById("ListaGeneral").appendChild(li);
        }
        //Crear el div
    })
}


function AbrirPDF(NombreArchivo) {
console.log("Archivo: " + NombreArchivo)
    let data = {
        Obra: document.getElementById("Obra").value,
        Documento: NombreArchivo,
        Anio: document.getElementById("Anio").value
    }

    ipcRenderer.send('EjecutarArchivoPDF',
    data); //desde el evento eventProductNew se envia el objeto
}

function CargarFechas() {
    var listFechas = document.getElementById("Anio");
    let anoActual = moment().format('YYYY');
    let ArregloFechas = [];
    let FechaMin = (parseInt(anoActual) - 25);
    let FechaMax = (parseInt(anoActual) + 2);
    for (let i = listFechas.options.length; i >= 0; i--) { //Borrar elementos option de select
        listFechas.remove(i);
    }

    for (let index = FechaMin; index <= FechaMax; index++) {
        var option = document.createElement("option");
        if(parseInt(anoActual) == index){
            option.selected = true;
        }
        option.text = index;
        option.value = index;
        listFechas.add(option);
    }

    CargarObra();
}

function Exportar() {
    let Obra = document.getElementById("Obra").value;
    ipcRenderer.send('ExportRarPDF',
    Obra); //desde el evento eventProductNew se envia el objeto
}
 
function CargarObra() {

    ipcRenderer.send('SolicitarObra');
    ipcRenderer.on('CargaObra', (e, data) => { //Recibir el data del js principal
   console.log(data)
        var listObra = document.getElementById("Obra");
        for (let i = listObra.options.length; i >= 0; i--) { //Borrar elementos option de select
            listObra.remove(i);
        }

        var option = document.createElement("option");
        option.selected = true;
        option.disabled = true;
        option.text = 'Obras';
        listObra.add(option);
        for (let index = 0; index < data.length; index++) {
            option = document.createElement("option");
            option.text = data[index];
            option.value = data[index];
            listObra.add(option);
        }
    })
}