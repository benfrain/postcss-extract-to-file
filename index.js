"use strict";
const postcss = require("postcss");
const gzipSize = require("gzip-size");
const fs = require("fs");
const prependFile = require("prepend-file");
const prettyBytes = require("pretty-bytes");

module.exports = postcss.plugin("postcss-extract-to-file", function myplugin(options) {
    return function (css) {

        options = options || {};

        // Create two arrays, one for the extracted rules, another for the remaining ones
        var extracted = [];
        var remaining = []

        css.walkRules(function (rule, index) {

            // We check each rule against the possible overrides. If it matches an override it gets moved the the extracted file 
            if (checkOverrides(rule.selector)) {
                extracted.push(rule);
            }
            // Otherwise it gets written to the 'remaining' rule
            else {
                remaining.push(rule);
            }

            // Takes a selector as its argument and check it against each item in the array of overrides
            function checkOverrides(checkThisAgainstPossibleOverrides) {
                // "list" is an array of our possible overides
                const list = options.extractors;
                for (var i = 0, len = list.length; i<len; i++) {
                    let item = list[i];

                    // If the selector is in the list of overrides return it
                    if (checkThisAgainstPossibleOverrides.indexOf(item) != -1) {
                        return true;
                    }
                }
                return false;
            }
        });

        // We have our two arrays at this point so write the files out
        writeExtractedToFile(extracted);
        writeRemainingToFile(remaining);
        
        // Utility functions to write extracted and remaining to disk
        function writeExtractedToFile (extracted) {
            fs.writeFile(options.extracted, extracted, function (err) {
                if (err) throw err;
                
                // Let"s create a message we can log and write to file
                const message = `/* ${options.extracted} — size ${fs.statSync(options.extracted).size} bytes/${prettyBytes(gzipSize.sync(fs.readFileSync(options.extracted, 'utf8')))} gzipped, generated on ${fs.statSync(options.extracted).mtime} */ \n`;
                // Append the message to file
                prependFile(options.extracted, message, function (err) {});
                // Log the message
                console.log("Saved the extracted rules." + message);
            });
        };
        function writeRemainingToFile (remaining) {
            fs.writeFile(options.remaining, remaining, function (err) {
                if (err) throw err;
                
                // Let"s create a message we can log and write to file
                const message = `/* ${options.remaining} — size ${fs.statSync(options.remaining).size} bytes/${prettyBytes(gzipSize.sync(fs.readFileSync(options.remaining, 'utf8')))} gzipped, generated on ${fs.statSync(options.remaining).mtime} */ \n`;
                // Append the message to file
                prependFile(options.remaining, message, function (err) {});
                // Log the message
                console.log("Saved the remaining rules." + message);
            });
        };
    }
});