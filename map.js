"use strict";

Vue.component('tile', {
        template: '\
                    <button class="tile"\
                        v-bind:id="type"\
                        v-on:click="cycle"\
                        v-bind:title="title"\
                        >{{value}}</button>',
        props: ["id", "tile_id", "type", "value", "x", "y", "palette"],
        methods: {
            cycle: function(){
                this.$emit('cycle', this.id);
            }
        },
        computed: {
            title: function() {
                return this.type + ` [${this.x},${this.y}]`;
            }
        }
});

Vue.component('palette-item', {
    props: [ 'tag', 'type', 'value' ],
    template: '<button class="tile" v-bind:title="type" v-on:click="$emit(`palette-update`, tag)" v-bind:id="type">{{value}}</button>'
});

Vue.component('palette', {
    props: [ "items" ],
    template: '\
        <div>\
            <palette-item v-for="item in items"\
                v-bind:key="item.id"\
                v-bind:tag="item.id"\
                v-bind:type="item.type"\
                v-bind:value="item.value"\
                v-on:palette-update="paletteUpdate($event)" />\
        </div>',
    methods: {
        paletteUpdate: function(paletteItem) {
            // bubble event up
            this.$emit('palette-update', paletteItem);
        }
    }
});

Vue.component('loadMap', {
    template: '<div class="loadMapWindow">\
            <button v-for="map in getMaps" v-on:click="$emit(`loadMap`, map)">{{map}}</button>\
            <button v-on:click="exitMenu">Exit</button>\
        </div>',
    computed: {
        getMaps: function() {
            return storage.getMapList();
        }
    },
    methods: {
        exitMenu: function() {
            this.$emit("exitLoadMap");
        }
    }
});

Vue.component('editor', {
        data: function() {
            let palette = this.createPalette();
            let effects = this.createEffects();
            return {
                tiles: this.createGrid(7, 6),
                gridWidth: "_1",
                palette: palette,
                selectedPalette: palette[0], 
                width: [1,2,3],
                height: [1,2,3],
                exportedData: "",
                showLoadMap: false,
                selectedEffect: effects[0].id,
                effects: effects
            };
        },
        methods: {
            createEffects: function() {
                return [{ id:0, text:"No effect"}, {id:1, text:"Extreme Cold"}, {id:2, text: "Extreme Heat"}];
            },
            createPalette: function() {
                return [
                    {
                        id: 0,
                        type: "empty",
                        value: ""
                    },
                    {
                        id: 1,
                        type: "wall",
                        value: ""
                    },
                    {
                        id: 2,
                        type: "start",
                        value: ""
                    },
                    {
                        id: 3,
                        type: "end",
                        value: ""
                    },
                    {
                        id: 4,
                        type: "hole",
                        value: ""
                    },
                    {
                        id: 5,
                        type: "enemy",
                        value: "E"
                    },
                    {
                        id: 6,
                        type: "terminal",
                        value: "T"
                    },
                    {
                        id: 7,
                        type: "hidden",
                        value: ""
                    },
                    {
                        id: 8,
                        type: "jump",
                        value: "J"
                    },
                    {
                        id: 9,
                        type: "door",
                        value: "D"
                    },
                    {
                        id: 10,
                        type: "icespike",
                        value: "S"
                    }
                ];
            },
            createGrid: function(width, height) {
                let tiles = [];

                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        let identifer = i * width + j;
                        let obj = {id : identifer, tile_id: 0, type:"empty", value:"", x:j, y:i};
                        tiles.push(obj);
                    }
                }
                return tiles;
            },
            resize: function() {
                let w = this.$refs.width.value * 7;
                let h = this.$refs.height.value * 6;
                this.gridWidth = "_" + this.$refs.width.value;
                this.tiles = this.createGrid(w, h);
            },
            paletteUpdate: function(paletteItem) {
                this.selectedPalette = { id: paletteItem, value: this.palette[paletteItem] };
            },
            exportMap: function() {
                let w = this.$refs.width.value * 7;
                let h = this.$refs.height.value * 6;
                this.exportedData = exporter.exportMap(this.tiles, w, h, Number(this.selectedEffect));
            },
            saveMap: function() {
                let saveData = exporter.saveFileJSON(
                    this.tiles,
                    this.$refs.width.value,
                    this.$refs.height.value,
                    Number(this.selectedEffect));
                let mapname = this.$refs.mapname.value;
                if (mapname !== "") {
                    storage.saveMapData(mapname, saveData);
                }
            },
            cycle: function(id) {
                this.tiles[id].tile_id = this.selectedPalette.value.id;
                this.tiles[id].type = this.selectedPalette.value.type;
                this.tiles[id].value = this.selectedPalette.value.value;
            },
            loadMapMenu: function() {
                this.showLoadMap = true;
            },
            exitLoadMap: function() {
                this.showLoadMap = false;
            },
            loadMap: function(map) {
                this.exitLoadMap();

                let mapData = storage.getMapData(map); // can be null
                if (mapData != undefined) {
                    let mapInfo = exporter.loadFileJSON(mapData);
                    this.$refs.mapname.value = map;
                    this.$refs.width.value = mapInfo.widthScale;
                    this.$refs.height.value = mapInfo.heightScale;
                    this.selectedEffect = mapInfo.effect || 0;
                    this.resize();
                    
                    let id = 0;
                    for (let tile of mapInfo.data) {
                        let paletteID = Number(tile);
                        this.tiles[id].tile_id = paletteID;
                        this.tiles[id].type = this.palette[paletteID].type;
                        this.tiles[id].value = this.palette[paletteID].value;
                        id++;
                    }
                }
            }
        },
        template: '\
            <div class="editor">\
                <div class="editorGrid" v-bind:id="gridWidth">\
                    <tile v-for="tile in tiles"\
                        v-bind="tile"\
                        v-bind:palette="selectedPalette"\
                        v-bind:key="tile.id"\
                        v-on:cycle="cycle($event)" />\
                </div>\
                <select name="width" ref="width" v-on:change="resize">\
                    <option v-for="size in width" v-bind:value="size">{{size}}</option>\
                </select>\
                <select name="height" ref="height" v-on:change="resize">\
                    <option v-for="size in height" v-bind:value="size">{{size}}</option>\
                </select>\
                <select v-model="selectedEffect" name="effect">\
                    <option v-for="effect in effects" v-bind:selected="this.selectedEffect === effect.id" v-bind:value="effect.id">{{effect.text}}</option>"\
                </select>\
                <palette v-bind:items="palette" v-on:palette-update="paletteUpdate($event)" />\
                Name:<input name="mapname" ref="mapname" />\
                <button v-on:click="saveMap">Save</button>\
                <button v-on:click="loadMapMenu">Load</button>\
                <button v-on:click="exportMap">Export</button>\
                <div>\
                    <textarea class="export">{{ exportedData }}</textarea>\
                </div>\
                <loadMap v-if="showLoadMap" v-on:exitLoadMap="exitLoadMap" v-on:loadMap="loadMap($event)" />\
            </div>'
});

new Vue({ el: '#app' });
