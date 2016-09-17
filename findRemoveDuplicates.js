"use strict";
var fs = require('fs');
fs.readFile('random.org.1', 'utf8', fsReadHandler); //TODO: handle other encodings
var first = false;
function fsReadHandler(err, data) {
    if (err)
        throw err;
    if (first) {
        console.log(data);
        first = false;
    }
}
//# sourceMappingURL=findRemoveDuplicates.js.map