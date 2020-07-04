"use strict";


Vue.component('mapItem', {
    template: '\
    <div>\
        <span>\
            <input v-model="name" />\
            <button v-on:click="deleteMap">Delete</button>\
        </span>\
    </div>',
    props: ['name'],
    methods: {
        deleteMap: function () {
            this.$emit(`deleteClick`, this.name);
        }
    }
});

Vue.component('settings', {
    data: function () {
      return {
          maps: []
      }  
    },
    methods: {
        deleteClick: function (map) {
            storage.deleteMapData(map);
            this.reload();
        },
        reload: function () {
            this.maps = storage.getMapList();
        }
    },
    mounted: function () {
        this.reload();
    },
    template: '\
    <div>\
        Maps\
        <mapItem v-for="map in maps"\
            v-bind:key="map"\
            v-bind:name="map"\
            v-on:deleteClick="deleteClick($event)" />\
    </div>'
});


new Vue({ el: '#app' });
