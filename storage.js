"use strict";

let storage = function() {    

    let saveData = function(name, data, listName) {
        function checkOverwrite(name, listName) {
            // Check if the map already exists in local storage
            let map = localStorage.getItem(name);
            if (map == undefined) {
                return true;
            }
            
            let maps = localStorage.getItem(listName); // return null if it doesn't exist yet

            if (maps == undefined) {
                return false; // cannot overwrite
            }

            // Check if it is in the list
            let list = maps.split(",");
            for (let item of list) {
                if (item === name) {
                    return true;
                }
            }

            return false;
        }

        function appendMap(name, listName) {
            let maps = localStorage.getItem(listName); // return null if it doesn't exist yet

            if (maps == undefined) {
                maps = "";
            }

            // Check if map already is in the list
            let list = maps.split(",");
            for (let item of list) {
                if (item === name) {
                    return;
                }
            }

            // Otherwise append it
            if (maps === "") {
                maps += name;
            } else {
                maps += "," + name;
            }

            localStorage.setItem(listName, maps);
        }
        
        if (name === "MAP_LIST" || name === "DUNGEON_LIST" || name === "") { // these are not valid!
            return;
        }

        if (checkOverwrite(name, listName)) {
            localStorage.setItem(name, data);
            appendMap(name, listName);
        }
    };

    let deleteMapData = function(name) {
        let maps = localStorage.getItem("MAP_LIST"); // return null if it doesn't exist yet

        if (maps == undefined) {
            maps = "";
        }

        let mapItems = maps.split(",");
        maps = "";
        for (let i = 0; i < mapItems.length; i++) {
            if (mapItems[i] === name) {
                continue;
            }

            if (maps === "") {
                maps += mapItems[i];
            } else {
                maps += "," + mapItems[i];
            }
        }
        
        localStorage.setItem("MAP_LIST", maps);
    };

    let getMapData = function(name) {
        return localStorage.getItem(name);
    };

    let saveMapData = function(name, data) {
        saveData(name, data, "MAP_LIST");
    };

    let getMapList = function() {
        let maps = localStorage.getItem("MAP_LIST"); // return null if it doesn't exist yet
        if (maps == undefined) {
            return [];
        }
        return maps.split(",");
    };

    let getDungeonData = function(name) {
        return localStorage.getItem(name);
    }

    let saveDungeonData = function(name, data) {
        saveData(name, data, "DUNGEON_LIST");
    }

    let getDungeonList = function() {
        let dungeons = localStorage.getItem("DUNGEON_LIST"); // return null if it doesn't exist yet
        if (dungeons == undefined) {
            return [];
        }
        return dungeons.split(",");
    }

    return {
        getMapData: getMapData,
        saveMapData: saveMapData,
        getMapList: getMapList,
        deleteMapData: deleteMapData,
        getDungeonData: getDungeonData,
        saveDungeonData: saveDungeonData,
        getDungeonList: getDungeonList
    };

}();
