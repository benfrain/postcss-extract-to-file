import postcss from 'postcss';
import test from "ava";
import {read as read} from 'fs';
import {open as open} from 'fs';

function createStringFromFile (fileName) {
    return new Promise (function(resolve, reject) {
        open(fileName, "r", function(error, fd){
            var readBuffer = new Buffer(1024);
            var bufferOffset = 0,
            bufferLength = readBuffer.length,
            filePosition = 0;
            // Now read the buffer
            read(fd,
                readBuffer,
                bufferOffset,
                bufferLength,
                filePosition,
                function (error, readBytes) {
                    if (error) { 
                        Reject(Error(error));
                    }
                // Split the buffer to remove the comment that was added
                var theExport = readBuffer.slice(0, 32);
                var out = theExport.toString('utf-8');
                resolve(out);        
            });
        });
    });
}

test("Has access to options and extractor values", async t => {
    return postcss()
    .use(require("postcss-extract-to-file")({
        "remaining": "___tests___/remaining.css",
        "extracted": "___tests___/extracted.css",
        "extractors": [
        ".no-flex"
        ]
    }))
});

test("Check actual extracted CSS matches the expected extracted CSS", t => {
    const inputCSS = ".normal { width: 100%; } .no-flex .normal { width: 50%; }";
    return postcss()
    .use(require("postcss-extract-to-file")({
        "remaining": "___tests___/remaining.css",
        "extracted": "___tests___/extracted.css",
        "extractors": [
        ".no-flex"
        ]
    }))
    .process(inputCSS).then(function(){
        createStringFromFile("___tests___/extracted.css").then(function(result) {
            t.same(result, ".no-flex .normal { width: 50%; }", "output in extracted file differs from expected");
        });
    });
});

test("Check actual remaining CSS matches the expected remaining CSS", t => {
    const inputCSS = ".normal { width: 100%; } .no-flex .normal { width: 50%; }";
    return postcss()
    .use(require("postcss-extract-to-file")({
        "remaining": "___tests___/remaining.css",
        "extracted": "___tests___/extracted.css",
        "extractors": [
        ".no-flex"
        ]
    }))
    .process(inputCSS).then(function(){
        createStringFromFile("___tests___/remaining.css").then(function(result) {
            t.same(result, ".normal { width: 100%; }", "output in remaining file differs from expected");
        });
    });
});

test('can access PostCSS version', t => {
    var ver = postcss().version;
    t.ok(ver, 'should be able to access version');
});
