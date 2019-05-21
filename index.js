const docxtemplater = require('docxtemplater');
const fs = require('fs');
const JSZip = require('jszip');

var dstFile = 'example/destination.docx';
var srcFile = 'example/source.docx';
var datFile = 'example/data.json';
var argv = require('minimist')(process.argv.slice(2));

/** Should we run example? Else run main() */
if (!example())
    main();

/**
 * 
 */
function example() {
    for(var key in argv) {
        switch(key) {
            case 'example': {
                createDocument(srcFile, dstFile, datFile);
                return true;
            }
        }
    }
    return false;
}


/**
 * 
 */
function main() {
    dstFile = '';
    srcFile = '';
    datFile = '';
    if (argv['d']) dstFile = argv['d'];
    if (argv['s']) srcFile = argv['s'];
    if (argv['_'] && argv['_'].length > 0) datFile = argv['_'][0];

    if (dstFile !== '' && srcFile !== '' && datFile !== '') {
        createDocument(srcFile, dstFile, datFile);
        return;
    } else {
        console.log('Usage: -s source.docx -d destination.docx data.json');
        return;
    }
}

/**
 * createDocument creates a file
 * @param {*} srcFile 
 * @param {*} dstFile 
 * @param {*} datFile 
 */
function createDocument(srcFile, dstFile, datFile) {
    fs.copyFile(srcFile, dstFile, (err) => {
        if (err) throw err;

        // Load file in docxtemplater.
        var content = fs.readFileSync(dstFile, 'binary');
        var data = fs.readFileSync(datFile);
        var zip = new JSZip(content);
        var doc = new docxtemplater()
        doc.loadZip(zip);

        // Update documents
        doc.setData(JSON.parse(data));

        // Render document
        try { doc.render(); } catch(error) { throw error; }

        // Save file
        try {
            var buf = doc.getZip().generate({ type: 'nodebuffer' });
            fs.writeFileSync(dstFile, buf);
            console.log('Document saved as "' + dstFile + '".');
        } catch(error) {
            throw error;
        }
    })
}