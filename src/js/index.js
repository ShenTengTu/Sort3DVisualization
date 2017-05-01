"use strict";
var map = require("../data-map");

(() => {
    let map_it = map.entries();
    let next = map_it.next();
    let i = 1;
    
    while (!next.done) {
        let menu_item = $(`#sorts ul>li:nth-child(${i})`);
        let pair = next.value;
        let key = pair[0];
        let data = pair[1];
        if (!menu_item.hasClass("disabled")) {
            menu_item.on("click", (e) => {
                let target = $(e.currentTarget);
                if(! target.hasClass("active")){
                    console.log(key);
                    $("#sorts li.active").toggleClass("active");
                    target.toggleClass("active");

                    $("#viewer").attr("src", `./sort/${key}.html`);
                    $(`<script async src="//jsfiddle.net/ShenTengTu/${data.jsfiddle}/embed/"></script>`).replaceAll("#jsffdle-container>*");
                }
            });
        }
        next = map_it.next();
        i++;
    }
})();


