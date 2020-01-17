"use strict";

let storage = function() {

    let getMapData = function(name) {
        return localStorage.getItem(name);
    };

    let saveMapData = function(name, data) {
        function appendMap(name) {
            let maps = localStorage.getItem("MAP_LIST"); // return null if it doesn't exist yet

            if (maps == undefined) {
                maps = "";
            }

            // Check if map already is in the list
            let list = maps.split(",");
            for (let item of list) {
                if (item == name) {
                    return;
                }
            }

            // Otherwise append it
            if (maps === "") {
                maps += name;
            } else {
                maps += "," + name;
            }

            localStorage.setItem("MAP_LIST", maps);
        }
        
        if (name == "MAP_LIST" || name === "") { // this are not valid!
            return;
        }

        localStorage.setItem(name, data);
        appendMap(name);
    };

    let getMapList = function() {
        let maps = localStorage.getItem("MAP_LIST"); // return null if it doesn't exist yet
        if (maps == undefined) {
            return [];
        }
        return maps.split(",");
    };

    return {
        getMapData: getMapData,
        saveMapData: saveMapData,
        getMapList: getMapList
    };

}();
