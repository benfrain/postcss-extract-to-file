"use strict";
const postcss = require("postcss");
const gzipSize = require("gzip-size");
const fs = require("fs");
const prettyBytes = require("pretty-bytes");

module.exports = postcss.plugin("postcss-extract-to-file", function postcssExtractToFile(options) {
    return function (css) {

        return new Promise(function (resolve, reject) {
            options = options || {};

            // Create two arrays, one for the extracted rules, another for the remaining ones
            var extracted = [];
            var remaining = []

            css.walkRules(function (rule, index) {
                // We check each rule against the possible overrides. If it matches an override it gets moved the the extracted file 
                if (checkOverrides(options.extractors, rule.selector)) {
                    extracted.push(rule);
                }
                // Otherwise it gets written to the 'remaining' rule
                else {
                    remaining.push(rule);
                }
            });
            return Promise.all([writeExtractedToFile(extracted), writeRemainingToFile(remaining)]).then(resolve, reject);
        });
    }
    function writeExtractedToFile (extracted) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(options.extracted, extracted, function (err) {
                if (err) reject(err);
                // Let"s create a message we can log and write to file
                const message = createMessage(options.extracted);
                // Append message to file
                fs.appendFile(options.extracted, message);
                // Log the message
                console.log("Saved the extracted rules." + message);
                resolve();
            });
        });
    }

    // Utility function to create a message with file sizes
    function createMessage (filename) {
        const message = `\n/* ${filename} — size ${fs.statSync(filename).size} bytes/${prettyBytes(gzipSize.sync(fs.readFileSync(filename, 'utf8')))} gzipped, generated on ${fs.statSync(filename).mtime} */ \n`;
        return message;
    };
    
    function writeRemainingToFile (remaining) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(options.remaining, remaining, function (err) {
                if (err) reject(err);
                // Let"s create a message we can log and write to file
                const message = createMessage(options.remaining);
                // Append the message to file
                fs.appendFile(options.remaining, message);
                // Log the message
                console.log("Saved the remaining rules." + message);
                resolve();
            });
        });
    }

    // List is our array of possible overrides to check against
    function checkOverrides (list, selector) {
        if (!list) {
            console.log("You have not supplied any selectors to extract against");
        }
        for (var i = 0, len = list.length; i < len; i++) {
            let item = list[i];
            if (selector.indexOf(item) > -1) {
                return true;
            }
        }
        return false;
    }
});
