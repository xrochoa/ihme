/*----------  MODULES  ----------*/

import { dispatcher } from './app/dispatcher.js'; //event handler
import { request } from './app/request.js';
import { worldMap } from './app/map.js';
import { selectBox } from './app/select.js';

/*----------  SETUP ----------*/

request(dispatcher);

worldMap(dispatcher);
selectBox(dispatcher);
