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
    TILE_FOUNTAIN: 12,
    TILE_SPIKES: 13,
    TILE_FAN: 14,
    TILE_PRESSURE_PLATE: 15,
    TILE_BARRIER: 16,
    TILE_TESLA_COIL: 17,
    TILE_POSION_POT: 18,
    TILE_DART_BLOCK: 19
};
const PARAMETERS = {
    PARAMETER_CHECKBOX: 0,
    PARAMETER_TEXTBOX: 1,
    PARAMETER_DROPDOWN: 2,
    PARAMETER_DATALIST: 3
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
    PARAMETER_TYPE_MIMIC: 18,
    PARAMETER_TYPE_SPIKES1: 19,
    PARAMETER_TYPE_SPIKES2: 20,
    PARAMETER_TYPE_SPIKES3: 21,
    PARAMETER_TYPE_SPIKES4: 22,
    PARAMETER_TYPE_AI_TYPE: 23,
    PARAMETER_TYPE_FAN1: 24,
    PARAMETER_TYPE_FAN2: 25,
    PARAMETER_TYPE_FAN_STRENGTH: 26,
    PARAMETER_TYPE_RALLYPOINT: 27,
    PARAMETER_TYPE_RALLYPOINT_ID1: 28,
    PARAMETER_TYPE_RALLYPOINT_ID2: 29,
    PARAMETER_TYPE_RALLYPOINT_ID3: 30,
    PARAMETER_TYPE_RALLYPOINT_ID4: 31,
    PARAMETER_TYPE_BARRIER1: 32,
    PARAMETER_TYPE_BARRIER2: 33,
    PARAMETER_TYPE_TESLA_COIL1: 34,
    PARAMETER_TYPE_TESLA_COIL2: 35
};
const CHEST_RARITY = {
    CHEST_RARITY_COMMON: "Common",
    CHEST_RARITY_UNCOMMON: "Uncommon",
    CHEST_RARITY_RARE: "Rare",
    CHEST_RARITY_EPIC: "Epic",
    CHEST_RARITY_ULTRA: "Ultra",
    CHEST_RARITY_UNIQUE: "Unique"
};
const HOLE_TYPE = {
    HOLE_TYPE_NONE: "None",
    HOLE_TYPE_BRIDGE_START_ENABLED: "Bridge Start (Enabled)",
    HOLE_TYPE_BRIDGE_START_DISABLED:"Bridge Start (Disabled)",
    HOLE_TYPE_BRIDGE_END: "Bridge End",
    HOLE_TYPE_BRIDGE_START_HIDDEN: "Bridge Start (Hidden)"
};
const AI_TYPE = {
    AI_TYPE_DEFAULT: "Default",
    AI_TYPE_BAT: "Bat",
    AI_TYPE_PATROL: "Patrol",
    AI_TYPE_LEFT: "Left",
    AI_TYPE_RIGHT: "Right"
};
const CALCULATED_TYPE = {
    CALCULATED_TYPE_CHALLENGE_RATING: 0
};
const ENEMY_TYPES = {
    VALUES: [ 
        { Name: "Goon", Rating: 1 },
        { Name: "Goon Leader", Rating: 2 },
        { Name: "Robot1", Rating: 2 },
        { Name: "Jack", Rating: 2 },
        { Name: "Doctor", Rating: 2 },
        { Name: "Nurse", Rating: 2 },
        { Name: "Warden", Rating: 2 },
        { Name: "Hell Bot", Rating: 3 },
        { Name: "Firebird", Rating: 3 },
        { Name: "Bat", Rating: 3 },
        { Name: "Ice Warrior", Rating: 3 },
        { Name: "Catapult", Rating: 3 },
        { Name: "Ice Master", Rating: 3 },
        { Name: "Shade", Rating: 4 },
        { Name: "Shadow Warrior", Rating: 4 },
        { Name: "MultiHead", Rating: 5 },
        { Name: "Dino", Rating: 5 },
        { Name: "Statue", Rating: 6 },
        { Name: "Knight", Rating: 6 }
    ]
};
const DATALIST_SOURCE = {
    DATALIST_SOURCE_ENEMY: 0,
    DATALIST_SOURCE_ID: 1
};
