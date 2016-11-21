/*----------  LIBRARIES  ----------*/

import { json } from 'd3-request';
import { feature } from 'topojson-client';

/*----------  REQUEST  ----------*/

export function request(dispatcher) {

    /*----------  TOPOJSON MAP  ----------*/


    json('./assets/res/world-custom.json', function(error, world) {
        if (error) throw error;

        //countries topojson
        let countries = feature(world, world.objects.map).features;

        //emmiter when ready
        dispatcher.call('TOPOJSON_LOADED', this, countries);

    });

    /*----------  DATA  ----------*/

    dispatcher.on('TOPOJSON_LOADED', function(countries) {

        json('https://ihme-f3ac5.firebaseio.com/2013/38/3/overweight.json', function(error, countryData) {
            if (error) throw error;

            //emmiter when ready
            dispatcher.call('JSON_LOADED', this, countries, countryData);

        });

    });

}
