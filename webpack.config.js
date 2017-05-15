"use strict";
var webpack = require("webpack");
var path = require("path");
var map = require("./src/data-map");

var entry = {
    "index": "./index.js"
};

var map_it = map.entries();
var next = map_it.next();
var i = 1;
while (!next.done) {
    if(i<5){
       let key = next.value[0];
       entry[key] = `./${key}.js`;
    }
    next = map_it.next();
    i++;
}

module.exports = {
    context: path.resolve(__dirname, "src/js"),
    entry: entry,
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "docs/js")
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};



