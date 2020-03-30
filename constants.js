"use strict";

const EDITMODES = { MODE_PAINT: 0, MODE_DESIGN: 1 };
const EFFECT_TYPES = { EFFECT_TYPE_NONE: 0, EFFECT_TYPE_COLD: 1, EFFECT_TYPE_HEAT: 2 };
const TILE_TYPES = {
    TILE_EMPTY: 0,
    TILE_WALL: 1,
    TILE_START: 2,
    TILE_END: 3,
    TILE_HOLE: 4,
    TILE_ENEMY: 5,
    TILE_TERMINAL: 6,
    TILE_HIDDEN: 7,
    TILE_JUMP: 8,
    TILE_DOOR: 9,
    TILE_ICESPIKE: 10,
    TILE_CHEST: 11,
    TILE_FOUNTAIN: 12
};
const PARAMETERS = {
    PARAMETER_CHECKBOX: 0,
    PARAMETER_TEXTBOX: 1,
    PARAMETER_DROPDOWN: 2
};
const PARAMETER_TYPE = {
    PARAMETER_TYPE_HIDDEN: 0,
    PARAMETER_TYPE_ID: 1,
    PARAMETER_TYPE_DOOR1: 2,
    PARAMETER_TYPE_DOOR2: 3,
    PARAMETER_TYPE_DOOR3: 4,
    PARAMETER_TYPE_DOOR4: 5,
    PARAMETER_TYPE_DIRECTION: 6,
    PARAMETER_TYPE_CLOAK: 7,
    PARAMETER_TYPE_ELITE: 8,
    PARAMETER_TYPE_RARITY: 9,
    PARAMETER_TYPE_ENEMY1: 10,
    PARAMETER_TYPE_ENEMY2: 11,
    PARAMETER_TYPE_ENEMY3: 12,
    PARAMETER_TYPE_ENEMY4: 13,
    PARAMETER_TYPE_WIN: 14,
    PARAMETER_TYPE_HOLE_TYPE: 15,
    PARAMETER_TYPE_BRIDGE1: 16,
    PARAMETER_TYPE_BRIDGE2: 17,
    PARAMETER_TYPE_MIMIC: 18
};
const CHEST_RARITY = {
    CHEST_RARITY_COMMON: "Common",
    CHEST_RARITY_RARE: "Rare"
};
const HOLE_TYPE = {
    HOLE_TYPE_NONE: "None",
    HOLE_TYPE_BRIDGE_START_ENABLED: "Bridge Start (Enabled)",
    HOLE_TYPE_BRIDGE_START_DISABLED:"Bridge Start (Disabled)",
    HOLE_TYPE_BRIDGE_END: "Bridge End",
    HOLE_TYPE_BRIDGE_START_HIDDEN: "Bridge Start (Hidden)"
};
