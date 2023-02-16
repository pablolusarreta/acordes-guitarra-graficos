///////////////////////////////////////////////////////////////////////////////////////    
const { dialog } = require('electron').remote
const fs = require('fs')
const { ipcRenderer } = require('electron')
///////////////////////////////////////////////////////////////////////////////////////
const claseDocumento = 'acordes1577833200000'
const anade_clase = () => { for (let i in CIFRADOGUITARRA2) { CIFRADOGUITARRA2[i].clase = claseDocumento; guardaLS() } }
const alerta = men => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Acordes de Guitarra',
        message: men
    });
}
const confirmacion = (men, acc) => {
    dialog.showMessageBox({
        type: 'question',
        title: 'Acordes de Guitarra',
        message: men,
        buttons: ['Aceptar', 'Cancelar'],
        defaiultId: 1,
        noLink: true
    },
        response => {
            if (response === 0) acc()
        }
    );
}
let AMDHMS = (t) => {
    let d = new Date(t);
    let M = Number(d.getMonth()) + 1; let D = Number(d.getDate()); let h = Number(d.getHours());
    let m = Number(d.getMinutes()); let s = Number(d.getSeconds());
    let nm = d.getFullYear() + '.' + ((M < 10) ? '0' + M : M) + '.' + ((D < 10) ? '0' + D : D) + '-' + ((h < 10) ? '0' + h : h) + '.' + ((m < 10) ? '0' + m : m) + '.' + ((s < 10) ? '0' + s : s);
    return nm
}
const cargaJson = n => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Texto plano', extensions: ['json'] }]
    }).then(result => {
        if (!result.canceled) {
            fs.readFile(result.filePaths[0], (err, data) => {
                if (err) {
                    alerta(err)
                } else {
                    let tmp = JSON.parse(data.toString())
                    // console.log(tmp)
                    if (n === 0) {
                        for (let i in tmp) {
                            if (tmp[i].clase != claseDocumento) {
                                alerta('! Formato json invalido en tema ' + i + ' ' + tmp[i].titulo + '¡')
                                return false
                            }
                        }
                        actualizaBase(tmp)
                    } else if (n === 1) {
                        if (tmp.clase != claseDocumento) {
                            alerta('! Formato json invalido ¡')
                            return false
                        }
                        tmp.ID = new Date().getTime()
                        anade_tema(tmp)
                    }
                }
            })
        }
    }).catch(err => {
        console.log(err)
    })
}
const guardaJson = n => {
    let d = new Date()
    let nom_fihero = (n === 0) ? AMDHMS(d) : CIFRADOGUITARRA2[doc_select].titulo
    nom_fihero += '-acordes'
    let url = dialog.showSaveDialog({
        properties: ['openFile'],
        filters: [{ name: 'Texto plano', extensions: ['json'] }],
        defaultPath: nom_fihero
    }).then(result => {
        if (!result.canceled) {
            console.log(result.filePath)
            let objeto = (n === 0) ? CIFRADOGUITARRA2 : CIFRADOGUITARRA2[doc_select];
            fs.writeFile(result.filePath, JSON.stringify(objeto), error => {
                document.getElementById('cortina').style.display = 'none';
                if (error) { alerta({ estado: true, texto: error, accion: false }) }
            })
        }
    }).catch(err => {
        console.log(err)
    })
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
function edita() {
    document.getElementById('cortina').style.display = 'block';
}
function actualizaBase(datos) {
    console.log(datos)
    confirmacion("Se sustituira toda la Base de Datos.\n\n¿ Deseas continuar ?", () => {
        CIFRADOGUITARRA2 = datos
        reinicia()
    })
}
function anade_tema(datos) {
    confirmacion("Se añadira este tema a la Base de Datos.\n¿ Deseas continuar ?", () => {
        CIFRADOGUITARRA2.push(datos);
        reinicia()
    })
}
function elimina_documento(Ob) {
    confirmacion('¿Eliminar el elemento nº ' + (Number(Ob.parentNode.id) + 1) + ' "' + Ob.parentNode.childNodes[1].innerHTML + '" ?', () => {
        CIFRADOGUITARRA2.splice(Number(Ob.parentNode.id), 1);
        reinicia()
    })
}
const reinicia = () => {
    document.getElementById('cortina').style.display = 'none'
    guardaLS()
    inicio()
}
///////////////////////////////////////////////////////////////////////////////////////
var CIFRADOGUITARRA2 = [{ ID: String(new Date().getTime()), titulo: 'Documento nuevo', grafico: [], clase: claseDocumento }];
var nota = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
var clases = { A: [0, 1, 2, 3], T: [0, 1, 2, 3] };
var doc_select = 0;
function guardaLS() {
    localStorage.setItem('CIFRADOGUITARRA2', JSON.stringify(CIFRADOGUITARRA2))
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function inicio() {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.CIFRADOGUITARRA2) {
            CIFRADOGUITARRA2 = JSON.parse(localStorage.getItem('CIFRADOGUITARRA2'));
            var S = '';
            for (var i = CIFRADOGUITARRA2.length - 1; i > -1; i--) {
                S += '<div id="' + i + '"><span onclick="carga_documento(this.parentNode.id)">' + formateaTS(CIFRADOGUITARRA2[i].ID) + '</span>';
                S += '<span onclick="carga_documento(this.parentNode.id)">' + CIFRADOGUITARRA2[i].titulo + '</span>';
                S += '<div onclick="elimina_documento(this)">+</div>';
                S += '<div><span>Trastes:&nbsp;&nbsp;&nbsp;&nbsp;</span><select onchange="establece_trastes(' + i + ',this.value);">';
                var trastes = (CIFRADOGUITARRA2[i].trastes) ? CIFRADOGUITARRA2[i].trastes : 12;
                for (var j = 3; j < 25; j++) {
                    S += '<option ' + ((j == trastes) ? 'selected' : '') + '>' + j + '</option>';
                }
                S += '</select></div>';
                S += '</div>';
            }
        }
        document.getElementById('fondo_listado').style.display = 'block';
        document.getElementById('listado').innerHTML = S;
        document.getElementById('mas').onclick = crea_documento;
        document.getElementById('mas').title = 'Crear un documento nuevo';
        document.getElementById('mastiles').innerHTML = '';
        document.getElementById('boton_guarda_tema').style.display = 'none';
        //anade_clase()
    } else {
        alerta('Tú navegador no admite el almacenamiento local');
    }
}
function establece_trastes(i, v) {
    CIFRADOGUITARRA2[i].trastes = Number(v);
    guardaLS();
    inicio();
}
function crea_documento() {
    var id = String(new Date().getTime());
    CIFRADOGUITARRA2.push({ ID: id, titulo: 'Documento nuevo', trastes: 12, grafico: [{ ID: id, titulo: '', traste: 0, pulsado: [] }], clase: claseDocumento });
    guardaLS();
    inicio();
}
function carga_documento(id) {
    doc_select = Number(id);
    document.getElementById('fondo_listado').style.display = 'none';
    document.getElementById('titulo_documento').value = CIFRADOGUITARRA2[doc_select].titulo;
    //document.title = ' - ' + CIFRADOGUITARRA2[doc_select].titulo;
    document.getElementById('mas').onclick = function () { crea_mastil(true, CIFRADOGUITARRA2[doc_select].grafico.length); };
    document.getElementById('mas').title = 'Crear un mastil nuevo';
    document.getElementById('boton_guarda_tema').style.display = 'block';
    for (var i in CIFRADOGUITARRA2[doc_select].grafico) {
        crea_mastil(false, Number(i));
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function guarda_pulsado(Ob) {
    var id_mastil = Ob.parentNode.parentNode.parentNode.parentNode.id;
    var id_pulsado = Ob.id;
    var ct = Ob.firstChild.attributes['class'].value.slice(0, -1);
    var cs = Number(Ob.firstChild.attributes['class'].value.slice(-1));
    var i = (cs < (clases[ct].length - 1)) ? (cs + 1) : 0;
    var cl = (ct + i);
    Ob.firstChild.attributes['class'].value = cl;
    //console.log  (id_mastil,id_pulsado,cl);
    for (var i in CIFRADOGUITARRA2[doc_select].grafico) {
        //console.log(CIFRADOGUITARRA2[doc_select].grafico[i].ID);
        if (id_mastil == CIFRADOGUITARRA2[doc_select].grafico[i].ID) {
            var tm = Number(i);
            for (var j in CIFRADOGUITARRA2[doc_select].grafico[i].pulsado) {
                if (CIFRADOGUITARRA2[doc_select].grafico[i].pulsado[j][0] == id_pulsado) {
                    if (cl == 'T0' || cl == 'A0') {
                        CIFRADOGUITARRA2[doc_select].grafico[i].pulsado.splice(Number(j), 1);
                    } else {
                        CIFRADOGUITARRA2[doc_select].grafico[i].pulsado[j][1] = cl;
                    }
                    guardaLS();
                    return true;
                }
            }
            break;
        }
    }
    CIFRADOGUITARRA2[doc_select].grafico[tm].pulsado.push([id_pulsado, cl]);
    guardaLS();
}
function guarda_titulo_grafico(id, v) {
    //console.log(id,v);
    for (var i in CIFRADOGUITARRA2[doc_select].grafico) {
        if (id == CIFRADOGUITARRA2[doc_select].grafico[i].ID) {
            CIFRADOGUITARRA2[doc_select].grafico[i].titulo = v;
            break;
        }
    }
    guardaLS();
}
function guarda_traste_grafico(k, ob) {
    console.log(k);
    CIFRADOGUITARRA2[doc_select].grafico[k].traste = Number(ob.value);
    guardaLS();
    document.getElementById('mastiles').innerHTML = '';
    carga_documento(doc_select);
}
function guarda_titulo(v) {
    CIFRADOGUITARRA2[doc_select].titulo = v;
    guardaLS();
}
function elimina_mastil(Ob) {
    var id = Ob.parentNode.parentNode.parentNode.id;
    Ob.parentNode.parentNode.parentNode.parentNode.removeChild(Ob.parentNode.parentNode.parentNode);
    for (var i in CIFRADOGUITARRA2[doc_select].grafico) {
        if (id == CIFRADOGUITARRA2[doc_select].grafico[i].ID) {
            //console.log(id,i);
            CIFRADOGUITARRA2[doc_select].grafico.splice(Number(i), 1);
            guardaLS();
            break;
        }
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
function crea_mastil(n, k) {
    var cuerda, clase;
    var ELE = document.createElement('div');
    var S = '<table border="0">';
    S += '<caption><input type="text" value="' + ((n) ? '' : CIFRADOGUITARRA2[doc_select].grafico[k].titulo) + '" placeholder="Descripción"';
    S += ' onchange="guarda_titulo_grafico(this.parentNode.parentNode.parentNode.id,this.value)" />';
    S += '<div onclick="elimina_mastil(this)">+</div></caption><tr><td>';
    S += '<select onchange="guarda_traste_grafico(' + k + ',this)">';
    console.log(CIFRADOGUITARRA2[doc_select].grafico);
    if (n) { var pr_traste = 0; } else { var pr_traste = CIFRADOGUITARRA2[doc_select].grafico[k].traste; }
    console.log(pr_traste);
    for (var j = 0; j < 12; j++) { S += '<option ' + ((j == pr_traste) ? 'selected' : '') + '>' + j + '</option>'; }
    S += '</select>';
    S += '</td>';
    var j = 0;
    var id;
    cuerda = [(7 + pr_traste), (0 + pr_traste), (5 + pr_traste), (10 + pr_traste), (2 + pr_traste), (7 + pr_traste)];
    for (var i = 6; i > 0; i--) {
        id = '0' + j;
        clase = pulsado(k, id, 'A', n);
        S += '<th title="' + nota[cuerda[j]++] + '" onclick="guarda_pulsado(this)" id="' + id + '">';
        S += '<div class="' + clase + '">' + i + '</div></th>';
        j++;
    }
    S += '</tr>';
    var alto = 50;
    var txt;
    cuerda = [(8 + pr_traste), (1 + pr_traste), (6 + pr_traste), (11 + pr_traste), (3 + pr_traste), (8 + pr_traste)];
    var ult_traste = ((CIFRADOGUITARRA2[doc_select].trastes) ? CIFRADOGUITARRA2[doc_select].trastes : 12) + pr_traste;

    for (var i = pr_traste; i < ult_traste; i++) {
        if (i == 24) break;
        if (i == 2 || i == 4 || i == 6 || i == 8 || i == 11 || i == 14 || i == 16 || i == 18 || i == 20 || i == 23) {
            txt = '<div' + ((i == 11) ? ' style=\"border-width:2px\"' : '') + '>' + (i + 1) + '</div>';
        } else {
            txt = '';
        }
        S += '<tr><td style="height:' + alto + 'px">' + txt + '</td>';
        for (var j = 0; j < 6; j++) {
            id = String(i + 1) + String(j);
            clase = pulsado(k, id, 'T', n);
            var nt = nota[cuerda[j]++];
            S += '<td style="height:' + alto + 'px" title="' + nt + '"';
            S += ' onclick="guarda_pulsado(this)" id="' + id + '">';
            S += '<div class="' + clase + '">' + nt + '</div></td>';
        }
        S += '</tr>';
        alto -= 2;
    }
    S += '</tr></table>';
    ELE.innerHTML = S;
    ELE.id = (n) ? new Date().getTime() : CIFRADOGUITARRA2[doc_select].grafico[k].ID;
    document.getElementById('mastiles').appendChild(ELE, null);
    if (n) {
        CIFRADOGUITARRA2[doc_select].grafico.push({ ID: String(ELE.id), titulo: '', traste: 0, pulsado: [] }); // [id del traste:120,clase de pulsacion: T1]
        guardaLS();
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
function pulsado(k, id, L, n) {
    if (n) return L + '0';
    for (var i in CIFRADOGUITARRA2[doc_select].grafico[k].pulsado) {
        if (CIFRADOGUITARRA2[doc_select].grafico[k].pulsado[i][0] == id) {
            //console.log(CIFRADOGUITARRA2[doc_select].grafico[k].pulsado[i][1]);
            return CIFRADOGUITARRA2[doc_select].grafico[k].pulsado[i][1];
        }
    }
    //console.log(L+'0');
    return L + '0';
}
function formateaTS(t) {
    var tm = new Date(Number(t));
    return ((tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate()) + ' ' + (((tm.getMonth() + 1) < 10) ? '0' + (tm.getMonth() + 1) : (tm.getMonth() + 1)) + ' ' + tm.getFullYear() + '&nbsp;&nbsp;<span style="font-size:75%;">' + ((tm.getHours() < 10) ? '0' + tm.getHours() : tm.getHours()) + ' : ' + ((tm.getMinutes() < 10) ? '0' + tm.getMinutes() : tm.getMinutes()) + ' : ' + ((tm.getSeconds() < 10) ? '0' + tm.getSeconds() : tm.getSeconds()) + '</span>';
}
const informacion = () => { ipcRenderer.send('info', 1) }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const electron = require('electron')
window.onload = inicio