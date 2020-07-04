"use strict";


Vue.component('importer', {
    methods: {
        importMap: function () {
            let mapname = this.$refs.mapname.value;
            if (mapname !== "") {
                storage.saveMapData(mapname, this.$refs.importedData.value);
            }
        }
    },
    template: '\
    <div>\
        <div>\
            Name:<input name="mapname" ref="mapname" />\
        </div>\
        <div>\
            <textarea class="export" ref="importedData" />\
        </div>\
        <div>\
            <button v-on:click="importMap">Import</button>\
        </div>\
    </div>'
});


new Vue({ el: '#app' });
