"use strict";

let palette = function() {

    return {
        createPallete: function() {
            return [
                {
                    id: TILE_TYPES.TILE_EMPTY,
                    type: "empty",
                    value: "",
                    parameters: [
                         {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                            text:"Hidden",
                            control:PARAMETERS.PARAMETER_CHECKBOX
                         } ]
                },
                {
                    id: TILE_TYPES.TILE_WALL,
                    type: "wall",
                    value: ""
                },
                {
                    id: TILE_TYPES.TILE_START,
                    type: "start",
                    value: ""
                },
                {
                    id: TILE_TYPES.TILE_END,
                    type: "end",
                    value: ""
                },
                {
                    id: TILE_TYPES.TILE_HOLE,
                    type: "hole",
                    value: "",
                    parameters: [ {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                        text: "ID",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_HOLE_TYPE,
                        text: "Type",
                        control:PARAMETERS.PARAMETER_DROPDOWN,
                        values:[HOLE_TYPE.HOLE_TYPE_NONE,
                            HOLE_TYPE.HOLE_TYPE_BRIDGE_START_ENABLED,
                            HOLE_TYPE.HOLE_TYPE_BRIDGE_START_DISABLED,
                            HOLE_TYPE.HOLE_TYPE_BRIDGE_END,
                            HOLE_TYPE.HOLE_TYPE_BRIDGE_START_HIDDEN
                        ]
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                        text:"Hidden",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    } ]
                },
                {
                    id: TILE_TYPES.TILE_ENEMY,
                    type: "enemy",
                    value: "E",
                    calculated: [ {
                            id: CALCULATED_TYPE.CALCULATED_TYPE_CHALLENGE_RATING,
                            text: "Challenge Rating"
                        }
                    ],
                    parameters: [ {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_DIRECTION,
                        text:"Direction",
                        control:PARAMETERS.PARAMETER_DROPDOWN,
                        values:["Up", "Down", "Right", "Left"]
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ELITE,
                        text:"Elite",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_BOSS,
                        text:"Boss",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_CLOAK,
                        text:"Cloak",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY1,
                        text:"Enemy1",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ENEMY
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY2,
                        text:"Enemy2",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ENEMY
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY3,
                        text:"Enemy3",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ENEMY
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY4,
                        text:"Enemy4",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ENEMY
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_WIN,
                        text:"Win",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                        text:"Hidden",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_AI_TYPE,
                        text:"AI", control:PARAMETERS.PARAMETER_DROPDOWN,
                        values: [AI_TYPE.AI_TYPE_DEFAULT, AI_TYPE.AI_TYPE_BAT, AI_TYPE.AI_TYPE_PATROL, AI_TYPE.AI_TYPE_LEFT, AI_TYPE.AI_TYPE_RIGHT]
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT,
                        text:"RallyPoint", control:PARAMETERS.PARAMETER_CHECKBOX
                    },
                    {
                        id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                        text: "ID",
                        control:PARAMETERS.PARAMETER_DATALIST,
                        source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                    } ]
                },
                {
                    id: TILE_TYPES.TILE_TERMINAL,
                    type: "terminal",
                    value: "T",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR1,
                            text:"Door1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        { 
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR2,
                            text:"Door2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR3,
                            text:"Door3", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR4,
                            text:"Door4", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE1,
                            text:"Bridge1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_BRIDGE2,
                            text:"Bridge2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_SPIKES1,
                            text:"Spikes1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_SPIKES2,
                            text:"Spikes2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_SPIKES3,
                            text:"Spikes3", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_SPIKES4,
                            text:"Spikes4", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_FAN1,
                            text:"Fan1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_FAN2,
                            text:"Fan2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_BARRIER1,
                            text:"Barrier1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_BARRIER2,
                            text:"Barrier2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL1,
                            text:"TeslaCoil1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_TESLA_COIL2,
                            text:"TeslaCoil2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }] 
                },
                {
                    id: TILE_TYPES.TILE_HIDDEN,
                    type: "hidden",
                    value: ""
                },
                {
                    id: TILE_TYPES.TILE_JUMP,
                    type: "jump",
                    value: "J"
                },
                {
                    id: TILE_TYPES.TILE_DOOR,
                    type: "door",
                    value: "D",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        } ]
                },
                {
                    id: TILE_TYPES.TILE_ICESPIKE,
                    type: "icespike",
                    value: "S"
                },
                {
                    id: TILE_TYPES.TILE_CHEST,
                    type: "chest",
                    value: "C",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_RARITY,
                            text: "Rarity",
                            control:PARAMETERS.PARAMETER_DROPDOWN,
                            values: [CHEST_RARITY.CHEST_RARITY_COMMON, CHEST_RARITY.CHEST_RARITY_UNCOMMON,
                                CHEST_RARITY.CHEST_RARITY_RARE, CHEST_RARITY.CHEST_RARITY_EPIC,
                                CHEST_RARITY.CHEST_RARITY_ULTRA, CHEST_RARITY.CHEST_RARITY_UNIQUE]
                        }, 
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                            text:"Hidden",
                            control:PARAMETERS.PARAMETER_CHECKBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_MIMIC,
                            text:"Mimic",
                            control:PARAMETERS.PARAMETER_CHECKBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY1,
                            text:"Enemy1",
                            control:PARAMETERS.PARAMETER_TEXTBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY2,
                            text:"Enemy2",
                            control:PARAMETERS.PARAMETER_TEXTBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY3,
                            text:"Enemy3",
                            control:PARAMETERS.PARAMETER_TEXTBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ENEMY4,
                            text:"Enemy4",
                            control:PARAMETERS.PARAMETER_TEXTBOX
                        }  ]
                },
                {
                    id: TILE_TYPES.TILE_FOUNTAIN,
                    type: "fountain",
                    value: "F",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                            text:"Hidden",
                            control:PARAMETERS.PARAMETER_CHECKBOX
                         }  ]
                },
                {
                    id: TILE_TYPES.TILE_SPIKES,
                    type: "spikes",
                    value: "S",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text: "ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_FAN,
                    type: "fan",
                    value: "WF",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id:  PARAMETER_TYPE.PARAMETER_TYPE_DIRECTION,
                            text:"Direction",
                            control:PARAMETERS.PARAMETER_DROPDOWN,
                            values:["Up", "Down", "Right", "Left"]
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_FAN_STRENGTH,
                            text: "Strength",
                            control:PARAMETERS.PARAMETER_DROPDOWN,
                            values:[1,2,3,4,5]
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_PRESSURE_PLATE,
                    type: "pressurePlate",
                    value: "PP",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR1,
                            text:"Door1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        { 
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR2,
                            text:"Door2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR3,
                            text:"Door3", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR4,
                            text:"Door4", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_FAN1,
                            text:"Fan1", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_FAN2,
                            text:"Fan2", control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_BARRIER,
                    type: "barrier",
                    value: "B",
                    parameters: [ {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID1,
                            text:"RallyPoint1",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID2,
                            text:"RallyPoint2",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID3,
                            text:"RallyPoint3",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_RALLYPOINT_ID4,
                            text:"RallyPoint4",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_TESLA_COIL,
                    type: "coil",
                    value: "C",
                    parameters: [ {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_POSION_POT,
                    type: "posionPot",
                    value: "P",
                    parameters: [ {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                },
                {
                    id: TILE_TYPES.TILE_DART_BLOCK,
                    type: "dartBlock",
                    value: "DB",
                    parameters: [ {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_ID,
                            text:"ID",
                            control:PARAMETERS.PARAMETER_DATALIST,
                            source:DATALIST_SOURCE.DATALIST_SOURCE_ID
                        }
                    ]
                }
            ];
        }
    };

}();


