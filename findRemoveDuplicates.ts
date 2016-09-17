import fs = require('fs');
fs.readFile('random.org.1','utf8', fsReadHandler);//TODO: handle other encodings
var first:boolean = false;
function fsReadHandler(err, data:string):void{
    if (err) throw err;
    if(first){
        console.log(data);
        first = false;
    }
}
import readline = require('readline');
import rl = readline.createInterface({
   input: fs.createReadStream('random.org.1')
});

rl.on('line', function (line) {
    console.log('Line from file:', line);
 });