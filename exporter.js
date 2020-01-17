"use strict";

let exporter = function() {

    function writeHeader(context) {
        context.output += context.padding + `<Floor Value="Floor" Name="F1">${context.newline}`;
        context.indent();
    }

    function writeFooter(context) {
        context.unindent();
        context.output += context.padding + `</Floor>`;
    }

    function writeBody(context) {

        function createGrid(size) {
            let grid = [];
            for (let i = 0; i < size; i++) {
                grid.push(undefined);
            }
            return grid;
        }

        function isRoom(tile) {
            return tile.type !== "wall" && tile.type !== "hole";
        }

        // First pass
        let grid = createGrid(context.width * context.height);
        for (let tile of context.tiles) {
            let wrapper = { x: tile.x, y: tile.y, item: tile};
            let index = wrapper.x * context.height + wrapper.y;
            if (grid[index] === undefined && isRoom(tile)) {
                // NOTE: This makes an assumption:
                // tile.y >= previous.y AND (tile.y > previous.y OR tile.x > previous.x)
                let shouldAdd = true;

                if (wrapper.x > 0 && wrapper.y > 0) {
                    let left = (wrapper.x - 1) * context.height + wrapper.y;
                    let up = wrapper.x * context.height + wrapper.y - 1;
                    let diagonal = (wrapper.x - 1) * context.height + wrapper.y - 1;
                    if (grid[left] !== undefined &&
                        grid[up] !== undefined &&
                        grid[diagonal] !== undefined &&
                        isRoom(grid[left].item) &&
                        isRoom(grid[up].item) &&
                        isRoom(grid[diagonal].item) &&
                        isRoom(tile)) {
                        
                        // We found a 2x2 room
                        context.output += context.padding +
                            `<Room X="${grid[diagonal].x + context.offsetX}" Y="${grid[diagonal].y + context.offsetY}" Type="Small" />` + 
                            context.newline;
                        shouldAdd = false;
                        grid[up] = undefined;
                        grid[left] = undefined;
                        grid[diagonal] = undefined;
                    }
                }

                if (shouldAdd) {
                    grid[index] = wrapper;
                }
            }
        }

        // 2nd pass : Write corridors
        // TODO: write 1x1 corridors (ideally using cols and rows)
        for (let tile of grid) {
            if (tile !== undefined) {
                // We found a 1x1 room
                context.output += context.padding +
                `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Corridor" />` + 
                context.newline;
            }
        }

        // 3rd pass : Write everything else
        for (let tile of context.tiles) {
            switch (tile.type) {
                //case "start":
                //    context.output += context.padding + `$` + context.newline;
                //    break;
                case "end":
                    context.output += context.padding +
                        `<Exit X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" OnEnter="Trigger" />` + context.newline;
                    break;
                case "hole":
                    context.output += context.padding +
                        `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Hole" />` + context.newline;
                    break;
                case "enemy":
                    context.output += context.padding +
                        `<AI X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" OnSight="Trigger_Fight">` + context.newline;
                    context.indent();
                    context.output += context.padding +
                        `<Direction X="0" Y="1" />` + context.newline;
                    context.unindent();
                    context.output += context.padding + `</AI>` + context.newline;
                    break;
                case "terminal":
                    context.output += context.padding +
                        `<Terminal X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                    break;
                case "hidden":
                    // TODO
                    //context.output += ""
                    break;
                case "jump":
                    break;
                case "door":

                    break;
            }
        }
    }

    let exportMap = function(tiles, width, height) {
        let context = {
            tiles: tiles,
            output: "",
            padding: "",
            newline: "\r\n",
            width: width,
            height: height,
            offsetX: 4,
            offsetY: 5,
            indent: function() {
                this.padding += "    ";
            },
            unindent: function() {
                this.padding = this.padding.substring(0, this.padding.length - 4);
            }
        };
        
        writeHeader(context);
        writeBody(context);
        writeFooter(context);
        return context.output;
    };

    let saveFileCsv = function(tiles, widthScale, heightScale) {
        let output = "";
        output += `${widthScale},${heightScale}\r\n`;
        let lastTile = undefined;
        for (let tile of tiles) {
            
            if (lastTile !== undefined && tile.y > lastTile.y) {
                output += "\r\n" + tile.tile_id;
            } else if (lastTile === undefined) {
                output += tile.tile_id;
            } else {
                output += "," + tile.tile_id;
            }            

            lastTile = tile;
        }
        return output;
    };

    let saveFileJSON = function(tiles, widthScale, heightScale) {
        let saveData = {
            widthScale: widthScale,
            heightScale: heightScale,
            data: []
        };
        for (let tile of tiles) {
            saveData.data.push(tile.tile_id);
        }
        return JSON.stringify(saveData);
    };

    let loadFileJSON = function(mapData) {
        return JSON.parse(mapData);
    };

    return {
        exportMap: exportMap,
        saveFileCsv: saveFileCsv,
        saveFileJSON: saveFileJSON,
        loadFileJSON: loadFileJSON
    };

}();
