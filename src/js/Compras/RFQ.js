const {
    ipcRenderer,
    dialog
} = require('electron');
var moment = require('moment'); // require
var $ = jQuery = require('jquery')
const Swal = require('sweetalert2')
const xlsxFile = require('read-excel-file/node');
const readXlsxFile = require('read-excel-file/node')

var TablaClientes;
//=========================================== AGREGA FILA DE REGISTRO EN NOTAS =================================================//
function AddNota() {
    let Unidad = document.getElementById("Unidad").value;
    let Cantidad = document.getElementById("Cantidad").value;
    let Descripción = document.getElementById("Descripcion").value;
    let PU = document.getElementById("PU").value;
    let Descuento = document.getElementById("Descuento").value || 0;

    console.log(Unidad, Cantidad, Descripción, PU, Descuento);
    var Arreglo = [Unidad, Cantidad, Descripción, PU, Descuento];

    var Condicion = true; //para campos vacios

    for (var a in Arreglo) { //recorrer arreglo en busca de campos vacios
        if (Arreglo[a].length == 0) {
            Condicion = false; //si algun campo esta vacio cambia a falso
        }
    }

    if (Condicion == true) { //si todos los campos estan llenos avanza
        var TablaLineas = document.getElementById('TablaLineas').getElementsByTagName('tbody')[0];
        // inserta una fila al final de la tabla
        var newRow = TablaLineas.insertRow(TablaLineas.rows.length);
        let indice = (TablaLineas.rows.length);
        newRow.setAttribute("id", "fila" + indice); //se asigna id al incrementar cada fila +1 para contar el encabezado
        for (var x = 0; x < Arreglo.length; x++) {

            // inserta una celda en el indice 0
            var newCell = newRow.insertCell(x);
            // adjuntar el texto al nodo
            var newText = document.createTextNode(Arreglo[x]);
            newCell.appendChild(newText);
            if (x == 4) { //Si termina de registrar datos crear el boton
                var newCell = newRow.insertCell(5); //CREAR CELDA onclick="CrearNota()"
                newCell.innerHTML = '<button id="' + x + '" class="btn btn-danger" name="btn" onclick="EliminarFila(' + indice + ')"> <i class="far fa-minus-square"></i> </button>';
            }
        }
    }
    LimpiarProducto();
}


//=========================================== ELIMINAR FILA DE REGISTRO EN NOTAS =================================================//
function EliminarFila(index) {
    $("#fila" + index).remove();
}

//=========================================== crear pdf =================================================//
//console.log(moment().format('MMMM Do YYYY, h:mm:ss a')); // October 28th 2021, 3:13:21 pm)
//Mandar datos a back para impresion PDF
function Imprimir() {
    try {

        //Datos Empresa
        const N_FechaRegistro = document.getElementById("Fecha").value;
        const Responsable = document.getElementById("Atiende").value;
        const Formato = document.getElementById("Formato").value;
        const Codigo = document.getElementById("Codigo").value;
        const Obra = document.getElementById("Obra").value;
        const Direccion = document.getElementById("Direccion").value;
        const Archivo = document.getElementById("archivo").value;
        const Proveedor = document.getElementById("Proveedor").value;

        var tabla = document.getElementById("TablaLineas");
        var total = tabla.rows.length //Total de filas

        console.log("Total lineas", total)
        var Arreglo = [];
        //let Folio,Producto,Entregado,Estado,OT,Estatus,Maquina
        for (var j = 1; j <= total - 1; j++) { //filas
            //var dato = tabla.rows[j].cells[h].childNodes[0].nodeValue;
            Unidad = tabla.rows[j].cells[0].childNodes[0].nodeValue;
            Cantidad = tabla.rows[j].cells[1].childNodes[0].nodeValue;
            Descripcion = tabla.rows[j].cells[2].childNodes[0].nodeValue;
            PU = tabla.rows[j].cells[3].childNodes[0].nodeValue;
            Descuento = tabla.rows[j].cells[4].childNodes[0].nodeValue;

            Tabla = [j, Cantidad, Unidad, PU, Descripcion, Descuento, N_FechaRegistro, Responsable, Formato, Codigo, Obra, Direccion, Archivo, Proveedor];
            Arreglo.push(Tabla);
        } //fin filas

        console.table([Arreglo])

        ipcRenderer.send('NuevaCotizacion',
            Arreglo); //desde el evento eventProductNew se envia el objeto
        LimpiarPantalla();
    } catch (error) {
        console.log(error)
    }
}


function CargarExcel(e) {
    console.log("Se esta leyendo excel")
    var TablaLineas = document.getElementById('TablaLineas').getElementsByTagName('tbody')[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = function (e) {
        var data = new Uint8Array(reader.result);
        var wb = XLSX.read(data, {
            type: 'array'
        });
        var htmlstr = XLSX.write(wb, {
            sheet: "Hoja1",
            type: 'binary',
            bookType: 'html'
        }); //obtener tabla
        //console.log(htmlstr);
        //Find desired cell
        var desired_cell = $('#wrapper')[0].innerHTML += htmlstr; //insertar tabla en html
        var tabla = document.getElementById("wrapper");
        var total = tabla.rows.length //Total de filas

        for (var i = 0; i < total; i++) {
            $("#fila" + i).remove(); //elimina los elementos con id Rows
        }
        var Arreglo = [];

        for (var j = 1; j < total; j++) { //filas

            console.log(tabla.rows[j].cells[0].childNodes.length)
            if (tabla.rows[j].cells[0].childNodes.length > 0) {
                Unidad = tabla.rows[j].cells[0].childNodes[0].nodeValue;
                Cantidad = tabla.rows[j].cells[1].childNodes[0].nodeValue;
                Descripcion = tabla.rows[j].cells[2].childNodes[0].nodeValue;
                PU = tabla.rows[j].cells[3].childNodes[0].nodeValue;
                Descuento = tabla.rows[j].cells[4].childNodes[0].nodeValue || 0;
                Tabla = [Unidad, Cantidad, Descripcion, PU, Descuento];

                var limite = TablaLineas.rows.length;

                // inserta una fila al final de la tabla
                var newRow = TablaLineas.insertRow(TablaLineas.rows.length);
                let indice = (TablaLineas.rows.length);
                newRow.setAttribute("id", "fila" + indice); //se asigna id al incrementar cada fila +1 para contar el encabezado
                for (var x = 0; x < Tabla.length; x++) {
                    // inserta una celda en el indice 0
                    var newCell = newRow.insertCell(x);
                    // adjuntar el texto al nodo
                    var newText = document.createTextNode(Tabla[x]);
                    newCell.appendChild(newText);
                    if (x == 4) { //Si termina de registrar datos crear el boton
                        var newCell = newRow.insertCell(5); //CREAR CELDA onclick="CrearNota()"
                        newCell.innerHTML = '<button id="' + x + '" class="btn btn-danger" name="btn" onclick="EliminarFila(' + indice + ')"> <i class="far fa-minus-square"></i> </button>';
                    }
                }
            }
        } //fin filas

        //Limpiar el input
        let inputFile = document.getElementById("input-excel");
        inputFile.value = ''
        //limpiar la tabla pivote
        $("#wrapper").empty()

    }
}



function GuardarRecepcion() { //Ejecutar codigo al dar click en boton
    var i = 0; //Contador para brincar la cabaezera y suar la referencia de indice
    var Arreglo = [];
    $('#wrapper tr').each(function () { //leer una tabla html    
        if (i > 0) { //Iniciar despues de cabezera de tabla y OT sea diferente de Null
            var Producto = $(this).find("td").eq(4).html();
            var Ordenado = 0; //LEER LA TABLA
            var Entregado = $(this).find("td").eq(5).html();
            var Tabla = [Producto, Ordenado, Entregado];

            Arreglo.push(Tabla);
        }
        i++;
    }); //each para recorrer tabla

    $.post("/PostRecepcion", // url
        {
            Arreglo
        }, // data to be submit
        function (Tablas, status) { // success callback
            console.log(Tablas + status);
        })
    alert("Recepción exitosa");
    //setTimeout("redireccionar()", 800); //Tiempo para reedireccionar

    /*var elemento = document.getElementById("wrapper");
    document.body.removeChild(elemento);
    alert("Registrado en BD");*/
}



ipcRenderer.on('PDFCreadoNotify', (e, data) => { //Recibir el data del js principal
    if (data == 'true') {
        Swal.fire('Archivo creado correctamente')
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se ha creado archivo',
        })
    }
})


function CargarProveedor() {
    ipcRenderer.send('SolicitarProveedor');

    ipcRenderer.on('CargaProveedor', (e, data) => { //Recibir el data del js principal
        TablaClientes = data;
        var listProveedor = document.getElementById("Proveedor");
        for (let i = listProveedor.options.length; i >= 0; i--) { //Borrar elementos option de select
            listProveedor.remove(i);
        }

        var option = document.createElement("option");
        option.selected = true;
        option.disabled = true;
        option.text = 'Proveedores';
        listProveedor.add(option);
        for (let index = 1; index < data.length; index++) {
            option = document.createElement("option");
            option.text = data[index][0];
            listProveedor.add(option);
        }
    })
}

function SeleccionProveedor() {
    var Cliente = document.getElementById("Proveedor").value;
    console.log(Cliente) // 2
    let indice = TablaClientes.map(Columna => Columna[0]).indexOf(Cliente);
    let informacion = TablaClientes[indice][0] + " " + TablaClientes[indice][1] + " " + TablaClientes[indice][2] + " " + TablaClientes[indice][3] + " " + TablaClientes[indice][4] + " " + TablaClientes[indice][5];
    document.getElementById("Direccion").value = informacion;
    //console.log( TablaClientes.map(Columna => Columna[0]).indexOf(Cliente)) 
    //TablaClientes.map().indexOf('Gemak')


}

function LimpiarPantalla() {
    document.getElementById('RegistroSalida').reset();
    $('#RegistroSalida')[0].reset();
   
    $("#Proveedor").val($("#ProveedorDefault").data("default-value"));//Resetear select list

    var TablaAlmacen = document.getElementById('TablaLineas').getElementsByTagName('tbody')[0];
    var limite = TablaAlmacen.rows.length;
    for (var i = 1; i <= limite; i++) {
        $("#fila" + i).remove(); //elimina los elementos con id Rows
    }
}

function LimpiarProducto() {
    document.getElementById("Unidad").value = '';
    document.getElementById("Cantidad").value = '';
    document.getElementById("Descripcion").value = '';
    document.getElementById("PU").value = '';
    document.getElementById("Descuento").value = '';
}





























































/*
    $('#input-excel').change(function (e) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = function (e) {
            var data = new Uint8Array(reader.result);
            var wb = XLSX.read(data, {
                type: 'array'
            });
            var htmlstr = XLSX.write(wb, {
                sheet: "Hoja1",
                type: 'binary',
                bookType: 'html'
            }); //obtener tabla
            //console.log(htmlstr);
            //Find desired cell
            var desired_cell = $('#wrapper')[0].innerHTML += htmlstr; //insertar tabla en html
        }
    }); */


    //funcional
/*
function Lectura(e) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = function (e) {
        var data = new Uint8Array(reader.result);
        // console.log(data)
        var wb = XLSX.read(data, {
            type: 'array'
        });

        //console.log(wb.sheets.A1)
        var htmlstr = XLSX.write(wb, {
            sheet: "Hoja1",
            type: 'binary',
            bookType: 'html'
        }); //obtener tabla
        //console.log(htmlstr);
        //Find desired cell
        console.log(htmlstr)
        var desired_cell = $('#wrapper')[0].innerHTML += htmlstr; //insertar tabla en html
    }
} */
/*
function Lectura(e) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = function (e) {
        var data = new Uint8Array(reader.result);
        // console.log(data)
        var wb = XLSX.read(data, {
            type: 'array'
        });

        xlsxFile('./data.xlsx').then((rows) => {
            console.log(rows);
            console.table(rows);
        })
    }
} */