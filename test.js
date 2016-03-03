import postcss from 'postcss';
import test from "ava";
import fs from "fs";

function createStringFromFile (fileName) {
    return new Promise (function(resolve, reject) {
        fs.readFile(fileName, (err, data) => {
            if (err) throw err;
            // Split the buffer to remove the comment that was added
            var theExport = data.slice(0, 32);
            const out = theExport.toString("utf-8");
            resolve();
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
