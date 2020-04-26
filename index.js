const xlsx = require('node-xlsx');
const fs = require('fs');
const libs = require('./libs');

const FILE_NAME = `${__dirname}/files/Registro-Dominic.Inglés.xlsx`;
const workSheetsFromFile = xlsx.parse(FILE_NAME);

const OPTIONS = {
    INDEX_TABLE_HEADER_1: 7,
    INDEX_TABLE_HEADER_2: 8,
    CLASSES_COL_COUNT_START: 2,
    CLASSES_COL_COUNT_EACH: 4,
    AVERAGE_COL_COUNT_START: 5,
    AVERAGE_COL_COUNT_EACH: 4,
    FLAG_GET_ALL_CLASSES: false,
    CLASS_NUMBER: 3
};

let xlsxBook = [];
let workSheet = workSheetsFromFile[0];
workSheetsFromFile.forEach((workSheet) => {
    let newSheet = [];
    let sheetName = workSheet.name;
    let currentSheet = workSheet.data;

    let teacherName = currentSheet[4][0];
    newSheet.push(['', '', teacherName]);
    let courseName = currentSheet[5][0];
    newSheet.push(['', '', courseName]);

    let tableInfo = libs.tableInformation(currentSheet, OPTIONS);
    if (!tableInfo.isvalid) return false;

    // Creando la cabecera de la tabla
    let tableHeader = ['N°', 'APELLIDOS Y NOMBRES'].concat(tableInfo.tableHeader);
    newSheet.push(tableHeader);

    // Creando el cuerpo de la tabla
    for (let row = 0; row < currentSheet.length; row++) {
        if (row < tableInfo.startIndexBody) continue;
        let schoolchildOrder = currentSheet[row][0];
        let schoolchildName = currentSheet[row][1];
        
        if (!schoolchildOrder || !schoolchildName) continue;
        let schoolchildRow = [];
        schoolchildRow.push(schoolchildOrder);
        schoolchildRow.push(schoolchildName);
        
        let schoolchildGrades = libs.getdata({
            arr: currentSheet[row], 
            countStart: OPTIONS.AVERAGE_COL_COUNT_START, 
            countEach: OPTIONS.AVERAGE_COL_COUNT_EACH
        }, tableInfo.tableLarge);
        schoolchildGrades = schoolchildGrades.map(x => (x) ? 'SI' : 'NO');
        newSheet.push(schoolchildRow.concat(schoolchildGrades));
    }

    //-------------------------
    let sheetByClass = [newSheet[0], newSheet[1]];
    let indexName = '';
    for (let row = 0; row < newSheet.length; row++) {
        for (let col = 0; col < newSheet[row].length; col++) {
            if (row >= 2 && col == OPTIONS.CLASS_NUMBER + 1){
                indexName = newSheet[row][col];
            }
        }
        if (row >= 2) sheetByClass.push([newSheet[row][0], newSheet[row][1], indexName]);
    }
    xlsxBook.push({
        name: sheetName, 
        data: OPTIONS.FLAG_GET_ALL_CLASSES ? newSheet : sheetByClass
    });
});


let buffer = xlsx.build(xlsxBook);

fs.writeFile('./files/prueba.xlsx', buffer, function (err) {
  if (err) return console.log(err);
  console.log('Archivo creado > prueba.xlsx');
});


