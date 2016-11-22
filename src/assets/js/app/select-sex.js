/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';

/*----------  CREATE SELECT BOX  ----------*/

export function selectBoxSex(dispatcher) {

    //select box
    let sexSelect = select('.select-sex');

    let sexOptions = [{ name: 'male', id: 1 }, { name: 'female', id: 2 }, { name: 'both', id: 3 }];

    //add options from countryMap
    sexSelect.selectAll('option')
        .data(sexOptions).enter()
        .append('option')
        .attr('value', (sex) => {
            return sex.id;
        })
        .text((sex) => {
            return sex.name;
        });

    //default
    sexSelect.property('value', 3);

    //change of state emitter (on select change)
    sexSelect.on('change', function() {
        dispatcher.call('LOAD_DATA', this, { 'sex_id': parseInt(this.value) });
    });

}
