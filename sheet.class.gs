class Record {

  constructor(data, rowNumber, sheetName) {
    this.data = data;  
    this.rowNumber = rowNumber   
    this.sheetName = sheetName 
    for (const key of Object.keys(this.data)){
        if(["data", "rowNumber", "sheetName"].includes(key)) {throw Error("Unsupported name")}
        Object.defineProperty(this, key, {  get() { return this.data[key]} });
    }
  }

  get(key){  return this.data[key] }// for backward compatibility

  update(key, newValue){
    if (!this.data.hasOwnProperty(key)){throw Error(`Key ${key} not found in ${this.sheetName}`)}
    this.data[key] = newValue
    new Sheet(this.sheetName).updateCellByRow(this.rowNumber, key, newValue)
  }
}

class RecordSet {

  constructor(records) { this.records = records }

  get operators () { 
    return { "=": (a, b) => a == b,  ">": (a, b) => a > b, ">=": (a, b) => a >= b, "<": (a, b) => a < b,"<=": (a, b) => a <= b}
  }

  filter(key, operator, value) {
        const operation = this.operators[operator];
        if (!operation) {  throw new Error(`Unsupported operator: ${operator}`); }
        this.records = this.records.filter(record => operation(record[key], value));
        return this;
    }

  get result () {return this.records}
}

class Sheet {

  constructor(sheetName, indexKey=null) {
    this.sheetName = sheetName
    this.sheetObject = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!this.sheetObject) { throw new Error('Sheet with name "' + this.sheetName + '" not found.');};
    this.headers = this.sheetObject.getRange(1, 1, 2, this.sheetObject.getLastColumn()).getValues()[0];
    this.indexKey = indexKey // unique index field to process updates and deletes better
  }

  get allData(){
    const fullRange = this.sheetObject.getDataRange();
    return = fullRange.getValues().slice(1); // Отезаем заголовок
  }

  zipRow(rowData, rowNumber) {
    let objectData = {};
    for (const [index, name] of Object.entries(this.headers)) { objectData[name] = rowData[index];}
    return new Record(objectData, rowNumber, this.sheetName )
  }

  all(){
    const allData = this.allData
    const result = [];
    for (const [index, rowArray] of Object.entries(allData)) {
      result.push(this.zipRow(rowArray, +index+2, this.sheetName ));
    } 
    return result
  }

  filter(arg1, arg2=null, arg3=null){  
    const conditions = arg2 ? [[arg1, arg2, arg3]] : arg1
    const recordSet = new RecordSet(this.all())
    for (const [key, oper, value] of conditions) { recordSet.filter(key, oper, value) }
    return recordSet.result
  }

  get(value) {
    if (!this.indexKey) { throw Error(`Can't get row by by index column, indexKey not set`)}
    const fullRange = this.sheetObject.getDataRange();
    const allRows = fullRange.getValues().slice(1);
    const columnIndex = this.headers.indexOf(this.indexKey)
    for (const [rowNumber, rowData] of Object.entries(allRows)){
      if (rowData[columnIndex] === value.trim()){ return this.zipRow(rowData, rowNumber+2)}
    }
  }

  addRow(data) {
    const newRow = new Array(this.sheetObject.getLastColumn()).fill('');
    for (const [index, key] of Object.entries(this.headers)){newRow[index] = data.hasOwnProperty(key) ? data[key]: ""}
    this.sheetObject.appendRow(newRow);
    return this.zipRow(newRow, this.sheetObject.getLastRow())
  }

  updateCellByRow(rowNumber, key, newValue){
    const columnIndex = this.headers.indexOf(key)
    if(columnIndex === undefined) { throw Error(`No ${key} in ${this.sheetName} sheet`);  return  }
    const range = this.sheetObject.getRange(rowNumber, parseInt(columnIndex) + 1)
    range.setValue(newValue)
  }
}
