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
                    value: ""
                },
                {
                    id: TILE_TYPES.TILE_ENEMY,
                    type: "enemy",
                    value: "E",
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
                        id: PARAMETER_TYPE.PARAMETER_TYPE_CLOAK,
                        text:"Cloak",
                        control:PARAMETERS.PARAMETER_CHECKBOX
                    } ]
                },
                {
                    id: TILE_TYPES.TILE_TERMINAL,
                    type: "terminal",
                    value: "T",
                    parameters: [
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR1,
                            text:"Door1", control:PARAMETERS.PARAMETER_TEXTBOX
                        },
                        { 
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR2,
                            text:"Door2", control:PARAMETERS.PARAMETER_TEXTBOX 
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR3,
                            text:"Door3", control:PARAMETERS.PARAMETER_TEXTBOX
                        },
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_DOOR4,
                            text:"Door4", control:PARAMETERS.PARAMETER_TEXTBOX
                        } ]
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
                            control:PARAMETERS.PARAMETER_TEXTBOX
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
                            values: [CHEST_RARITY.CHEST_RARITY_COMMON, CHEST_RARITY.CHEST_RARITY_RARE]
                        }, 
                        {
                            id: PARAMETER_TYPE.PARAMETER_TYPE_HIDDEN,
                            text:"Hidden",
                            control:PARAMETERS.PARAMETER_CHECKBOX
                         }  ]
                }
            ];
        }
    };

}();


