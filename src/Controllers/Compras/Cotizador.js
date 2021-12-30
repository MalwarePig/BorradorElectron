const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	nativeImage,
	dialog
} = require("electron");
//const WinHistorialPDF = require('../../Windows/HistorialPDF');//Ventana de PDF
const Cotizador = require('../../Windows/Cotizador'); //Ventana de PDF
const {
	exec
} = require("child_process"); //Ejecutar subprocesos
const {
	jsPDF
} = require("jspdf");
var AdmZip = require("adm-zip");
var moment = require("moment"); // require
const path = require("path");
require("jspdf-autotable");
const url = require("url");
var fs = require("fs");
const {
	resolve
} = require("path");
const Controller = {};
//Crear ventanas de dialogo para guardado

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

var RutaObra = "";
var RutaAdministracion = "";
var RutaOC = "";
var anoActual = moment().format("YYYY");
var RutaActual = "";
var RutaAnual = "";
var Instalacion = ""; //Disco de instalacion
var Empresa = ""; //Nombre de la empresa ''PROMESA
var Referencia = ""; //Referencia de la empresa 'PROYECTOS MECANICOS ELECTRICOS, SA DE CV',
var DireccionEmp = ""; //Direccion de la empresa 'Av. Cristobal Colón #1046 Ote, Oficina F',
var LugarTelefono = ""; //Estado y telefono 'Monterrey Nuevo Leon. Tel 8340 6203'
var RutaUsuario = ""
//Obtener ruta de año actual


function GetRutaAnual() {

	console.log("GenerandoRutas");

	RutaAnual = "";
	RutaActual = "";
	RutaActual = path.join(__dirname);
	Empresa = ""; //Nombre de la empresa ''PROMESA
	Referencia = ""; //Referencia de la empresa 'PROYECTOS MECANICOS ELECTRICOS, SA DE CV',
	DireccionEmp = ""; //Direccion de la empresa 'Av. Cristobal Colón #1046 Ote, Oficina F',
	LugarTelefono = ""; //Estado y telefono 'Monterrey Nuevo Leon. Tel 8340 6203'
	RutaUsuario = "";
	let i = 0;
	var perfilEnctrado = "0";
	while (i < 3) {
		RutaUsuario = RutaUsuario + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
		i++;
	}

	RutaUsuario = RutaUsuario + "\Documents\\PromesaAPP";
	let data = fs.readFileSync(RutaUsuario + '\\Profile.json'); //se lee perfil
	perfilEnctrado = JSON.parse(data);
	console.log(perfilEnctrado)
	Instalacion = perfilEnctrado.OneDrive;
	Empresa = perfilEnctrado.Empresa;
	Referencia = perfilEnctrado.Referencia;
	DireccionEmp = perfilEnctrado.Direccion;
	LugarTelefono = perfilEnctrado.LugarTelefono;
	console.log("Instalacion:" + Instalacion)
	if (Instalacion == 'C') { //Si la instalacion es en disco C
		RutaActual = path.join(__dirname);
		let i = 0;
		while (i < 3) {
			RutaAnual = RutaAnual + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
			i++;
		}

		RutaAnual = RutaAnual + "OneDrive\\PROMESA\\" + anoActual;
		console.log("C:" + RutaAnual)
	} else {
		RutaAnual = 'D:\OneDrive\\PROMESA\\' + anoActual;
		console.log("D:" + RutaAnual)
	}

}

Controller.pdf = (data) => {
	GetRutaAnual();
	//Total de lineas simples optimas 15
	//Total de lineas dobles optimas 10
	console.log("Aqui ya se hace el pdf: " + data.length);
	let MargenTopTabla = 95; //Linea de inicio de tabla de productos
	var LimiteCritico = 254;
	var acomulado = MargenTopTabla;
	//var doc = new jsPDF();
	var doc = new jsPDF('p', 'mm', 'a4', true); //Orientación, medidas usadas, tipo de hoja, Compreció?

	var Hojas = 0; //Contador de hojas
	let totalRegistros = data.length; //Total de registros  data
	let FilaActual = 0; //es el indice que recorre el data
	let LimiteFilas = 0; //es el indice que recorre el data
	var SaltoLineas = 0; //Linea donde se debe incertar TablaTotales
	let Subtotal = 0;
	let TotalDescuento = 0;
	var filasPorHojas = [] //Contiene la cantidad de filas por hojas
	var Restantes = false //Lineas que no entnran en fase critica
	var fila = 0;
	var TotalSola = false //Tabla total no cabe en ultima hora y se debe agregar extra
	/*********************************************************************************************************
	 *********************************** Determinar Hojas y filas de datos ************************************
	 **********************************************************************************************************/
	console.log("totalRegistros: " + totalRegistros)
	for (fila; fila < totalRegistros; fila++) {

		console.log("Recorre fila: " + fila)
		let ValorFila = data[fila][4].length //Descripcion de producto
		//Determinar el valor acomulado en filas
		if (ValorFila > 70) { //Limit son 70 caracteres
			acomulado = acomulado + 11;
		} else {
			acomulado = acomulado + 8;
		}

		if (acomulado > LimiteCritico) { //206
			filasPorHojas[Hojas] = (fila+1)
			acomulado = MargenTopTabla;
			Restantes = false
			console.log("acomulado   critico: " + acomulado)
			if (fila == (totalRegistros - 1)) {//si es el ultimo registro
				Hojas++
				console.log("acomulado ultimo registro critico: " + acomulado)
				acomulado = MargenTopTabla;
				filasPorHojas[Hojas] = 0;
			}else{
				Hojas++
			}
		} else {//si no entra en critico y sobran lineas 
			Restantes = true
			console.log("acomulado libre: " + acomulado)

			if ((fila == (totalRegistros - 1)) && (acomulado > 220)) {//si es el ultimo registro el total se debe agregar a nueva hoja
				console.log("Libre 1")
				acomulado = MargenTopTabla;
				TotalSola = true
			} else if ((fila == (totalRegistros - 1)) && (acomulado <= 220)) {
				console.log("Libre 2")
				TotalSola = false
			}
		}
	}

	//Si quedan restantes se agregan al resto como residuo
	if (Restantes == true) {
		filasPorHojas.push(fila)
	}



	console.log("Array original ")
	console.log(filasPorHojas)



	//****Arreglo correcto de limites por hoja*/
	var Limites = [];
	let TotaldeLimites = Object.keys(filasPorHojas).length
	console.log("Total de Hojas en array " + TotaldeLimites)
	for (let index = 0; index < TotaldeLimites; index++) {
		if (index == 0) {//si es el primero se queda igual
			Limites.push(filasPorHojas[0])
		} else if (index < TotaldeLimites) {//si es despues del primero y antes del ultimo
			Limites.push((filasPorHojas[index] - filasPorHojas[(index - 1)]));
		} else if (index == (TotaldeLimites - 1) && (Restantes == true)) {
			Limites.push(filasPorHojas[(filasPorHojas.length - 1)])
			Hojas++
		}
		//Aqui pongo el total
		if (index == (TotaldeLimites - 1) && (TotalSola == true) && (acomulado < 220)) {
			Limites.push(1)
		} else if (index == (TotaldeLimites - 1) && (TotalSola == true)) {
			//Limites.push(1) 
		}
	}

	if (Limites.length == 0) {
		Limites.push(totalRegistros);
		Hojas++
	}


	/*********************************************************************************************************
	 *********************************** Recorrido de hojas ************************************
	 **********************************************************************************************************/
	console.log("Hojas: " + Limites.length)
	console.log("indice: ")
	console.log(Limites)
	var Fecha = data[0][6] || '-';
	var Responsable = data[0][7] || '-'; //Nombre de quien emite
	var Formato = data[0][8] || '-'; //Tipo de documento
	var Codigo = data[0][9] || '-'; //Folio o codigo del documento
	var Obra = data[0][10] || '-';
	var Direccion = data[0][11] || '-';
	var Proveedor = data[0][13] || '-';
	FilaActual = 0;
	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////// LOGO ////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////
	let ruta = path.join(__dirname, "../../assets/promesa.png");
	const Logo = nativeImage.createFromPath(ruta);

	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////// ENCABEZADO //////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////

	for (let h = 1; h <= Limites.length; h++) { //Recorrer las hojas
		doc.setFontSize(9);
		doc.setTextColor(25);
		doc.setTextColor("#000000"); //COLOR GRIS
		doc.setFont("arial", "bold"); //TIMES Y NEGRITAS
		doc.text(Empresa, 185, 10);
		doc.setFont("calibri", "normal");
		doc.text(Referencia, 200, 15, null, null, "right");
		doc.text(DireccionEmp, 200, 20, null, null, "right");
		doc.text(LugarTelefono, 200, 25, null, null, "right");
		doc.setFontSize(5);
		doc.line(10, 28, 200, 28); //x1, y1, x2, y2


		/////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////// POST ENCABEZADO /////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////
		doc.addImage(Logo.toPNG(), 10, 2, 100, 25); //EJE X,Y  -  ANCHO Y ALTO MORELOS
		doc.setFontSize(20);
		doc.text(Formato + " #", 10, 45);
		doc.setTextColor("#1321c3"); //COLOR AZUL
		doc.text(Codigo, 38, 45);
		doc.setTextColor("#000000"); //COLOR GRIS
		doc.text("Fecha Orden:", 100, 45);
		doc.text("OBRA:", 100, 55);
		doc.setTextColor("#e82017"); //COLOR ROJO
		doc.text(Fecha, 140, 45);
		doc.setFont("arial", "bold"); //TIMES Y NEGRITAS
		doc.setTextColor("#1321c3"); //COLOR Azul
		doc.text(Obra, 127, 55);
		doc.setTextColor("#000000"); //COLOR GRIS
		doc.setFont("arial", "normal");
		doc.setFontSize(9);
		let lines = doc.splitTextToSize(Direccion, 80); //420 el ancho de la fila para el texto

		doc.text(lines, 10, 50); //Bloque izquierdo
		//doc.text(lines, 100, 50); //Bloque derecho

		doc.line(10, 70, 200, 70); //x1, y1, x2, y2

		console.log("Entrando en hoja : " + h);
		let TablaBody = []; //Cuerpo de tabla a imprimir
		for (let f = 0; f < Limites[(h - 1)]; f++) { //Recorrer las filas permitidas
			console.log("Inidice fila f for: " + f + " Contador de fila: " + FilaActual + " Con tope de : " + Limites[(h - 1)] + " Indice data: ")
			//Limite de 15 filas de la tabla
			if (h == (Limites.length) && (TotalSola == true)) {//En el caso que la tabla Total se muestre sola
				console.log("especial")
				let Contador = 0;
				let Cantidad = 0;
				let Unidad = '-';
				let PU = 0;
				let Descripcion = '-';
				let Descuento = 0;
				let Importe = Cantidad * PU;
				let CalculoDescuento = (Importe * Descuento) / 100;
				TotalDescuento = TotalDescuento + CalculoDescuento;
				Importe = Importe - CalculoDescuento;
				Subtotal = Subtotal + Importe;
				Importe = '$' + Importe.toLocaleString("es-MX");
				PU = '$' + PU;
				let Arreglo = [Contador, Cantidad, Unidad, Descripcion, PU, Importe];
				TablaBody.push(Arreglo);
				FilaActual++;
			} else {
				let Contador = data[FilaActual][0] || 0;
				let Cantidad = data[FilaActual][1] || 0;
				let Unidad = data[FilaActual][2] || '-';
				let PU = data[FilaActual][3] || 0;
				let Descripcion = data[FilaActual][4] || '-';
				let Descuento = data[FilaActual][5] || 0;
				let Importe = Cantidad * PU;
				let CalculoDescuento = (Importe * Descuento) / 100;
				TotalDescuento = TotalDescuento + CalculoDescuento;
				Importe = Importe - CalculoDescuento;
				Subtotal = Subtotal + Importe;
				Importe = '$' + Importe.toLocaleString("es-MX");
				PU = '$' + PU;
				let Arreglo = [Contador, Cantidad, Unidad, Descripcion, PU, Importe];
				TablaBody.push(Arreglo);
				FilaActual++;
			}
		}

		/////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////// TABLA ///////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////
		doc.text(10, 75, "Listado de articulos");
		// var columns = ["#", "CANT", "UN"];
		var columns = ["#", "CANT", "UN", "DESCRIPCIóN", "PU", "IMPORTE"];

		doc.autoTable(columns, TablaBody, {
			styles: {
				halign: 'center'
			},
			columnStyles: { //Formato de columnas
				0: { halign: 'center' },
				1: { halign: 'center' },
				2: { halign: 'center' },
				3: { halign: 'left' },
				4: { halign: 'center' },
				5: { halign: 'center' }
			},
			theme: "striped", //Striped: Azul, grid: Verde
			margin: {
				top: 80,
				left: 10,
				right: 10,
			}
		});
		doc.text(185, 290, (h) + "/" + Limites.length); //Contador de paginas
		if (h < Limites.length) {
			doc.addPage();
		}
	} //Fin de hojas
	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////// TABLA TOTALES ///////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////
	console.log("Acomulado antes de insertar tabla: " + acomulado)
	doc.cell(140, acomulado, 30, 10, "Descuento:", 4, "center"); //cell(x, y, width, height, text, lineNumber, align)
	doc.cell(171, acomulado, 30, 10,"$" + TotalDescuento.toLocaleString("es-MX"), 4, "center"); //cell(x, y, width, height, text, lineNumber, align)
	
	doc.cell(140, acomulado, 30, 10, "Subtotal:", 3, "center"); //cell(x, y, width, height, text, lineNumber, align)
	doc.cell(171, acomulado, 30, 10, "$" + Subtotal.toLocaleString("es-MX"), 3, "center"); //cell(x, y, width, height, text, lineNumber, align)

	doc.cell(140, acomulado, 30, 10, "IVA 16%", 2, "center"); //cell(x, y, width, height, text, lineNumber, align)
	doc.cell(171, acomulado, 30, 10, "$" + (Subtotal * 0.16).toLocaleString("es-MX"), 2, "center"); //cell(x, y, width, height, text, lineNumber, align)
	
	doc.cell(140, acomulado, 30, 10, "Total:", 1, "center"); //cell(x, y, width, height, text, lineNumber, align)
	doc.cell(171, acomulado, 30, 10, "$" + (Subtotal + Subtotal * 0.16).toLocaleString("es-MX"), 1, "center"); //cell(x, y, width, height, text, lineNumber, align)
	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////// FIRMA RESPONSABLE ///////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////
	doc.setTextColor("#000000"); //COLOR GRIS
	doc.setFontSize(9);
	doc.line(70, 270, 140, 270); //x1, y1, x2, y2
	doc.text(95, 268, Responsable);
	doc.text(95, 275, "RESPONSABLE");

	console.log(doc.getNumberOfPages())
	doc.save("RFQ" + ".pdf");

	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////// COPIAR ARCHIVO EN RUTA //////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////

	var Obra = data[0][10];

	NombreArchivo = data[0][12];
	RutaAdministracion = RutaAnual + "\\1. Administración";

	/* Leer arhcivos syncrona
		  var archivos = fs.readdirSync(RutaObra)
		  console.log(archivos);
	   */

	/*  //Copiar fiechro
	  fs.copyFile('RFQ.pdf', RutaAnual + '/Copia.pdf', (err) => {
			  if (err) throw err;
			  console.log('Archivo copiado!');
		  }); */

	/*let RutaDocuments = path.join(__dirname+'../../../../../');
	  console.log(RutaDocuments)
	  fs.copyFile('RFQ.pdf', RutaDocuments+'/OtroRFQ.pdf', (err) => {
		  if (err) throw err;
		  console.log('source.txt was copied to destination.txt');
	  });*/
	RutaActual = RutaActual + '\\download'
	dialog.showSaveDialog({
		title: 'Seleccione carpeta',
		//defaultPath: path.join(__dirname, '../assets/sample.txt'),
		defaultPath: path.join(RutaActual, 'OC ' + NombreArchivo + " " + anoActual + " " + Proveedor + '.pdf'),
		buttonLabel: 'Save',
		// Restricting the user to only Text Files.
		filters: [{
			name: 'pdf',
			extensions: ['pdf', 'docx']
		},],
		properties: []
	}).then(file => {
		if (!file.canceled) {
			fs.copyFile("RFQ.pdf", file.filePath.toString(), (err) => {
				if (err) {
					console.log("Error de copiado pdf");
					Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
				} else {

					RespaldoServidorPDF(NombreArchivo, RutaAnual, RutaAdministracion, anoActual, Proveedor, Obra);
				}
			});
		} else {

			RespaldoServidorPDF(NombreArchivo, RutaAnual, RutaAdministracion, anoActual, Proveedor, Obra);
		}
	}).catch(err => {
		console.log(err)
	});


}

async function RespaldoServidorPDF(NombreArchivo, RutaAnual, RutaAdministracion, anoActual, Proveedor, Obra) {
	let RutaObra = ""
	let NumeroTotalCarpetas = (await Controller.ContarCarpetas() + 1)
	var Existencia = false
	var numeroCarpeta = '';
	let RutaOC = '';
	RutaOC = RutaAdministracion + "\\1. Ordenes de Compra";
	/************************************* RUTA ANUAL **********************************/
	if (fs.existsSync(RutaAnual)) {
		//Validar si existe carpeta en ruta anual 
		if (fs.existsSync(RutaAdministracion)) { //Validar si existe carpeta en ruta 1. Administración

			if (fs.existsSync(RutaOC)) { //Validar si existe carpeta en ruta 1. Oredenes de compra
				/************************************* RUTA RutaOC **********************************/
				fs.readdir(RutaOC, (error, archivos) => {
					if (error) {
						throw error;
					} else {
						//console.log("Contando archivos")
						if (archivos.length > 0) { //Si existen carpetas en administracion
							archivos.map((valores, indice, archivos) => {
								//console.log(valores.split(' ')[1])
								if (valores.split(' ')[1] == Obra) { //Si se encuentra la carpeta de Obra
									Existencia = true;
									numeroCarpeta = valores.split(' ')[0]
								}
							}); //fin map
							if (Existencia == true) { //Se se encontro carpeta
								numeroCarpeta = numeroCarpeta + " " + Obra;
								RutaObra = RutaOC + '\\' + numeroCarpeta;

								if (fs.existsSync(RutaObra)) {
									fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
										if (err) {

											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
										} else {
											exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');

											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
										}
									});
								}
							} else {
								RutaObra = RutaOC + '\\' + NumeroTotalCarpetas + '. ' + Obra;
								fs.mkdir(RutaObra, (error) => {
									// crear la carpeta en ruta anual
									if (error) {
										console.log(error.message);
									} else {

										fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
											if (err) {
												Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
											} else {
												exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');

												Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
											}
										});
									}
								});
							}

						} else { //sin archivos en carpeta administracion
							RutaObra = RutaAdministracion + '\\1. ' + Obra;
							fs.mkdir(RutaObra, (error) => {
								// crear la carpeta en ruta anual
								if (error) {
									console.log(error.message);
								} else {
									fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
										if (err) {
											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
										} else {
											exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');
											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
										}
									});
								}
							});
						}
					}
				});
			} else { //si no existe OC
				fs.mkdir(RutaOC, (error) => {
					// crear la carpeta en ruta anual
					if (error) {
						console.log(error.message);
					} else {
						RutaObra = RutaAdministracion + '\\1. Ordenes de Compra' + '\\1. ' + Obra;
						fs.mkdir(RutaObra, (error) => {
							// crear la carpeta en ruta anual
							if (error) {
								console.log(error.message);
							} else {
								console.log("Directorio Obra creado");
								fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
									if (err) {
										Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
									} else {
										exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');
										Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
									}
								});
							}
						});
					}
				});

			}
		} else { //Si no existe ruta 1. Administracion
			fs.mkdir(RutaAdministracion, (error) => {
				// crear la carpeta en ruta anual
				if (error) {
					console.log(error.message);
				} else {
					fs.mkdir(RutaOC, (error) => {
						// crear la carpeta en ruta anual
						if (error) {
							console.log(error.message);
						} else {
							RutaObra = RutaAdministracion + '\\1. Ordenes de Compra' + '\\1. ' + Obra;
							fs.mkdir(RutaObra, (error) => {
								// crear la carpeta en ruta anual
								if (error) {
									console.log(error.message);
								} else {
									console.log("Directorio Obra creado");
									fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
										if (err) {
											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
										} else {
											exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');
											Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
										}
									});
								}
							});
						}
					});
				}
			});
		}
		/************************************* RUTA ANUAL **********************************/
	} else {
		fs.mkdir(RutaAnual, (error) => { //Crear ruta Anual
			// crear la carpeta en ruta anual
			if (error) {
				console.log("No se logra crear ruta: " + RutaAnual)
				console.log(error.message);
			} else {
				/************************************* RUTA ADMINISTRACION **********************************/
				if (fs.existsSync(RutaAdministracion)) { //Validar si existe carpeta en ruta 1. Administraciónconsole.log("No existe Administracion")
				} else {
					fs.mkdir(RutaAdministracion, (error) => {
						/************************************* RUTA Obra **********************************/
						console.log("Se crea anual/Admin")
						if (fs.existsSync(RutaObra)) {
							console.log("no existe Obra")
						} else {
							fs.mkdir(RutaOC, (error) => {
								// crear la carpeta en ruta anual
								if (error) {
									console.log(error.message);
								} else {
									RutaObra = RutaAdministracion + '\\1. Ordenes de Compra' + '\\1. ' + Obra;
									fs.mkdir(RutaObra, (error) => {
										// crear la carpeta en ruta anual
										if (error) {
											console.log(error.message);
										} else {
											fs.copyFile("RFQ.pdf", RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf", (err) => {
												if (err) {
													Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "false"); //Se envia evento y data a la pantalla principal
												} else {
													exec('"' + RutaObra + "/OC " + NombreArchivo + " " + anoActual + " " + Proveedor + ".pdf" + '"');
													Cotizador.VentanaPDF.webContents.send('PDFCreadoNotify', "true"); //Se envia evento y data a la pantalla principal
												}
											});
										}
									});
								}
							});
						}
					});
				}
			}
		});
	}
	/************************************* RUTA ANUAL **********************************/
}

Controller.Prueba = () => {
	return "Si retorna";
}


Controller.Historial = async (data) => {
	GetRutaAnual();
	var respuesta = "Inicial";
	var fechaInicio = data.split("|")[0]; // categoria o tipo de reporte
	var fechafin = data.split("|")[1]; // Fecha inicial
	var Obra = data.split("|")[2]; // Fecha limite


	let Administración = RutaAnual + '\\1. Administración\\1. Ordenes de Compra\\';

	RutaObra = Administración + Obra;
	console.log(RutaObra)
	const promesa = new Promise((resolve, reject) => {
		//Leer la lista de archivos en un directorio y mostrarlo en lista historial
		if (fs.existsSync(RutaObra)) {
			//Validar si existe carpeta en ruta anual
			fs.readdir(RutaObra, (error, archivos) => {
				if (error) {
					console.log("Sin archivos")
					throw error;
				} else {
					respuesta = "con datos";
					console.log(archivos)
					resolve(archivos);
				}
			});
		} else {
			respuesta = "sin Obra";
			resolve([]);
		}
	});

	return promesa;
};

Controller.EjecutarArchivoPDF = (data) => {
	let Obra = data.Obra;
	let Documento = data.Documento;
	let Anio = data.Anio;

	var RutaObra = "";
	var RutaArchivo = "";

	RutaAnual = '';
	RutaActual = '';
	if (Instalacion == 'C') { //Si la instalacion es en disco C
		RutaActual = path.join(__dirname);
		let i = 0;
		while (i < 3) {
			RutaAnual = RutaAnual + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
			i++;
		}

		RutaAnual = RutaAnual + "OneDrive\\PROMESA\\" + Anio;

	} else {
		RutaAnual = 'D:\OneDrive\\PROMESA\\' + Anio;

	}

	RutaObra = RutaAnual + "\\1. Administración\\1. Ordenes de Compra\\" + Obra;
	RutaArchivo = RutaObra + "\\" + Documento;
	let propiedades = fs.statSync(RutaArchivo);

	// pondría esto pero creo que no funcionaria como en js console.log('nombre del archivo', propiedades.name);
	console.log("tamaño del archivo", propiedades.size); //tamaño
	console.log("Fecha de creacion", propiedades.birthtime);

	//WinHistorialPDF.VentanaHistorialPDF.webContents.send('RutaGuardadaArchivo', 'ssss'); //Se envia evento y data a la pantalla principal
	exec('"' + RutaArchivo + '"');
	//exec("start " + RutaArchivo);
	//exec('start "" "C:\\Users\\EVA-01\\Documents\\Proyectos\\Electron\\BorradorElectron\\RFQ.pdf"');
};

Controller.ComprimirRar = (Obra) => {
	let RutaActual = "";
	var RutaObra = "";
	var rutaUsuario = "";
	RutaAnual = "";
	let i = 0;

	if (Instalacion == 'C') { //Si la instalacion es en disco C
		RutaActual = path.join(__dirname);
		let i = 0;
		while (i < 3) {
			RutaAnual = RutaAnual + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
			i++;
		}
		RutaAnual = RutaAnual + "OneDrive\\PROMESA\\" + anoActual;

	} else {
		RutaAnual = 'D:\OneDrive\\PROMESA\\' + anoActual;
	}

	RutaObra = RutaAnual + "\\1. Administración\\1. Ordenes de Compra\\" + Obra;

	const file = new AdmZip();
	//file.addLocalFile(RutaActual + "/prueba.txt");

	//Sin el segundo parametro se trae el contenido de la carpeta
	//file.addLocalFolder(RutaObra, "CarpetaPruebas");
	file.addLocalFolder(RutaObra);
	fs.writeFileSync("Obra.zip", file.toBuffer());

	rutaUsuario = rutaUsuario + "\\Downloads";
	dialog.showSaveDialog({
		title: 'Seleccione carpeta',
		//defaultPath: path.join(__dirname, '../assets/sample.txt'),
		defaultPath: path.join(rutaUsuario, Obra + '.zip'),
		buttonLabel: 'Guardar',
		// Restricting the user to only Text Files.
		filters: [{
			name: 'zip',
			extensions: ['zip', 'rar']
		},],
		properties: []
	}).then(file => {
		if (!file.canceled) {
			fs.copyFile("Obra.zip", file.filePath.toString(), (err) => {
				if (err) {
					console.log("Error de copiado rar");
				} else {
					console.log("Archivo copiado!");
				}
			});
		}
	}).catch(err => {
		console.log(err)
	});

	// Another way to write the zip file: `writeZip()`
	// file.writeZip('output.zip');
};


Controller.ListaObras = async () => {
	console.log("Dentro del cotroller historial")
	GetRutaAnual();

	let Administración = RutaAnual + '\\1. Administración\\1. Ordenes de Compra\\';

	const promesa = new Promise((resolve, reject) => {
		//Leer la lista de archivos en un directorio y mostrarlo en lista historial
		if (fs.existsSync(Administración)) {
			//Validar si existe carpeta en ruta anual
			fs.readdir(Administración, (error, archivos) => {
				if (error) {
					throw error;
				} else {
					respuesta = "con datos";
					resolve(archivos);
				}
			});
		} else {
			console.log("directorio No Obra existente");
			respuesta = "sin Obra";
		}
	});

	return promesa;
};
//exec('start "" "C:\\Users\\EVA-01\\Documents\\Proyectos\\Electron\\BorradorElectron\\RFQ.pdf"');

/* 
Controller.ComprimirRar = () => {
	RutaActual = path.join(__dirname);
	let RutaAComprimir = "";
	i = 0;
	while (i < 3) {
		RutaAComprimir = RutaAComprimir + RutaActual.split("\\")[i] + "\\"; // Obtiene ruta 'C:\Users\UsuarioXXX'
		i++;
	}
	RutaAComprimir = RutaAComprimir + "Documents\\CarpetaPruebas";

	const file = new AdmZip();

	file.addLocalFile(RutaActual + "/prueba.txt");

	//Sin el segundo parametro se trae el contenido de la carpeta
	file.addLocalFolder(RutaAComprimir, "CarpetaPruebas");

	fs.writeFileSync(RutaAComprimir + "/output.zip", file.toBuffer());

	// Another way to write the zip file: `writeZip()`
	// file.writeZip('output.zip');
}; */


//Cuentas las carpetas de clientes
Controller.ContarCarpetas = () => {
	RutaAnual = RutaAnual + "\\1. Administración\\1. Ordenes de Compra\\";
	let TotalCarpetas = 0;
	if (fs.existsSync(RutaAnual)) {
		const promesa = new Promise((resolve, reject) => {
			fs.readdir(RutaAnual, (error, archivos) => {
				if (error) {
					throw error;
				} else {
					TotalCarpetas = archivos.length
					resolve(TotalCarpetas)
				}
			});
		})

		return promesa
	} else {
		return 0;
	}
}



module.exports = Controller;