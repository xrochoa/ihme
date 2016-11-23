/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';
import { map } from 'd3-collection';


/*----------  CREATE SELECT BOX  ----------*/

export function selectBox(dispatcher) {

    dispatcher.on('TOPOJSON_LOADED.SELECT_COUNTRY', function(countries) {

        //map countries
        let countriesMap = map();
        countries.forEach((country) => {
            countriesMap.set(country.properties.iso_a3, country);
        });

        //sort countries
        let sortedCountries = countries.sort((a, b) => {
            if (a.properties.admin > b.properties.admin) {
                return 1;
            }
            if (a.properties.admin < b.properties.admin) {
                return -1;
            }
        });

        //select box
        let countrySelect = select('.select-country');

        //add options from countryMap
        countrySelect.selectAll('option')
            .data(sortedCountries).enter()
            .append('option')
            .attr('value', (country) => {
                return country.properties.iso_a3;
            })
            .text((country) => {
                return country.properties.admin;
            });

        //change of state emitter (on select change)
        countrySelect.on('change', function() {
            let country = (this.value !== 'G') ? countriesMap.get(this.value) : 'G';
            dispatcher.call('COUNTRY_CHANGED', this, country);
        });

        //change of state listener
        dispatcher.on('COUNTRY_CHANGED.SELECT_COUNTRY', function(country) {
            let iso = (country !== 'G') ? country.properties.iso_a3 : 'G';
            countrySelect.property('value', iso);
        });

        dispatcher.call('LOAD_DATA'); //request initial data

    });
}
