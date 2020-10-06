const {Worker, parentPort, workerData} = require('worker_threads');
const MongoClient = require('mongodb').MongoClient;
const data = workerData;

const url = 'mongodb://localhost:27017';
const dbName = 'test';

MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  const collection = db.collection('financial');
  collection.insertMany(data, function(err, result) {
    client.close();
    if(result.insertedCount==data.length){
      parentPort.postMessage({"Success":result});
    }else{
      parentPort.postMessage({"Failed":err});
    }
  }); 
});
