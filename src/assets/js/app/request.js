/*----------  LIBRARIES  ----------*/

import { json } from 'd3-request';
import { feature } from 'topojson-client';

/*----------  REQUEST  ----------*/

export function request(dispatcher) {

    json('./assets/res/world-50m.json', function(error, world) {
        if (error) throw error;

        //countries topojson
        let countries = feature(world, world.objects.countries).features;

        //emmiter when ready
        dispatcher.call('JSON_LOADED', this, countries);

    });

}
