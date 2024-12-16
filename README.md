# gas-orm

Google Apps Scripts Spreadsheet ORM 

- Get sheet data as JS objects, with Header as attributes names as simple as `new Sheet('people').all()`
- Easy get data in {key: value} format: `record.data`
- Update rows with ORM syntax: `record.update(key, value)
- Add new rows from {key: value}: `new Sheet('people').addRow({name: "Alex"})`
- Filter sheet data: `new Sheet('people').filter("name", "=", "Alex")`

### Example 1: Getting All Records

```javascript
function getAllRecordsExample() {

  const allRecords = new Sheet('people').all();
  for (const record of allRecords) {
    Logger.log(record.data);
  }
}
```

### Example 2: Filtering Records

```javascript
function filterRecordsExample() {
  const records = new Sheet('people').filter('age', '>', 25); 
  
  for (const record of records) {
   Logger.log(record.data);
  }
}
```

### Example 3: Filtering with Multiple Conditions

```javascript
function complexFilterExample() {
  
  const conditions = [
    ['age', '>', 20],
    ['location', '=', 'Berlin']
  ];

  const sheet = new Sheet('people');
  const records = sheet.filter(conditions);
  
  for (const record of records) {
     Logger.log(record.data);
  }
}
```

### Example 4: Adding a New Row

```javascript
function addRowExample() {
  const sheet = new Sheet('people');
  const newData = {
    'name': 'John Doe',
    'age': 30,
    'email': 'johndoe@example.com'
  };
  
  const newRecord = sheet.addRow(newData);
  Logger.log(`New record added: ${newRecord}`);
}
```


### Example 5: Retrieving and Updating a Record

```javascript
function updateRecordExample() {
  const sheet = new Sheet('people', primaryKey='id'); 
  const record = sheet.get('2'); 
  Logger.log(record);
}






