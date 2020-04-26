let getdata = ({arr, countStart, countEach}, tableLength) => {
    let count = 0;
    let newRow = [];
    let arrLenght = tableLength || arr.length;
    for (let index = 0; index < arrLenght; index++) {
        if (index == countStart) newRow.push(arr[index]);
        if (index > countStart) {
            count++;
            if (count == countEach){
                newRow.push(arr[index]);
                count = 0;
            }
        }
    }
    return newRow;
}

//Validando la tabla
let tableInformation = (sheet, options) => {
    let indexTable = 0;
    let isvalid = true;
    let rowHeaderFirst = sheet[options.INDEX_TABLE_HEADER_1];
    let rowHeaderSecond = sheet[options.INDEX_TABLE_HEADER_2];

    /** ---------------------------------
     * Validar estructura: Primeras filas
     * ----------------------------------*/
    for (let index = 0; index < sheet.length; index++) {
        if (
            sheet[index][0] == 'N°' && 
            sheet[index][1] == 'APELLIDOS Y NOMBRES' &&
            sheet[index+2][0] == '1'
           ) {
            indexTable = index;
            break;
        }
    }
    
    if (indexTable == 0) {
        console.error('Error: La cabecera de la tabla es incorrecta');
        isvalid = false;
    }

    /** ---------------------------------
     * Validar estructura de cabecera
     * ----------------------------------*/
    let titlesClasses = getdata({
        arr: rowHeaderFirst, 
        countStart: options.CLASSES_COL_COUNT_START, 
        countEach: options.CLASSES_COL_COUNT_EACH
    });

    // Validar el texto "PROMEDIO FINAL" de la cabecera
    let averageTitleArray = titlesClasses.slice(-1)[0];
    if(!/promedio *final/gi.test(averageTitleArray)) {
        isvalid = false;
        console.error(`Error: El elemento [${averageTitleArray}] no es compatible con el formato de título "PROMEDIO FINAL"`);
    };

    // Validar los textos "CLASE Nº" de la cabecera
    let classesTitleArray = titlesClasses.slice(0, titlesClasses.length - 1);
    classesTitleArray.forEach((elem, index) => {
        let regex = new RegExp(`clase ${index + 1}`, "i");
        if (!regex.test(elem)) {
            isvalid = false;
            console.error(`Error: El elemento "${elem}" no es compatible con el formato de título "CLASE [Nº]"`);
        }
    });

    // Validar cantidades de clases y promedios
    let titlesAverageArray = getdata({
        arr: rowHeaderSecond, 
        countStart: options.AVERAGE_COL_COUNT_START, 
        countEach: options.AVERAGE_COL_COUNT_EACH
    });
    if (titlesAverageArray.length != classesTitleArray.length) {
        isvalid = false;
        console.error(`Error: La cantidad de 'Clases' no coincide con la cantidad de 'Promedios'`);
    }
    // Validar Texto de titulos Promedio por clase
    titlesAverageArray.forEach((elem) => {
        if (!/promedio/i.test(elem)) {
            isvalid = false;
            console.error(`Error: El elemento "${elem}" no es compatible con el formato de título "PROMEDIO"`);
        }
    });
    return {
        isvalid,
        startIndexBody: indexTable + 2,
        tableHeader: classesTitleArray,
        tableLarge: rowHeaderFirst.length - 1
    };
}

module.exports = {
    getdata,
    tableInformation
}