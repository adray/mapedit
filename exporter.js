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

        // Things which do not create standard rooms
        function isRoom(tile) {
            return tile.type !== "wall" && tile.type !== "hole";
        }

        // Things which should only appear in a 1x1 room
        function isSingleTileRoom(tile) {
            return tile.type === "icespike";
        }

        function getIndex(x, y) {
            return x * context.height + y;
        }

        // First pass
        let grid = createGrid(context.width * context.height);
        for (let tile of context.tiles) {
            let wrapper = { x: tile.x, y: tile.y, used: false, partnered: false, item: tile};
            let index = getIndex(wrapper.x, wrapper.y);
            if (grid[index] === undefined && isRoom(tile) && !isSingleTileRoom(tile)) {
                // NOTE: This makes an assumption:
                // tile.y >= previous.y AND (tile.y > previous.y OR tile.x > previous.x)

                if (wrapper.x > 0 && wrapper.y > 0) {
                    let left = getIndex((wrapper.x - 1), wrapper.y);
                    let up = getIndex(wrapper.x, wrapper.y - 1);
                    let diagonal = getIndex((wrapper.x - 1), wrapper.y - 1);
                    if (grid[left] !== undefined &&
                        grid[up] !== undefined &&
                        grid[diagonal] !== undefined &&
                        !grid[left].used &&
                        !grid[up].used &&
                        !grid[diagonal].used &&
                        isRoom(grid[left].item) &&
                        isRoom(grid[up].item) &&
                        isRoom(grid[diagonal].item) &&
                        isRoom(tile)) {
                        
                        // We found a 2x2 room
                        context.output += context.padding +
                            `<Room X="${grid[diagonal].x + context.offsetX}" Y="${grid[diagonal].y + context.offsetY}" Type="Small" />` + 
                            context.newline;
                        grid[up].used = true;
                        grid[left].used = true;
                        grid[diagonal].used = true;
                        wrapper.used = true;
                    }
                }

                grid[index] = wrapper;
            } else {
                wrapper.used = true;
                grid[index] = wrapper;
            }
        }

        // 2nd pass : Write corridors
        // TODO: write 1x1 corridors (ideally using cols and rows)
        for (let tile of grid) {
            if (tile !== undefined && !tile.used) {
                // We found a 1x1 room
                context.output += context.padding +
                `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Corridor" />` + 
                context.newline;
            }
        }

        // 3rd pass : Write everything else
        for (let tile of context.tiles) {
            switch (tile.type) {
                case "start":
                    context.output += context.padding + `<!-- Start: [${tile.x+context.offsetX}, ${tile.y+context.offsetY}] -->` + context.newline;
                    break;
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
                    {
                    let up = tile.y > 0 ? getIndex(tile.x, tile.y - 1) : undefined;
                    let down = tile.y+1 < context.height ? getIndex(tile.x, tile.y + 1) : undefined;
                    let left = tile.x > 0 ? getIndex(tile.x-1, tile.y) : undefined;
                    let right = tile.x + 1 < context.width ? getIndex(tile.x+1, tile.y) : undefined;
                    if (up !== undefined && grid[up] !== undefined && isRoom(grid[up].item) &&
                        down !== undefined && grid[down] !== undefined && isRoom(grid[down].item)) {
                            context.output += context.padding +
                                `<FakeWall X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y-1 + context.offsetY}" />` + context.newline;
                        }
                    else if (left !== undefined && grid[left] !== undefined && isRoom(grid[left].item) &&
                        right !== undefined && grid[right] !== undefined && isRoom(grid[right].item)) {
                            context.output += context.padding +
                                `<FakeWall X1="${tile.x-1 + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y + context.offsetY}" />` + context.newline;
                        }
                    }
                    break;
                case "jump":
                    {
                        const JumpVertical = "Vertical";
                        const JumpHori = "Horizontal";
                        let jumpType = undefined;
                        let endX = tile.x;
                        let endY = tile.y;

                        for (let x = tile.x-1; x >= 0; x--) {
                            let index = getIndex(x, tile.y);
                            let nextTile = grid[index];
                            if (nextTile !== undefined && !nextTile.item.partnered && nextTile.item.type === "jump") {
                                jumpType = JumpHori;
                                endX = x;
                                break;
                            }
                            else if (nextTile === undefined || nextTile.item.type !== "hole") {
                                break;
                            }
                        }

                        if (jumpType === undefined) {
                            for (let y = tile.y-1; y >= 0; y--) {
                                let index = getIndex(tile.x, y);
                                let nextTile = grid[index];
                                if (nextTile !== undefined && !nextTile.item.partnered && nextTile.item.type === "jump") {
                                    jumpType = JumpVertical;
                                    endY = y;
                                    break;
                                }
                                else if (nextTile === undefined || nextTile.item.type !== "hole") {
                                    break;
                                }
                            }
                        }

                        if (jumpType !== undefined) {
                            grid[getIndex(tile.x, tile.y)].partnered = true;
                            if (jumpType === JumpVertical) {
                                context.output += context.padding + 
                                    `<JumpPad Orientation="${jumpType}" X="${tile.x+context.offsetX}">` + context.newline;
                                context.indent();
                                context.output += context.padding + `<Start Y="${tile.y+context.offsetY}" />` + context.newline;
                                context.output += context.padding + `<End Y="${endY+context.offsetY}" />` + context.newline;
                                context.unindent();
                                context.output += context.padding + `</JumpPad>` + context.newline;
                            } else if (jumpType === JumpHori) {
                                context.output += context.padding + 
                                    `<JumpPad Orientation="${jumpType}" Y="${tile.y+context.offsetY}">` + context.newline;
                                context.indent();
                                context.output += context.padding + `<Start X="${tile.x+context.offsetX}" />` + context.newline;
                                context.output += context.padding + `<End X="${endX+context.offsetX}" />` + context.newline;
                                context.unindent();
                                context.output += context.padding + `</JumpPad>` + context.newline;
                            }
                        }
                    }
                    break;
                case "door":
                    {
                    let up = tile.y > 0 ? getIndex(tile.x, tile.y - 1) : undefined;
                    let down = tile.y+1 < context.height ? getIndex(tile.x, tile.y + 1) : undefined;
                    let left = tile.x > 0 ? getIndex(tile.x-1, tile.y) : undefined;
                    let right = tile.x + 1 < context.width ? getIndex(tile.x+1, tile.y) : undefined;
                    if (up !== undefined && grid[up] !== undefined && isRoom(grid[up].item) &&
                        down !== undefined && grid[down] !== undefined && isRoom(grid[down].item)) {
                            context.output += context.padding +
                                `<Door X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y-1 + context.offsetY}" Locked="True" ID="Door" />` + context.newline;
                        }
                    else if (left !== undefined && grid[left] !== undefined && isRoom(grid[left].item) &&
                        right !== undefined && grid[right] !== undefined && isRoom(grid[right].item)) {
                            context.output += context.padding +
                                `<Door X1="${tile.x-1 + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y + context.offsetY}" Locked="True" ID="Door" />` + context.newline;
                        }
                    }
                    break;
                case "icespike":
                    {
                        context.output += context.padding + 
                            `<IceSpike X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` +
                            context.newline;
                    }
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
