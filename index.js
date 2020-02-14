const docxtemplater = require('docxtemplater');
const fs = require('fs');
const PizZip = require('pizzip');

var dstFile = 'example/destination.docx';
var datFile = 'example/data.json';
var argv = require('minimist')(process.argv.slice(2));

/** Should we run example? Else run main() */
if (!example()) main();

/**
 *
 */
function example() {
  for (var key in argv) {
    switch (key) {
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
  datFile = '';
  if (argv['d']) dstFile = argv['d'];
  if (argv['_'] && argv['_'].length > 0) datFile = argv['_'][0];

  if (dstFile !== '' && datFile !== '') {
    createDocument(dstFile, datFile);
    return;
  } else {
    console.log('Usage: -s source.docx -d destination.docx data.json');
    return;
  }
}

/**
 * createDocument creates a file
 * @param {*} dstFile
 * @param {*} datFile
 */
function createDocument(dstFile, datFile) {
  // Load file in docxtemplater.
  var data = fs.readFileSync(datFile);

  try {
    content = fs.readFileSync(dstFile, 'binary');
    let zip = new PizZip();
    zip.load(content);

    doc = new docxtemplater();
    doc.loadZip(zip).setOptions({
      parser: tag => {
        //console.log(tag);
        let isoDate = false;
        if (tag.endsWith('[isoDate]')) {
          tag = tag.replace('[isoDate]', '');
          isoDate = true;
        }
        return {
          ['get'](scope) {
            console.log(`Checking tag ${tag}:`);
            if (tag === '.') {
              console.log('here' + tag);
              return scope;
            }
            if (tag.indexOf('.') > -1) {
              const tags = tag.split('.');
              let result = scope;
              for (let i = 0; i < tags.length; i++) {
                if (result[tags[i]] === undefined) return undefined;
                result = result[tags[i]];
              }
              if (isoDate) return result.toISOString().substring(0, 10);
              return result;
            }
            if (isoDate) return scope[tag].toISOString().substring(0, 10);
            return scope[tag];
          }
        };
      }
    });

    // Update documents
    try {
      doc.setData(JSON.parse(data));
    } catch (error) {
      console.error(error);
      return error;
    }

    // Render document
    try {
      doc.render();
    } catch (error) {
      console.error(error);
      return error;
    }

    // Save file
    try {
      var buf = doc.getZip().generate({ type: 'nodebuffer' });
      fs.writeFileSync(dstFile, buf);
      console.log('Document saved as ' + dstFile);
    } catch (error) {
      console.error(error);
      return error;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
  return null;
}
