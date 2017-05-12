"use strict";
var fs = require('fs');
var path = require("path");
var beautify = require('js-beautify').html_beautify;
var map = require("../data-map");
var template = require("./template").template;
var dict = {
    keywords:"sort,algorithm,visual,visualization,3D,排序,演算法,視覺化,可視化",
    description:"Sort algorithm 3D Visualization powered by three.js",
    threejsVer:85,
    sortName: undefined,
    title: undefined,
    scriptName: undefined
};

var html = template `<!DOCTYPE html>
<html>
    <head>
        <title>${"title"}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <meta name="robots" content="index,follow" />
        <meta name="keywords" content="${"keywords"}">
        <meta namge="description" content="${"description"}" />
        <link rel="stylesheet" type="text/css" href="../css/sorts.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${"threejsVer"}/three.min.js"></script>
    </head>
    <body>
        <div class="foot-bar">
            <label>${"sortName"}</label>
            <button id="run">run</button>
            <button id="reset">reset</button>
            <label tabindex="0" class="switch">
                <div class="switch-text"></div>
                <input id="speed" type="checkbox">
                <div class="switch-slider"></div>
            </label>
            <label>X speed</label>
            <span>powered by <a href="https://threejs.org/" target="_blank">three.js</a></span>
        </div>
        <script src="../js/${"scriptName"}.js"></script>
    </body>
</html>`;
/*-----*/
var outPath = path.resolve(__rootPath, "docs/sort");
var i = 1;
map.forEach((value, key) => {
    if (i < 4) {
        dict.sortName = value.name;
        dict.title = value.name + " ─ Sort 3D Visualization";
        dict.scriptName = key;
        let fileName = `${outPath}\\${key}.html`;
        let stream = fs.createWriteStream(fileName);
        stream.end(beautify(html(dict)), "utf8", () => {
            console.log(`[done] ${fileName}`);
        });
    }
    i++;
});

