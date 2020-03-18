"use strict";

Vue.component('tile', {
        template: '\
                    <button class="tile"\
                        v-bind:id="type"\
                        v-on:click="tileClick"\
                        v-bind:title="title"\
                        >{{value}}</button>',
        props: ["id", "tile_id", "type", "value", "x", "y", "palette"],
        methods: {
            tileClick: function(){
                this.$emit('tileClick', this.id);
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

Vue.component('parameter', {
    template: `<div>\
        {{text}}\
        <input type="checkbox" v-model="paramValue" v-if="parameterType===${PARAMETERS.PARAMETER_CHECKBOX}" />\
        <input type="textbox" v-model="paramValue" v-if="parameterType===${PARAMETERS.PARAMETER_TEXTBOX}" />\
        <select v-model="paramValue" v-if="parameterType===${PARAMETERS.PARAMETER_DROPDOWN}">\
            <option v-for="item in values" v-bind:selected="this.paramValue === item">{{item}}</option>\
        </select>\
        </div>`,
    props: [ 'id', 'text', 'parameterType', 'values', 'initialValue' ],
    data: function() {
        return {
            paramValue: this.initialValue
        };
    },
    watch: {
        paramValue: function(newValue, oldValue) {
            this.$emit("parameterChanged", this.id, newValue);
        }
    }
});

Vue.component('parametersMenu', {
    template: '<div class="parametersWindow">\
            <parameter\
                v-for="param in palette[tile.tile_id].parameters"\
                v-bind:key="param.id"\
                v-bind:parameterType="param.control"\
                v-bind:text="param.text"\
                v-bind:initialValue="tile.parameters[param.id]"\
                v-bind:values="param.values"\
                v-bind:id="param.id"\
                v-on:parameterChanged="parameterChanged" />\
            <button v-on:click="exitMenu">Exit</button>\
        </div>',
    props: [ 'palette', 'tile' ],
    methods: {
        exitMenu: function() {
            this.$emit("exitParametersMenu");
        },
        parameterChanged: function(parameter, value) {
            this.tile.parameters[parameter] = value;
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
                showParameters: false,
                selectedTile: undefined,
                selectedEffect: effects[0].id,
                effects: effects,
                modes: [{ id: EDITMODES.MODE_PAINT, text:"Paint" }, { id: EDITMODES.MODE_DESIGN, text:"Design"}],
                editMode: EDITMODES.MODE_PAINT
            };
        },
        methods: {
            createEffects: function() {
                return [
                    {id:EFFECT_TYPES.EFFECT_TYPE_NONE, text: "No effect"},
                    {id:EFFECT_TYPES.EFFECT_TYPE_COLD, text: "Extreme Cold"},
                    {id:EFFECT_TYPES.EFFECT_TYPE_HEAT, text: "Extreme Heat"}];
            },
            createPalette: function() {
                return palette.createPallete();
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
            tileClick: function(id) {
                this.selectedTile = this.tiles[id];
                switch (this.editMode) {
                    case EDITMODES.MODE_PAINT:
                        this.cycle(id);
                        break;
                    case EDITMODES.MODE_DESIGN:
                        this.showDesignMenu(id);
                        break;
                }
            },
            cycle: function(id) {
                this.tiles[id].tile_id = this.selectedPalette.value.id;
                this.tiles[id].type = this.selectedPalette.value.type;
                this.tiles[id].value = this.selectedPalette.value.value;
            },
            showDesignMenu: function(id) {
                this.showParameters = true;
            },
            exitDesignMenu: function() {
                this.showParameters = false;
            },
            exitDesignMenu: function(id) {
                this.showParameters = false;
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

                    if (mapInfo.parameters !== undefined) {
                        for (let param of mapInfo.parameters) {
                            this.tiles[param.id].parameters = param.parameters;
                        }
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
                        v-on:tileClick="tileClick($event)" />\
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
                <select v-model="editMode" name="editMode">\
                    <option v-for="mode in modes" v-bind:selected="this.editMode === mode.id" v-bind:value="mode.id">{{mode.text}}</option>"\
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
                <parametersMenu v-if="showParameters"\
                    v-bind:palette="this.palette"\
                    v-bind:tile="this.selectedTile" \
                    v-on:exitParametersMenu="exitDesignMenu" />\
            </div>'
});

new Vue({ el: '#app' });
