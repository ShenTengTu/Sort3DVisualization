"use strict";
var path = require('path');
global.__rootPath = path.resolve(__dirname);

require('./src/template/index.template');
require('./src/template/sort.template');
