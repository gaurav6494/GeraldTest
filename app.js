const worker = require('worker_threads');
var cluster=require("cluster");
var http=require("http");
var cpu=require("os").cpus().length;
const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
var path = require("path");
const workerPath = path.resolve('db.js');
const excelToJson = require('convert-excel-to-json');
const result = excelToJson({
    sourceFile: 'Financial Sample.xlsx'
});


const assignProcess =  (data)=>{
        cpuDataLen=Math.ceil(data.length/cpu)//Data length for every worker
        processSegments=[]
        for(x=0;x<cpu;x++){
            perData=data.splice(0,cpuDataLen)
            processSegments.push(perData)
        }
        
        var processPromise=processSegments.map((segment)=>{//Creats new workers and performs database operation task
            return new Promise((resolve, reject) => {
                const worker = new Worker(workerPath, {
                  workerData: segment,
                });
                worker.on('message', resolve);
                worker.on('error', reject);
                worker.on('exit', code => {
                  if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                });
            })
        })
        let totalResult= Promise.all(processPromise).then(results => {
            if(results.hasOwnProperty("Failed")){
                console.log("Operation is Failed")
            }else{
                console.log("Operation is successfull!")
            }
        });
        return totalResult

}

assignProcess(result.Sheet1)//excel data sent in array format