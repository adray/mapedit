"use strict";

Vue.component('mapRow', {
    props: [ 'name' ],
    template: `<span>{{name}}<input type="checkbox" v-model="selected" /></span>`,
    data: function() {
        return {
            selected: false
        }
    },
    watch: {
        selected: function(newValue, oldValue) {
            this.$emit("parameterChanged", this.name, newValue);
        }
    }
});

Vue.component('loadMap', {
    template: '<div class="loadMapWindow">\
            <mapRow v-for="map in getMaps" v-bind:key="map" v-bind:name="map" v-on:parameterChanged="parameterChanged" />\
            <div>\
                <button v-on:click="okMenu">Ok</button>\
                <button v-on:click="exitMenu">Exit</button>\
            </div>\
        </div>',
    data: function() {
        return {
            selected: new Set()
        };
    },
    computed: {
        getMaps: function() {
            return storage.getMapList();
        }
    },
    methods: {
        okMenu: function() {
            this.$emit("loadMap", this.selected);
        },
        exitMenu: function() {
            this.$emit("exitLoadMap");
        },
        parameterChanged: function(name, newValue) {
            if (newValue) {
                this.selected.add(name);
            } else {
                this.selected.delete(name);
            }
        }
    }
});

Vue.component('dungeonRow', {
    template: '<span><button v-on:click="$emit(`loadDungeon`, name)">{{name}}</button></span>',
    props: [ "name" ]
})

Vue.component('loadDungeon', {
    template: '<div class="loadDungeonWindow">\
        <dungeonRow v-for="dungeon in getDungeons" v-bind:key="dungeon" v-bind:name="dungeon" v-on:loadDungeon="loadDungeon" />\
        <div>\
            <button v-on:click="exitMenu">Exit</button>\
        </div>\
    </div>',
    computed: {
        getDungeons: function() {
            return storage.getDungeonList();
        }
    },
    methods: {
        loadDungeon: function(name) {
            this.$emit("loadDungeon", name);
        },
        exitMenu: function() {
            this.$emit("exitLoadDungeon");
        }
    }
})

Vue.component('tile', {
    props: [ 'tile' ],
    template: '\
        <div class="tile">\
            Floor:<input type="textbox" v-model="tile.floorTitle"></input>\
            <button v-on:click="find">Find...</button>\
            <div>\
                <span v-for="map in tile.maps" v-bind:key="map">{{map}}</span>\
            </div>\
        </div>',
    methods: {
        find: function() {
            this.$emit("showLoadMap", (maps) =>
            {
                this.tile.maps = maps;
            });
        }
    }
});

Vue.component('editor', {
        data: function() {
            return {
                gridWidth: "_1",
                gridHeight: 1,
                tiles: [],
                height: [1,2,3,4,5,6,7,8,9,10],
                showLoadMap: false,
                showLoadDungeon: false,
                loadMapCallback: undefined,
                exportedData: "",
                exportedFloorData: "",
                palette: palette.createPallete(),
                dungeonName: "",
                objectTileSet: "",
                roomTileSet: "",
                wallTileSet: "",
                backDrop: ""
            };
        },
        methods: {
            resize: function() {
                this.gridHeight = this.$refs.height.value;
                this.tiles = [];
                for (let i = 0; i < this.gridHeight; i++) {
                    this.tiles.push({
                        id: i,
                        maps: [],
                        floorTitle: "F" + (i+1),
                        floorId: "Floor" + (i+1)
                    });
                }
            },
            showLoadMapMenu: function(callback) {
                this.showLoadMap = true;
                this.loadMapCallback = callback;
                this.exitLoadDungeon();
            },
            exitLoadMap: function() {
                this.showLoadMap = false;
            },
            loadMap: function(maps) {
                this.showLoadMap = false;
                if (this.loadMapCallback !== undefined) {
                    this.loadMapCallback(maps);
                }
            },
            exportDungeon: function() {
                this.exportedData = "";

                const newline = "\r\n";
                const indent = "    ";

                this.exportedData += "<Dungeon" + newline +
                    indent + `ObjectTileSet="${this.objectTileSet}"` + newline +
                    indent + `RoomTileSet="${this.roomTileSet}"` + newline +
                    indent + `WallTileSet="${this.wallTileSet}"` + newline +
                    indent + `Backdrop="${this.backDrop}">` + newline;

                for(let floorIndex = 0; floorIndex < this.tiles.length; floorIndex++){
                    let tile = this.tiles[floorIndex];
                    let hasNext = floorIndex + 1 < this.tiles.length;
                    let mapIndex = 1;
                    for (let map of tile.maps) {
                        let mapData = storage.getMapData(map);
                        if (mapData != undefined) { // can be null
                            let mapInfo = exporter.loadFileJSON(mapData);

                            let grid = this.createGrid(mapInfo.widthScale*7, mapInfo.heightScale*6);

                            let id = 0;
                            for (let tile of mapInfo.data) {
                                let paletteID = Number(tile);
                                grid[id].tile_id = paletteID;
                                grid[id].type = this.palette[paletteID].type;
                                grid[id].value = this.palette[paletteID].value;
                                id++;
                            }

                            if (mapInfo.parameters !== undefined) {
                                for (let param of mapInfo.parameters) {
                                    grid[param.id].parameters = param.parameters;
                                }
                            }

                            this.exportedData +=
                                exporter.exportMap(grid,
                                    mapInfo.widthScale*7,
                                    mapInfo.heightScale*6,
                                    mapInfo.effect || 0,
                                    tile.floorId + "-" + mapIndex,
                                    tile.floorTitle,
                                    hasNext ? this.tiles[floorIndex+1].floorTitle : "",
                                    indent,
                                    floorIndex === 0,
                                    this.dungeonName) +
                                newline;
                        }

                        mapIndex++;
                    }
                }

                this.exportedData += "</Dungeon>" + newline;
                this.exportFloorData();
            },
            exportFloorData: function() {
                this.exportedFloorData = "";
                const newline = "\r\n";
                for(let floorIndex = 1; floorIndex < this.tiles.length; floorIndex++){
                    this.exportedFloorData += "TriggerOneFrom(dungeon";
                    let tile = this.tiles[floorIndex];
                    let mapIndex = 1;
                    for (let map of tile.maps) {
                        this.exportedFloorData += `, "Trigger_${tile.floorId}-${mapIndex}"`;
                        mapIndex++;
                    }
                    this.exportedFloorData += ");" + newline;
                }
            },
            createGrid: function(width, height) {
                let tiles = [];

                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        let identifer = i * width + j;
                        let obj = {
                            id : identifer,
                            tile_id: TILE_TYPES.TILE_EMPTY,
                            type:"empty",
                            value:"",
                            x:j,
                            y:i,
                            parameters: []
                        };
                        tiles.push(obj);
                    }
                }
                return tiles;
            },
            saveDungeon: function() {
                let floors = [];
                for (let floor of this.tiles) {
                    floors.push({
                        id: floor.id,
                        maps: Array.from(floor.maps),
                        floorTitle: floor.floorTitle,
                        floorId: floor.floorId
                    });
                }

                let dungeonData = {
                    numberOfFloors: this.gridHeight,
                    floors: floors,
                    objectTileSet: this.objectTileSet,
                    roomTileSet: this.roomTileSet,
                    wallTileSet: this.wallTileSet,
                    backDrop: this.backDrop
                };

                storage.saveDungeonData(this.dungeonName, JSON.stringify(dungeonData));
            },
            showLoadDungeonMenu: function() {
                this.showLoadDungeon = true;
                this.exitLoadMap();
            },
            loadDungeon: function(dungeon) {
                this.exitLoadDungeon();

                let dungeonData = storage.getDungeonData(dungeon);
                if (dungeonData != null) {
                    let dungeonInfo = JSON.parse(dungeonData);

                    this.dungeonName = dungeon;
                    this.objectTileSet = dungeonInfo.objectTileSet || "";
                    this.roomTileSet = dungeonInfo.roomTileSet || "";
                    this.wallTileSet = dungeonInfo.wallTileSet || "";
                    this.backDrop = dungeonInfo.backDrop || "";
                    this.$refs.height.value = Number(dungeonInfo.numberOfFloors);
                    this.resize();

                    let index = 0;
                    for (let floor of dungeonInfo.floors) {
                        this.tiles[index].id = floor.id;
                        this.tiles[index].floorIndex = floor.floorIndex;
                        this.tiles[index].floorId = floor.floorId;
                        this.tiles[index].maps = new Set(floor.maps);
                        index++;
                    }
                }
            },
            exitLoadDungeon: function() {
                this.showLoadDungeon = false;
            }
        },
        template: `\
        <div>\
            <mapHeader />\
            <div class="editorGrid" v-bind:id="gridWidth">\
                <tile v-for="tile in tiles"\
                    v-bind="tile"\
                    v-bind:key="tile.id"\
                    v-bind:tile="tile"\
                    v-on:tileClick="tileClick($event)"
                    v-on:showLoadMap="showLoadMapMenu($event)" />\
            </div>\
            <select name="height" ref="height" v-on:change="resize">\
                <option v-for="size in height" v-bind:value="size">{{size}}</option>\
            </select>\
            Name:<input type="text" v-model="dungeonName" />\
            <button name="save" v-on:click="saveDungeon">Save</button>\
            <button name="load" v-on:click="showLoadDungeonMenu">Load</button>\
            <button name="export" v-on:click="exportDungeon">Export</button>\
            <div>\
                Object Tileset:<input type="text" v-model="objectTileSet" />\
                Room Tileset:<input type="text" v-model="roomTileSet" />\
                Wall Tileset:<input type="text" v-model="wallTileSet" />\
                Backdrop:<input type="text" v-model="backDrop" />\
            </div>\
            <div>\
                <textarea class="export">{{ exportedData }}</textarea>\
            </div>\
            <div>\
                <textarea class="export">{{ exportedFloorData }}</textarea>\
            </div>\
            <loadMap v-if="showLoadMap" v-on:exitLoadMap="exitLoadMap" v-on:loadMap="loadMap($event)" />\
            <loadDungeon v-if="showLoadDungeon" v-on:exitLoadDungeon="exitLoadDungeon" v-on:loadDungeon="loadDungeon($event)" />\
        </div>`
    });

new Vue({ el: '#app' });
