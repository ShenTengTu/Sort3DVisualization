"use strict";
var fs = require('fs');
var path = require("path");
var beautify = require('js-beautify').html_beautify;
var map = require("../data-map");
var template = require("./template").template;

var dict = {
    jqueryVer:"3.2.1",
    bootstrapVer:"3.3.7",
    fontawesomeCDN:"dcf0aa2bb9",
    keywords:"sort,algorithm,visual,visualization,3D,排序,演算法,視覺化,可視化",
    description:"Sort algorithm 3D Visualization powered by three.js",
    title: "Sort 3D Visualization",
    projectLink:"https://github.com/ShenTengTu/Sort3DVisualization",
    menuItems:menuItemsGen()
};

function menuItemsGen() {
    let result = "";
    let i = 1;
    map.forEach((value, key) => {
        if(i === 1){
            result = `${result}<li class="active"><a>${value.name}</a></li>\n`;
        }else{
            if(i < 5){
                result = `${result}<li><a>${value.name}</a></li>\n`;
            }else{
                result = `${result}<li class="disabled"><a>${value.name}</a></li>\n`;
            }
        }
        if(i === map.size){
           result  = result.slice(0,-1);
        }
        
        i++;
    });
    return result;
}

var html = template `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="index,follow" />
        <meta name="keywords" content="${"keywords"}">
        <meta namge="description" content="${"description"}" />
        <title>${"title"}</title>
        <script src="https://code.jquery.com/jquery-${"jqueryVer"}.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/${"bootstrapVer"}/js/bootstrap.min.js"></script>
        <script src="https://use.fontawesome.com/${"fontawesomeCDN"}.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/${"bootstrapVer"}/css/bootstrap.min.css">
        <link rel="stylesheet" href="./css/index.css">
    </head>
    <body>
        <div class="body-layout container-fluid">
            <div class="page-header row clearfix">
                <div class="col-md-12 column">
                    <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
                        <div class="container-fluid">
                            <span class="navbar-brand"><strong>${"title"}</strong></span>
                            <span class="navbar-text pull-right">
                                <a href="${"projectLink"}" class="navbar-link">
                                    <i class="fa fa-github fa-lg"></i>
                                </a>
                            </span>
                        </div>
                    </nav>
                </div>
            </div>
            <div class="panel panel-default center-block" style="width:70%;min-width: 600px;">
                <div class="panel-heading">
                    <div class="row">
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div id="sorts" class="dropdown">
                                <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                    Sort algorithms <i class="fa fa-caret-down fa-lg"></i></span>
                                </button>
                                <ul class="dropdown-menu">
                                    ${"menuItems"}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel-body">
                    <span>
                        This project implements work flow of sort 3D visualization based on Promise, you can see basic sorting structure of source code at bottom.
                    </span>
                </div>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="embed-responsive embed-responsive-16by9">
                            <iframe id="viewer" src="./sort/sort-exchange.html"></iframe>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div id="jsffdle-container" class="embed-responsive embed-responsive-16by9">
                            <script async src="//jsfiddle.net/ShenTengTu/hxk8q47a/embed/"></script>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <script src="./js/index.js"></script>
    </body>
</html>`;
/*-----*/
var outPath = path.resolve(__rootPath, "docs");
var fileName = `${outPath}\\index.html`;
var stream = fs.createWriteStream(fileName);
stream.end(beautify(html(dict)), "utf8", () => {
    console.log(`[done] ${fileName}`);
});

