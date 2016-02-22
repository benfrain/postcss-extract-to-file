# PostCSS extract to file plugin

A basic PostCSS plugin to extract a number of rules and write them to a different file.

Given an options object like this:

````
"remaining": "./output/remaining.css",
"extracted": "./output/extracted.css",
"extractors": [
    ".no-w3cflexbox",
    ".os_",
    ".no-supportsnativescrolling",
    ".no-svginhtml",
    ".no-flex",
    ".browser_ie",
    ".no-csstransitions",
    ".ie-8",
    ".ie-9"
]
````

Any rules that match a string in the "extractors" array will be extracted and written to the output destination and filename set in "extracted". The remaining rules will be written to the "remaining" location.

It is recommended that this plugin is used just before or just after your minifier (e.g. [cssnano](http://cssnano.co))