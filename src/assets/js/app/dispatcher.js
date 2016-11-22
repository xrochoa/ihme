/*----------  LIBRARIES  ----------*/

import { dispatch } from 'd3-dispatch';

/*----------  DISPATCH EVENTS ----------*/

export let dispatcher = dispatch('TOPOJSON_LOADED', 'LOAD_DATA', 'DATA_LOADED', 'COUNTRY_CHANGED');
