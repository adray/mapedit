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
            return tile.type !== "wall" && tile.type !== "hole";
        }

        // Things which should only appear in a 1x1 room
        function isSingleTileRoom(tile) {
            return tile.type === "icespike";
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
            let aiType = tile.parameters[PARAMETER_TYPE.PARAMETER_TYPE_AI_TYPE] || AI_TYPE.AI_TYPE_DEFAULT;

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
                        context.output += context.padding +
                            `<Room X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" Type="Hole" />` + context.newline;

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
                        context.output += context.padding +
                            `<AI X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" OnSight="${trigger}"`;
                        if (elite) {
                            context.output += ` Aura="True"`;
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
                        context.unindent();
                        context.output += context.padding + `</AI>` + context.newline;

                        context.enemies.push({ enemies: enemies, trigger: trigger, win: win});
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

                        if (doorData === "" && bridgeData === "" && spikeData === "") {
                            context.output += context.padding +
                               `<Terminal X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}" />` + context.newline;
                        } else {
                            context.output += context.padding +
                                `<Terminal X="${tile.x + context.offsetX}" Y="${tile.y + context.offsetY}">` + context.newline
                                + doorData + bridgeData + spikeData + context.padding + "</Terminal>" + context.newline;
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
                if (enemyId != undefined) { // enemyId can be null?
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

    let exportMap = function(tiles, width, height, effect,
        floorId="Floor", floorTitle="F1", nextFloorTitle="", initialPadding="", isBaseFloor=true,
        dungeonName="Dungeon") {
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
