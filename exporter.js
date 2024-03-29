"use strict";

let exporter = function() {

    function writeHeader(context) {
        context.output += context.padding + `<Floor Value="${context.floorId}" Name="${context.floorTitle}">${context.newline}`;
        context.indent();
    }

    function writeFooter(context) {
        context.unindent();
        context.output += context.padding + `</Floor>` + context.newline;
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
            return tile.type !== "wall" && tile.type !== "hole" && tile.type !== "fan";
        }

        // Things which should only appear in a 1x1 room
        function isSingleTileRoom(tile) {
            return tile.type === "icespike" || tile.type === "dartBlock";
        }

        function is2x2Allowed(tile, parentHidden) {
            if (tile !== undefined) {
                let hidden = tile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                return !tile.used && isRoom(tile.item) && !isSingleTileRoom(tile.item) && hidden === parentHidden;
            }
            return false;
        }

        function getIndex(x, y) {
            return x * context.height + y;
        }

        // First pass
        let grid = createGrid(context.width * context.height);
        for (let tile of context.tiles) {
            let wrapper = { x: tile.x, y: tile.y, used: false, partnered: false, item: tile};
            let index = getIndex(wrapper.x, wrapper.y);
            let isRoomTile = isRoom(tile);
            if (grid[index] === undefined && isRoomTile && !isSingleTileRoom(tile)) {
                // NOTE: This makes an assumption:
                // tile.y >= previous.y AND (tile.y > previous.y OR tile.x > previous.x)
                let hidden = wrapper.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;

                if (wrapper.x > 0 && wrapper.y > 0) {
                    let left = getIndex((wrapper.x - 1), wrapper.y);
                    let up = getIndex(wrapper.x, wrapper.y - 1);
                    let diagonal = getIndex((wrapper.x - 1), wrapper.y - 1);
                    if (is2x2Allowed(grid[left], hidden) &&
                        is2x2Allowed(grid[up], hidden) &&
                        is2x2Allowed(grid[diagonal], hidden)) {
                        // We found a 2x2 room
                        if (hidden === true) {
                            context.output += context.padding +
                                `<Room X="${grid[diagonal].x + context.offsetX}" Y="${grid[diagonal].y + context.offsetY}" Type="Small" Hidden="True" />` + 
                                context.newline;
                        } else {                            
                            context.output += context.padding +
                                `<Room X="${grid[diagonal].x + context.offsetX}" Y="${grid[diagonal].y + context.offsetY}" Type="Small" />` + 
                                context.newline;
                        }
                        grid[up].used = true;
                        grid[left].used = true;
                        grid[diagonal].used = true;
                        wrapper.used = true;
                    }
                }

                grid[index] = wrapper;
            } else {
                wrapper.used = !isRoomTile;
                grid[index] = wrapper;
            }
        }

        // 2nd pass : Write corridors
        // TODO: write 1x1 corridors (ideally using cols and rows)
        for (let tile of grid) {
            if (tile !== undefined && !tile.used) {
                // We found a 1x1 room
                let hidden = tile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                context.output += context.padding +
                `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Corridor"`;
                
                if (hidden === true) {
                    context.output += ` Hidden="True"`;
                }

                context.output += `/>` + context.newline;
            }
        }

        let directionX = {"Up": 0, "Down": 0, "Right":1, "Left":-1 };
        let directionY = {"Up": 1, "Down": -1, "Right":0, "Left":0 };

        // 3rd pass : Write everything else
        for (let tile of context.tiles) {
            let id = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ID];
            let doors = [ tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_DOOR1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_DOOR2],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_DOOR3],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_DOOR4] ];
            let direction = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_DIRECTION] || "Up";
            let elite = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ELITE] || false;
            let cloak = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_CLOAK] || false;
            let rarity = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RARITY] || CHEST_RARITY.CHEST_RARITY_COMMON;
            let enemies = [ tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY2],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY3],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ENEMY4] ];
            let win = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_WIN] || false;
            let holeType = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE] || HOLE_TYPE.HOLE_TYPE_NONE;
            let bridges = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE2]
            ];
            let mimic = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_MIMIC] || false;
            let spikesSet = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_SPIKES1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_SPIKES2],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_SPIKES3],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_SPIKES4]
            ];
            let fanSet = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_FAN1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_FAN2]
            ];
            let aiType = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_AI_TYPE] || AI_TYPE.AI_TYPE_DEFAULT;
            let fanStrength = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_FAN_STRENGTH] || 5;
            let isRallyPoint = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT] || false;
            let rallyPoints = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID2],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID3],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID4]
            ];
            let barriers = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_BARRIER1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_BARRIER2]
            ];
            let coils = [
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL1],
                tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL2]
            ];
            let boss = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_BOSS] || false;

            switch (tile.type) {
                case "start":
                    context.output += context.padding +
                        `<!-- Start: [${tile.x+context.offsetX}, ${tile.y+context.offsetY}] -->` + context.newline;
                    context.startPoints.push({
                        x: tile.x+context.offsetX,
                        y: tile.y+context.offsetY
                    });
                    break;
                case "end":
                    context.output += context.padding +
                        `<Exit X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" OnEnter="Trigger_MoveTo${context.nextFloorTitle}" />` + context.newline;
                    break;
                case "hole":
                    {
                        let hidden = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;

                        if (hidden) {
                            context.output += context.padding +
                                `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Hole" Hidden="True" />` + context.newline;
                        } else {
                            context.output += context.padding +
                                `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Hole" />` + context.newline;
                        }

                        if (id !== undefined &&
                            (holeType === HOLE_TYPE.HOLE_TYPE_BRIDGE_START_ENABLED ||
                            holeType === HOLE_TYPE.HOLE_TYPE_BRIDGE_START_DISABLED ||
                            holeType === HOLE_TYPE.HOLE_TYPE_BRIDGE_START_HIDDEN)) {
                            
                            const HoleVert = "Vertical";
                            const HoleHori = "Horizontal";
                            let endX = tile.x;
                            let endY = tile.y;
                            let holeDir = undefined;

                            for (let x = tile.x-1; x >= 0; x--) {
                                let index = getIndex(x, tile.y);
                                let nextTile = grid[index];
                                if (nextTile !== undefined) {
                                    let nextHoleType = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE] || HOLE_TYPE.HOLE_TYPE_NONE;
                                    let nextID = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ID];
                                    if (nextTile.item.type === "hole" && nextHoleType === HOLE_TYPE.HOLE_TYPE_BRIDGE_END && nextID === id) {
                                        holeDir = HoleHori;
                                        endX = x;
                                        break;
                                    }
                                }
                                
                                if (nextTile === undefined || nextTile.item.type !== "hole") {
                                    break;
                                }
                            }

                            if (holeDir === undefined) {
                                for (let x = tile.x+1; x < context.width; x++) {
                                    let index = getIndex(x, tile.y);
                                    let nextTile = grid[index];
                                    if (nextTile !== undefined) {
                                        let nextHoleType = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE] || HOLE_TYPE.HOLE_TYPE_NONE;
                                        let nextID = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ID];
                                        if (nextTile.item.type === "hole" && nextHoleType === HOLE_TYPE.HOLE_TYPE_BRIDGE_END && nextID === id) {
                                            holeDir = HoleHori;
                                            endX = x;
                                            break;
                                        }
                                    }
                                    
                                    if (nextTile === undefined || nextTile.item.type !== "hole") {
                                        break;
                                    }
                                }
                            }

                            for (let y = tile.y-1; y >= 0; y--) {
                                let index = getIndex(tile.x, y);
                                let nextTile = grid[index];
                                if (nextTile !== undefined) {
                                    let nextHoleType = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE] || HOLE_TYPE.HOLE_TYPE_NONE;
                                    let nextID = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ID];
                                    if (nextTile.item.type === "hole" && nextHoleType === HOLE_TYPE.HOLE_TYPE_BRIDGE_END && nextID === id) {
                                        holeDir = HoleVert;
                                        endY = y;
                                        break;
                                    }
                                }
                                
                                if (nextTile === undefined || nextTile.item.type !== "hole") {
                                    break;
                                }
                            }

                            for (let y = tile.y+1; y < context.height; y++) {
                                let index = getIndex(tile.x, y);
                                let nextTile = grid[index];
                                if (nextTile !== undefined) {
                                    let nextHoleType = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE] || HOLE_TYPE.HOLE_TYPE_NONE;
                                    let nextID = nextTile.item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_ID];
                                    if (nextTile.item.type === "hole" && nextHoleType === HOLE_TYPE.HOLE_TYPE_BRIDGE_END && nextID === id) {
                                        holeDir = HoleVert;
                                        endY = y;
                                        break;
                                    }
                                }
                                
                                if (nextTile === undefined || nextTile.item.type !== "hole") {
                                    break;
                                }
                            }

                            if (holeDir !== undefined) {                               
                                let enabled = "False";
                                let hidden = "False"
                                if (holeType === HOLE_TYPE.HOLE_TYPE_BRIDGE_START_ENABLED) {
                                    enabled = "True";
                                }
                                if (holeType === HOLE_TYPE.HOLE_TYPE_BRIDGE_START_HIDDEN) {
                                    enabled = "True";
                                    hidden = "True";
                                }
                                if (holeDir === HoleHori) {
                                    context.output += context.padding + `<Bridge Y="${context.offsetY + tile.y}" Orientation="${HoleHori}" Enabled="${enabled}" Hidden="${hidden}" ID="${id}">` + context.newline;
                                    context.indent();
                                    context.output += context.padding + `<Start X="${context.offsetX + Math.min(tile.x, endX)}" />` + context.newline;
                                    context.output += context.padding + `<End X="${context.offsetX + Math.max(tile.x, endX)}" />` + context.newline;
                                    context.unindent();
                                    context.output += context.padding + `</Bridge>` + context.newline;
                                } else if (holeDir === HoleVert) {
                                    context.output += context.padding + `<Bridge X="${context.offsetX + tile.x}" Orientation="${HoleVert}" Enabled="${enabled}" Hidden="${hidden}" ID="${id}">` + context.newline;
                                    context.indent();
                                    context.output += context.padding + `<Start Y="${context.offsetY + Math.min(tile.y, endY)}" />` + context.newline;
                                    context.output += context.padding + `<End Y="${context.offsetY + Math.max(tile.y, endY)}" />` + context.newline;
                                    context.unindent();
                                    context.output += context.padding + `</Bridge>` + context.newline;
                                }
                            }
                        }
                    }
                    break;
                case "enemy":
                    {
                        let trigger = `Trigger_Fight_${context.floorId}_${context.enemies.length+1}`;
                        let dirX = directionX[direction];
                        let dirY = directionY[direction];
                        if (isRallyPoint) {
                            context.output += context.padding + `<RallyPoint Enabled="False" SpawnCount="1" ID="${id}">` + context.newline;
                            context.indent();
                        }

                        context.output += context.padding +
                            `<AI X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" OnSight="${trigger}"`;
                        if (elite) {
                            context.output += ` Aura="True"`;
                        }
                        if (boss) {
                            context.output += ` Boss="True"`;
                        }
                        if (cloak) {
                            context.output += ` Cloak="True"`;
                        }
                        if (aiType === AI_TYPE.AI_TYPE_BAT) {
                            context.output += ` Type="Bat"`;
                        }
                        context.output += `>` + context.newline;
                        context.indent();
                        context.output += context.padding +
                            `<Direction X="${dirX}" Y="${dirY}" />` + context.newline;
                        if (aiType === AI_TYPE.AI_TYPE_PATROL) {
                            let waypoints = [];
                            let multipliers = [1, -1];
                            for (let multiplier of multipliers) {
                                let pX = tile.x;
                                let pY = tile.y;
                                while (function() {
                                    let n = grid[getIndex(pX + dirX * multiplier, pY + dirY * multiplier)];
                                    if (n === undefined) { return false; }
                                    return n.item.type === "empty";
                                }())
                                {
                                    pX += dirX * multiplier;
                                    pY += dirY * multiplier;
                                }

                                waypoints.push({X: pX, Y: pY });
                            }

                            context.output += context.padding + `<Waypoints>` + context.newline;
                            context.indent();
                            for (let waypoint of waypoints) {
                                context.output += context.padding + `<Waypoint X="${waypoint.X + context.offsetX}" Y="${waypoint.Y + context.offsetY}" Wait="2.0" />` + context.newline;
                            }
                            context.unindent();
                            context.output += context.padding + `</Waypoints>` + context.newline;
                        } else if (aiType === AI_TYPE.AI_TYPE_LEFT || aiType === AI_TYPE.AI_TYPE_RIGHT) {
                            let getLeft = function (dir) {
                                let newDir = dir;
                                switch (dir) {
                                    case "Up":
                                        newDir = "Left";
                                        break;
                                    case "Left":
                                        newDir = "Down";
                                        break;
                                    case "Down":
                                        newDir = "Right";
                                        break;
                                    case "Right":
                                        newDir = "Up";
                                        break;
                                }
                                return {
                                    X: directionX[newDir],
                                    Y: -directionY[newDir],
                                    Dir: newDir
                                };
                            }
                            let getRight = function (dir) {
                                let newDir = dir;
                                switch (dir) {
                                    case "Up":
                                        newDir = "Right";
                                        break;
                                    case "Right":
                                        newDir = "Down";
                                        break;
                                    case "Down":
                                        newDir = "Left";
                                        break;
                                    case "Left":
                                        newDir = "Up";
                                        break;
                                }
                                return {
                                    X: directionX[newDir],
                                    Y: -directionY[newDir],
                                    Dir: newDir
                                };
                            }

                            let waypoints = [];
                            let curDir = direction;
                            let curDirX = dirX;
                            let curDirY = -dirY;
                            let pX = tile.x;
                            let pY = tile.y;

                            let checkBounds = function(x, y) {
                                return x >= 0 && y >= 0 && x < context.width && y < context.height;
                            }

                            let loop = function(getDirection) {
                                let d = getDirection(curDir);
                                let nextX = pX + d.X;
                                let nextY = pY + d.Y;
                                if (checkBounds(nextY, nextY)) {
                                    let n = grid[getIndex(nextX, nextY)];
                                    if (n !== undefined) {
                                        if (n.item.type === "empty" || n.item.type === "enemy") {
                                            waypoints.push({X: pX, Y: pY}); // push current pos as waypoint
                                            if (nextX !== tile.x || nextY !== tile.y) { // exit when returned to start
                                                pX = nextX;
                                                pY = nextY;
                                                curDir = d.Dir;
                                                curDirX = d.X;
                                                curDirY = d.Y;
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        }
                                    }
                                }

                                nextX = pX + curDirX;
                                nextY = pY + curDirY;
                                if (checkBounds(nextX, nextY)) {
                                    let n = grid[getIndex(nextX, nextY)];
                                    if (n !== undefined) {
                                        if (n.item.type === "empty" || n.item.type === "enemy") {
                                            if (nextX !== tile.x || nextY !== tile.y) { // exit when returned to start
                                                pX = nextX;
                                                pY = nextY;
                                                return true;
                                            } else {
                                                return false; // don't record final pos
                                            }
                                        }
                                    }
                                }
                                
                                waypoints.push({X: pX, Y: pY}); // push final as waypoint
                                return false;
                            };

                            let func = aiType === AI_TYPE.AI_TYPE_LEFT ? getLeft : getRight;
                            while (loop(func));
                            context.output += context.padding + `<Waypoints>` + context.newline;
                            context.indent();
                            for (let waypoint of waypoints) {
                                context.output += context.padding + `<Waypoint X="${waypoint.X + context.offsetX}" Y="${waypoint.Y + context.offsetY}" Wait="2.0" />` + context.newline;
                            }
                            context.unindent();
                            context.output += context.padding + `</Waypoints>` + context.newline;
                        }
                        context.unindent();
                        context.output += context.padding + `</AI>` + context.newline;

                        if (isRallyPoint) {
                            context.unindent();
                            context.output += context.padding + `</RallyPoint>` + context.newline;
                        }

                        context.enemies.push({ enemies: enemies, trigger: trigger, win: win});
                    }
                    break;
                case "pressurePlate":
                    {
                        let doorData = "";
                        context.indent();
                        for (let door of doors) {
                            if (door != undefined && door !== "") { // can be null?
                                if (doorData === "") {
                                    doorData = context.padding + "<Doors>" + context.newline;
                                    context.indent();
                                }
                                doorData += context.padding + `<Door ID="${door}" />` + context.newline;
                            }
                        }
                        if (doorData !== "") {
                            context.unindent();
                            doorData += context.padding + "</Doors>" + context.newline;
                        }
                        context.unindent();

                        let fanData = "";
                        context.indent();
                        for (let fan of fanSet) {
                            if (fan != undefined && fan !== "")  { // can be null?
                                if (fanData === "") {
                                    fanData += context.padding + `<WindFans>` + context.newline;
                                    context.indent();
                                }
                                fanData += context.padding + `<WindFan ID="${fan}" />` + context.newline;
                            }
                        }

                        if (fanData !== "") {
                            context.unindent();
                            fanData += context.padding + `</WindFans>` + context.newline;
                        }
                        context.unindent();

                        if (doorData === "" && fanData === "") {
                            context.output += context.padding +
                               `<PressurePlate X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                        } else {
                            context.output += context.padding +
                                `<PressurePlate X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}">` + context.newline
                                + doorData + fanData + context.padding + "</PressurePlate>" + context.newline;
                        }
                    }
                    break;
                case "terminal":
                    {
                        let doorData = "";
                        context.indent();
                        for (let door of doors) {
                            if (door != undefined && door !== "") { // can be null?
                                if (doorData === "") {
                                    doorData = context.padding + "<Doors>" + context.newline;
                                    context.indent();
                                }
                                doorData += context.padding + `<Door Text="Door" ID="${door}" Locked="True" />` + context.newline;
                            }
                        }
                        if (doorData !== "") {
                            context.unindent();
                            doorData += context.padding + "</Doors>" + context.newline;
                        }
                        context.unindent();

                        let bridgeData = "";
                        context.indent();
                        for (let bridge of bridges) {
                            if (bridge != undefined && bridge !== "")  { // can be null?
                                if (bridgeData === "") {
                                    bridgeData += context.padding + `<Bridges>` + context.newline;
                                    context.indent();
                                }
                                bridgeData += context.padding + `<Bridge ID="${bridge}" />` + context.newline;
                            }
                        }

                        if (bridgeData !== "") {
                            context.unindent();
                            bridgeData += context.padding + `</Bridges>` + context.newline;
                        }
                        context.unindent();

                        let spikeData = "";
                        context.indent();
                        for (let spike of spikesSet) {
                            if (spike != undefined && spike !== "")  { // can be null?
                                if (spikeData === "") {
                                    spikeData += context.padding + `<Spikes>` + context.newline;
                                    context.indent();
                                }
                                spikeData += context.padding + `<Spike ID="${spike}" />` + context.newline;
                            }
                        }

                        if (spikeData !== "") {
                            context.unindent();
                            spikeData += context.padding + `</Spikes>` + context.newline;
                        }
                        context.unindent();

                        let fanData = "";
                        context.indent();
                        for (let fan of fanSet) {
                            if (fan != undefined && fan !== "")  { // can be null?
                                if (fanData === "") {
                                    fanData += context.padding + `<WindFans>` + context.newline;
                                    context.indent();
                                }
                                fanData += context.padding + `<WindFan ID="${fan}" />` + context.newline;
                            }
                        }

                        if (fanData !== "") {
                            context.unindent();
                            fanData += context.padding + `</WindFans>` + context.newline;
                        }
                        context.unindent();

                        let barrierData = "";
                        context.indent();
                        for (let barrier of barriers) {
                            if (barrier != undefined && barrier !== "")  { // can be null?
                                if (barrierData === "") {
                                    barrierData += context.padding + `<Barriers>` + context.newline;
                                    context.indent();
                                }
                                barrierData += context.padding + `<Barrier ID="${barrier}" />` + context.newline;
                            }
                        }

                        if (barrierData !== "") {
                            context.unindent();
                            barrierData += context.padding + `</Barriers>` + context.newline;
                        }
                        context.unindent();

                        let coilData = "";
                        context.indent();
                        for (let coil of coils) {
                            if (coil != undefined && coil !== "")  { // can be null?
                                if (coilData === "") {
                                    coilData += context.padding + `<TeslaCoils>` + context.newline;
                                    context.indent();
                                }
                                coilData += context.padding + `<TeslaCoil ID="${coil}" />` + context.newline;
                            }
                        }

                        if (coilData !== "") {
                            context.unindent();
                            coilData += context.padding + `</TeslaCoils>` + context.newline;
                        }
                        context.unindent();

                        let fileData = "";
                        context.indent();
                        let fileCount = Math.floor(Math.random() * Math.min(3, context.terminalLogs.length + 1));
                        for (let i = 0; i < fileCount; i++) {
                            if (fileData === "") {
                                fileData += context.padding + `<Files>` + context.newline;
                                context.indent();
                            }

                            let fileIndex = Math.floor(Math.random() * (context.terminalLogs.length - i)) + i;
                            let file = context.terminalLogs[fileIndex];
                            context.terminalLogs[fileIndex] = context.terminalLogs[i];
                            context.terminalLogs[i] = file;

                            fileData += context.padding + `<File ID="${file.value}" />` + context.newline;
                        }

                        if (fileData !== "") {
                            context.unindent();
                            fileData += context.padding + `</Files>` + context.newline;
                        }
                        context.unindent();

                        if (doorData === "" && bridgeData === "" && spikeData === "" && fanData === "" && coilData === "" && barrierData === "" && fileData === "") {
                            context.output += context.padding +
                               `<Terminal X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                        } else {
                            context.output += context.padding +
                                `<Terminal X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}">` + context.newline
                                + doorData + bridgeData + spikeData + fanData + barrierData + coilData + fileData + context.padding + "</Terminal>" + context.newline;
                        }
                    }
                    break;
                case "hidden":
                    {
                    let up = tile.y > 0 ? getIndex(tile.x, tile.y - 1) : undefined;
                    let down = tile.y+1 < context.height ? getIndex(tile.x, tile.y + 1) : undefined;
                    let left = tile.x > 0 ? getIndex(tile.x-1, tile.y) : undefined;
                    let right = tile.x + 1 < context.width ? getIndex(tile.x+1, tile.y) : undefined;
                    if (up !== undefined && grid[up] !== undefined && isRoom(grid[up].item) &&
                        down !== undefined && grid[down] !== undefined && isRoom(grid[down].item)) {
                            let upHidden = grid[up].item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                            let downHidden = grid[down].item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                            if (upHidden) {
                                context.output += context.padding +
                                    `<FakeWall X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y-1 + context.offsetY}" />` + context.newline;
                            } else if (downHidden) {
                                context.output += context.padding +
                                    `<FakeWall X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y+1 + context.offsetY}" />` + context.newline;
                            }
                        }
                    else if (left !== undefined && grid[left] !== undefined && isRoom(grid[left].item) &&
                        right !== undefined && grid[right] !== undefined && isRoom(grid[right].item)) {
                            let leftHidden = grid[left].item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                            let rightHidden = grid[right].item.parameters[PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN] || false;
                            if (leftHidden) {
                                context.output += context.padding +
                                    `<FakeWall X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x-1 + context.offsetX}" Y2="${tile.y + context.offsetY}" />` + context.newline;
                            } else if (rightHidden) {
                                context.output += context.padding +
                                    `<FakeWall X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x+1 + context.offsetX}" Y2="${tile.y + context.offsetY}" />` + context.newline;
                            }
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
                        let doorID = id || "Door";
                        let up = tile.y > 0 ? getIndex(tile.x, tile.y - 1) : undefined;
                        let down = tile.y+1 < context.height ? getIndex(tile.x, tile.y + 1) : undefined;
                        let left = tile.x > 0 ? getIndex(tile.x-1, tile.y) : undefined;
                        let right = tile.x + 1 < context.width ? getIndex(tile.x+1, tile.y) : undefined;
                        if (up !== undefined && grid[up] !== undefined && isRoom(grid[up].item) &&
                            down !== undefined && grid[down] !== undefined && isRoom(grid[down].item)) {
                                context.output += context.padding +
                                    `<Door X1="${tile.x + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y-1 + context.offsetY}" Locked="True" ID="${doorID}" />` + context.newline;
                            }
                        else if (left !== undefined && grid[left] !== undefined && isRoom(grid[left].item) &&
                            right !== undefined && grid[right] !== undefined && isRoom(grid[right].item)) {
                                context.output += context.padding +
                                    `<Door X1="${tile.x-1 + context.offsetX}" Y1="${tile.y + context.offsetY}" X2="${tile.x + context.offsetX}" Y2="${tile.y + context.offsetY}" Locked="True" ID="${doorID}" />` + context.newline;
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
                case "chest":
                    {
                        if (mimic) {
                            let trigger = `Trigger_Fight_${context.floorId}_${context.enemies.length+1}`;                 
                            context.output += context.padding +
                                `<Chest X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Rarity="${rarity}" Mimic="True" OnClick="${trigger}" />`
                                + context.newline;
                            context.enemies.push({ enemies: enemies, trigger: trigger, win: false });
                        } else {
                            context.output += context.padding +
                                `<Chest X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Rarity="${rarity}" />`
                                + context.newline;
                        }
                    }
                    break;
                case "fountain":
                    {
                        context.output += context.padding +
                            `<Fountain X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                    }
                    break;
                case "spikes":
                    {
                        if (id != undefined && id !== "") { // can be null?                        
                            context.output += context.padding +
                                `<Spikes X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" ID="${id}" />` + context.newline;
                        } else {                            
                            context.output += context.padding +
                                `<Spikes X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                        }
                    }
                    break;
                case "fan":
                    {
                        if (id != undefined && id !== "") { // can be null?                        
                            context.output += context.padding +
                                `<WindFan X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" ID="${id}" Strength="${fanStrength}" Direction="${direction}" />` + context.newline;
                        } else {                      
                            context.output += context.padding +
                                `<WindFan X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Strength="${fanStrength}" Direction="${direction}" />` + context.newline;
                        }

                        // We also generate a hole at this location so the tile can't be entered.
                        context.output += context.padding +
                            `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Hole" />` + context.newline;
                    }
                    break;
                case "coil":
                    {
                        if (id != undefined && id !== "") { // can be null?                        
                            context.output += context.padding +
                                `<TeslaCoil X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" ID="${id}" />` + context.newline;
                        } else {                      
                            context.output += context.padding +
                                `<TeslaCoil X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                        }
                    }
                    break;
                case "barrier":
                    {                        
                        let up = tile.y > 0 ? getIndex(tile.x, tile.y - 1) : undefined;
                        let down = tile.y+1 < context.height ? getIndex(tile.x, tile.y + 1) : undefined;
                        let left = tile.x > 0 ? getIndex(tile.x-1, tile.y) : undefined;
                        let right = tile.x + 1 < context.width ? getIndex(tile.x+1, tile.y) : undefined;

                        let dirX = 0;
                        let dirY = 0;

                        if (up !== undefined && grid[up] !== undefined && isRoom(grid[up].item) &&
                            down !== undefined && grid[down] !== undefined && isRoom(grid[down].item)) {
                            dirY = 1;
                        } else {
                            dirX = 1;
                        }

                        if (id != undefined && id !== "") { // can be null?                        
                            context.output += context.padding +
                                `<Barrier X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" DirX="${dirX}" DirY="${dirY}" ID="${id}">` + context.newline;
                        } else {                      
                            context.output += context.padding +
                                `<Barrier X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" DirX="${dirX}" DirY="${dirY}">` + context.newline;
                        }

                        context.indent();
                        context.output += context.padding + '<RallyPoints>' + context.newline;
                        context.indent();
                        for (let p of rallyPoints) { // can be null?
                            if (p != undefined && p !== "") {
                                context.output += context.padding + `<RallyPoint ID="${p}" />` + context.newline;
                            }
                        }
                        context.unindent();
                        context.output += context.padding + '</RallyPoints>' + context.newline;
                        context.unindent();

                        context.output += context.padding + '</Barrier>' + context.newline;
                    }
                    break;
                case "posionPot":
                    if (id != undefined && id !== "") { // can be null?   
                        context.output += context.padding +
                            `<PosionPot X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" ID="${id}" />` + context.newline;
                    } else {
                        context.output += context.padding +
                            `<PosionPot X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                    }
                    break;
                case "dartBlock":
                    if (id != undefined && id !== "") { // can be null?   
                        context.output += context.padding +
                            `<DartBlock X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" ID="${id}" />` + context.newline;
                    } else {
                        context.output += context.padding +
                            `<DartBlock X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                    }
                    break;
            }
        }

        // Effects
        switch (context.effect) {
            case EFFECT_TYPES.EFFECT_TYPE_COLD:
                context.output += context.padding +
                    `<Effect Type="Cold" />` + context.newline;
                break;
            case EFFECT_TYPES.EFFECT_TYPE_HEAT:
                context.output += context.padding +
                    `<Effect Type="Heat" />` + context.newline;
                break;
        }        
    }

    function writeStartTriggers(context) {
        // Start Triggers
        for (let start of context.startPoints) {
            context.output += context.padding + `<Trigger>` + context.newline;
            context.indent();
            context.output += context.padding + `<Conditions>` + context.newline;
            context.indent();
            context.output += context.padding + `<Condition Trigger="Trigger_MoveTo${context.floorTitle}" />` + context.newline;
            context.output += context.padding + `<Condition Trigger="Trigger_${context.floorId}" />` + context.newline;
            context.unindent();
            context.output += context.padding + `</Conditions>` + context.newline;
            context.output += context.padding + `<Action Repeat="True">` + context.newline;
            context.indent(); 
            context.output += context.padding + `<MoveTo X="${start.x}" Y="${start.y}" />` + context.newline;
            context.output += context.padding + `<SwapFloor Value="${context.floorId}" />` + context.newline;
            context.unindent();
            context.output += context.padding + `</Action>` + context.newline;
            context.unindent();
            context.output += context.padding + `</Trigger>` + context.newline;
        }
    }

    function writeStartBlock(context) {
        for (let start of context.startPoints) {
            context.output += context.padding + `<Start X="${start.x}" Y="${start.y}" Floor="${context.floorId}" />` + context.newline;
        }
    }

    function writeWinTrigger(context) {
        context.output += context.padding + `<Trigger>` + context.newline;
        context.indent();
        context.output += context.padding + `<Conditions>` + context.newline;
        context.indent();
        context.output += context.padding + `<Condition Trigger="Trigger_Complete" />` + context.newline;
        context.unindent();
        context.output += context.padding + `</Conditions>` + context.newline;
        context.output += context.padding + `<Action>` + context.newline;
        context.indent();
        context.output += context.padding + `<Event Name="${context.dungeonName}_Complete" />` + context.newline;
        context.unindent();
        context.output += context.padding + `</Action>` + context.newline;
        context.unindent();
        context.output += context.padding + `</Trigger>` + context.newline;
    }

    function writeEnemies(context) {
        for (let enemy of context.enemies) {
            context.output += context.padding + `<Trigger>` + context.newline;
            context.indent();
            context.output += context.padding + `<Conditions>` + context.newline;
            context.indent();
            context.output += context.padding + `<Condition Trigger="${enemy.trigger}" />` + context.newline;
            context.unindent();
            context.output += context.padding + `</Conditions>` + context.newline;
            context.output += context.padding + `<Action>` + context.newline;
            context.indent();
            if (enemy.win) {
                context.output += context.padding +  `<Fight OnWin="Trigger_Complete">` + context.newline;
            } else {
                context.output += context.padding +  `<Fight>` + context.newline;
            }
            context.indent();
            for (let enemyId of enemy.enemies) {
                if (enemyId != undefined && enemyId !== "") { // enemyId can be null?
                    context.output += context.padding + `<Enemy Type="${enemyId}" />` + context.newline;
                }
            }
            context.unindent();
            context.output += context.padding + `</Fight>` + context.newline;
            context.unindent();
            context.output += context.padding + `</Action>` + context.newline;
            context.unindent();
            context.output += context.padding + `</Trigger>` + context.newline;

            if (enemy.win) {
                writeWinTrigger(context);
            }
        }
    }

    function trimList(list) {
        let outList = [];
        for (let elem of list) {
            if (elem.value !== "") {
                outList.push(elem);
            }
        }
        return outList;
    }

    let exportMap = function(tiles, width, height, effect,
        floorId="Floor", floorTitle="F1", nextFloorTitle="", initialPadding="", isBaseFloor=true,
        dungeonName="Dungeon", terminalLogs=[]) {
        let context = {
            tiles: tiles,
            output: "",
            padding: initialPadding,
            newline: "\r\n",
            width: width,
            height: height,
            offsetX: 4,
            offsetY: 5,
            effect: effect,
            floorId: floorId,
            floorTitle: floorTitle,
            nextFloorTitle: nextFloorTitle,
            dungeonName: dungeonName,
            startPoints: [],
            enemies: [],
            terminalLogs: trimList(terminalLogs),
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

        if (isBaseFloor) {
            writeStartBlock(context);
        } else {
            writeStartTriggers(context);
        }
        writeEnemies(context);
        return context.output;
    };

    let saveFileJSON = function(tiles, widthScale, heightScale, effect) {
        let saveData = {
            widthScale: widthScale,
            heightScale: heightScale,
            effect: effect,
            data: [],
            parameters: []
        };
        for (let tile of tiles) {
            saveData.data.push(tile.tile_id);
            saveData.parameters.push({ id: tile.id, parameters: tile.parameters });
        }
        return JSON.stringify(saveData);
    };

    let loadFileJSON = function(mapData) {
        return JSON.parse(mapData);
    };

    return {
        exportMap: exportMap,
        saveFileJSON: saveFileJSON,
        loadFileJSON: loadFileJSON
    };

}();
