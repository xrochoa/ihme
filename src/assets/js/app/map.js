/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';
import { geoMercator, geoPath } from 'd3-geo';
import { transition } from 'd3-transition';
import { scaleSqrt } from 'd3-scale';

/*----------  EXPORT  ----------*/


export function worldMap(dispatcher) {

    /*----------  PROJECTION  ----------*/

    let width = 1000,
        height = 500,
        selected;

    let projection = geoMercator()
        .center([0, 43])
        .scale(120);

    let path = geoPath()
        .projection(projection);

    /*----------  SVG  ----------*/

    let svg = select('.svg-wrapper').append('svg')
        .style('width', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMaxYMax meet');

    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .on('click', zoomIn);


    let countryGroup = svg.append('g');

    /*----------  CREATE MAP  ----------*/

    dispatcher.on('JSON_LOADED.MAP', function(countries, countryData) {

        //add map features
        countryGroup.append('g')
            .attr('id', 'countries')
            .selectAll('path')
            .data(countries).enter()
            .append('path')
            .attr('d', path)
            .on('click', (country) => {
                //change of country emitter (on click)
                dispatcher.call('COUNTRY_CHANGED', this, country);
            })

        //bubbles
        let radius = scaleSqrt()
            .domain([0, 100]) //data limits
            .range([0, 10]); //mapping

        countryGroup.append('g')
            .attr('id', 'bubbles')
            .selectAll('circle')
            .data(countries).enter()
            .append('circle')
            .attr('r', (country) => {
                let iso = country.properties.iso_a3;
                let mean = countryData.hasOwnProperty(iso) ? (countryData[iso].mean * 100) : 0
                return radius(mean);
            })
            .attr('transform', (country) => {
                return `translate(${ path.centroid(country) })`;
            })



        //change of state listener
        dispatcher.on('COUNTRY_CHANGED.MAP', function(country) {
            zoomIn(country);
        });

    });

    /*----------  ON CLICK  ----------*/

    function zoomIn(data) {

        let translate, scale;

        if (selected === data) {

            //if double click, zoom out
            selected = null;
            translate = [0, 0];
            scale = 1;

        } else {

            //calculate scale and translate based on bounding box and centroid
            let box = path.bounds(data),
                boxWidth = box[1][0] - box[0][0],
                boxHeight = box[1][1] - box[0][1];

            let centroid = path.centroid(data);

            let x = centroid[0],
                y = centroid[1];

            selected = data;
            scale = 0.75 / Math.max(boxWidth / width, boxHeight / height);
            translate = [width / 2 - scale * x, height / 2 - scale * y];
        }

        countryGroup.selectAll('path')
            .classed('selected', function(d) {
                return d === selected;
            });

        countryGroup.transition()
            .duration(750)
            .style('stroke-width', `${ 1.5 / scale }px`)
            .attr('transform', `translate(${ translate })scale(${ scale })`);

    }

}
