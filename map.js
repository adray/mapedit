"use strict";

let enemies = function() {
    return {
        lookup: function (name) {
            let values = ENEMY_TYPES.VALUES;
            for (let item of values) {
                if (item.Name === name) {
                    return item;
                }
            }

            return null;
        },
        getData: function() {
            let values = ENEMY_TYPES.VALUES;
            let list = [];
            for (let item of values) {
                list.push(item.Name);
            }
            return list;
        }
    };
}();

let identifers = function() {
    return {
        is: function(type) {
            switch (type) {
                case PARAMETER_TYPE.PARAMETER_TYPE_ID:
                case PARAMETER_TYPE.PARAMETER_TYPE_BARRIER1:
                case PARAMETER_TYPE.PARAMETER_TYPE_BARRIER2:
                case PARAMETER_TYPE.PARAMETER_TYPE_BARRIER2:
                case PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID1:
                case PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID2:
                case PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID3:
                case PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID4:
                case PARAMETER_TYPE.PARAMETER_TYPE_SPIKES1:
                case PARAMETER_TYPE.PARAMETER_TYPE_SPIKES2:
                case PARAMETER_TYPE.PARAMETER_TYPE_SPIKES3:
                case PARAMETER_TYPE.PARAMETER_TYPE_SPIKES4:
                case PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL1:
                case PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL2:
                case PARAMETER_TYPE.PARAMETER_TYPE_FAN1:
                case PARAMETER_TYPE.PARAMETER_TYPE_FAN2:
                case PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE1:
                case PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE2:
                case PARAMETER_TYPE.PARAMETER_TYPE_DOOR1:
                case PARAMETER_TYPE.PARAMETER_TYPE_DOOR2:
                case PARAMETER_TYPE.PARAMETER_TYPE_DOOR3:
                case PARAMETER_TYPE.PARAMETER_TYPE_DOOR4:
                    return true;
                default:
                    return false;
            }
        }
    }
}();

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
        <span v-if="parameterType===${PARAMETERS.PARAMETER_DATALIST}">\
            <input type="text" v-model="paramValue" v-bind:list="this.inputName">\
            <datalist v-bind:id="this.inputName">\
                <option v-for="item2 in this.dataList" >{{item2}}</option>\
            </datalist>\
        </span>\
        </div>`,
    props: [ 'id', 'text', 'parameterType', 'values', 'initialValue', 'listSource', 'context' ],
    data: function() {
        return {
            paramValue: this.initialValue,
            duplicateId: true,
            dataList: [],
            inputName: `data_input_${this.id}`
        };
    },
    mounted: function() {
        this.dataList = this.getDataList();
    },
    watch: {
        paramValue: function(newValue, oldValue) {
            this.$emit("parameterChanged", this.id, newValue);

            // Update the list of ids:
            if (identifers.is(this.id)) {
                if (!this.duplicateId) {
                    this.context.idSource.delete(oldValue);
                }

                this.duplicateId = this.context.idSource.has(newValue);
                if (newValue !== "") {
                    this.context.idSource.add(newValue);
                }
                this.dataList = this.getDataList();
            }
        }
    },
    methods: {
        getDataList: function() {
            if (this.listSource === DATALIST_SOURCE.DATALIST_SOURCE_ENEMY) {
                return enemies.getData();
            } else if (this.listSource === DATALIST_SOURCE.DATALIST_SOURCE_ID) {
                return this.context.idSource;
            }
            return [];
        }
    }
});

Vue.component('calculated', {
    template: `<div>\
        {{text}}\
        <input type="textbox" v-model="paramValue" disabled="True" />\
        </div>`,
    props: ['id', 'text', 'paramValue']
});

Vue.component('parametersMenu', {
    template: '<div class="parametersWindow">\
            <div>\
                <parameter\
                    v-for="param in palette[tile.tile_id].parameters"\
                    v-bind:key="param.id"\
                    v-bind:parameterType="param.control"\
                    v-bind:text="param.text"\
                    v-bind:initialValue="tile.parameters[param.id]"\
                    v-bind:values="param.values"\
                    v-bind:id="param.id"\
                    v-bind:listSource="param.source"\
                    v-bind:context="context"\
                    v-on:parameterChanged="parameterChanged" />\
            </div>\
            <div>\
                <calculated\
                    v-for="calc in this.calc"\
                    v-bind:key="calc.id"\
                    v-bind:text="calc.text"\
                    v-bind:id="calc.id"\
                    v-bind:paramValue="calc.value" />\
            </div>\
            <button v-on:click="exitMenu">Exit</button>\
        </div>',
    props: [ 'palette', 'tile', 'context' ],
    methods: {
        exitMenu: function() {
            this.$emit("exitParametersMenu");
        },
        parameterChanged: function(parameter, value) {
            this.tile.parameters[parameter] = value;

            for (let calc of this.calc) {
                this.applyCalculation(calc, parameter, false);
            }
        },
        applyCalculation: function(c, parameter, force) {
            if (c.id === CALCULATED_TYPE.CALCULATED_TYPE_CHALLENGE_RATING) {
                if (!force) {
                    switch (parameter) {
                    case PARAMETER_TYPE.PARAMETER_TYPE_ENEMY1:
                    case PARAMETER_TYPE.PARAMETER_TYPE_ENEMY2:
                    case PARAMETER_TYPE.PARAMETER_TYPE_ENEMY3:
                    case PARAMETER_TYPE.PARAMETER_TYPE_ENEMY4:
                        {
                            this.applyChallengeRating(c);
                        }
                        break;
                    }
                } else {
                    this.applyChallengeRating(c);
                }
            }
        },
        applyChallengeRating: function(c) {
            let e = [this.tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY1] || "",
                this.tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY2] || "",
                this.tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY3] || "",
                this.tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY4] || ""];
            let rating = 0;
            let count = 0;
            for (let item of e) {
                if (item != "") {
                    let enemy = enemies.lookup(item);
                    if (enemy !== null) {
                        rating = Math.max(rating, enemy.Rating);
                        count++;
                    }
                }
            }

            switch (count) {
                case 0:
                    c.value = 0;
                    break;
                case 1:
                    c.value = rating * 0.8;
                    break;
                case 2:
                    c.value = rating;
                    break;
                case 3:
                    c.value = rating * 1.5;
                    break;
                case 4:
                    c.value = rating * 3;
                    break;
            }
        },
        getCalcs: function() {
            let mapped = [];
            let list = this.palette[this.tile.tile_id].calculated || [];
            for (let c of list) {
                let item = {
                    id: c.id,
                    text: c.text,
                    value: ""
                };
                this.applyCalculation(item, null, true);
                mapped.push(item);
            }

            return mapped;
        }
    },
    data: function() {
        let calcs = this.getCalcs();
        return {
            calc: calcs
        };
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
                sharedData: "",
                showLoadMap: false,
                showParameters: false,
                selectedTile: undefined,
                selectedEffect: effects[0].id,
                effects: effects,
                modes: [{ id: EDITMODES.MODE_PAINT, text:"Paint" }, { id: EDITMODES.MODE_DESIGN, text:"Design"}],
                editMode: EDITMODES.MODE_PAINT,
                context: this.createContext()
            };
        },
        methods: {
            createContext: function() {
                return { idSource: new Set() };
            },
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
                this.sharedData = exporter.saveFileJSON(this.tiles,
                    this.$refs.width.value,
                    this.$refs.height.value,
                    Number(this.selectedEffect));
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
                    this.context = this.createContext();
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

                            for (let elementId = 0; elementId < param.parameters.length; elementId++) {
                                let element = param.parameters[elementId];
                                if (element != undefined) { // is case null
                                    if (identifers.is(elementId)) {
                                        this.context.idSource.add(element);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        template: '\
            <div class="editor">\
                <mapHeader />\
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
                    <textarea class="export">{{ sharedData }}</textarea>\
                </div>\
                <loadMap v-if="showLoadMap" v-on:exitLoadMap="exitLoadMap" v-on:loadMap="loadMap($event)" />\
                <parametersMenu v-if="showParameters"\
                    v-bind:palette="this.palette"\
                    v-bind:tile="this.selectedTile"\
                    v-bind:context="this.context" \
                    v-on:exitParametersMenu="exitDesignMenu" />\
            </div>'
});

new Vue({ el: '#app' });
