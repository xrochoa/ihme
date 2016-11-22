/*----------  LIBRARIES  ----------*/

import { json } from 'd3-request';
import { feature } from 'topojson-client';

import { selectBoxSex } from './select-sex.js';

/*----------  REQUEST  ----------*/

export function request(dispatcher) {

    /*----------  TOPOJSON MAP  ----------*/

    //countries topojson
    let countries;

    //default data
    let data = {
        year: 2013,
        age_group_id: 38,
        sex_id: 3,
        metric: 'overweight'
    };

    json('./assets/res/world-custom.json', function(error, world) {
        if (error) throw error;

        //countries topojson
        countries = feature(world, world.objects.map).features;

        //populate other select boxes with options
        selectBoxSex(dispatcher);

        //emmiter when ready
        dispatcher.call('TOPOJSON_LOADED', this, countries); //used for map creation

    });

    /*----------  DATA  ----------*/

    dispatcher.on('LOAD_DATA', function(newValue) {

        //replace defaults
        if (newValue) {
            for (let key in newValue) {
                data[key] = newValue[key];
            }
        }

        let { year, age_group_id, sex_id, metric } = data; //destructured assignment

        json(`https://ihme-f3ac5.firebaseio.com/${year}/${age_group_id}/${sex_id}/${metric}.json`, function(error, countryData) {
            if (error) throw error;

            //emmiter when ready
            dispatcher.call('DATA_LOADED', this, countryData);

        });

    });

}
