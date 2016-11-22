/*----------  LIBRARIES  ----------*/

import { select } from 'd3-selection';
import { geoPath } from 'd3-geo';
import { geoWinkel3 } from 'd3-geo-projection';
import { transition } from 'd3-transition';
import { scalePow } from 'd3-scale';
import { extent } from 'd3-array';

/*----------  EXPORT  ----------*/


export function worldMap(dispatcher) {

    /*----------  PROJECTION  ----------*/

    let width = 1000,
        height = 500,
        selected;

    let projection = geoWinkel3()
        .center([0, 15])
        .scale(180);

    let path = geoPath()
        .projection(projection);

    /*----------  SVG  ----------*/

    let svg = select('.svg-wrapper').append('svg')
        .style('width', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMaxYMax meet');

    //transparent background
    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .on('click', () => {
            //go to global when clicking on background
            dispatcher.call('COUNTRY_CHANGED', this, 'G');
        });


    /*----------  CREATE MAP AND CIRCLES ----------*/

    let countryGroup = svg.append('g')
        .attr('id', 'countries')
        .style('opacity', 0); //initially invisible

    let circles;

    dispatcher.on('TOPOJSON_LOADED.MAP', function(countries) {

        //add map features
        countryGroup.selectAll('path')
            .data(countries).enter()
            .append('path')
            .attr('d', path)
            .on('click', (country) => {
                //handles click over already selected country
                let data = (selected !== country) ? country : 'G';
                //change of country emitter (on click)
                dispatcher.call('COUNTRY_CHANGED', this, data);
            });

        let circleGroup = countryGroup.append('g')
            .attr('id', 'circles');

        //create circles for each country
        circles = circleGroup.selectAll('circle')
            .data(countries).enter()
            .append('circle');

        //circles radius and position initial values
        circles.attr('r', 0)
            .attr('transform', (country) => {
                return `translate(${ path.centroid(country) })`;
            });

        //initial fade in
        countryGroup.transition()
            .duration(750)
            .style('opacity', 1);


    });

    /*----------  DATA LOADED  ----------*/

    dispatcher.on('DATA_LOADED.HANDLER', function(countryData) {

        //when data has loaded, make this listener available
        dispatcher.on('COUNTRY_CHANGED.MAP', function(countrySelected) {
            zoomIn(countrySelected, countryData);
        });

    });


    /*----------  ANIMATE CIRCLES  ----------*/

    //replace and aimate circles on new data
    dispatcher.on('DATA_LOADED.CIRCLES', function(countryData) {

        //calculate extent (min, max) of mean values to improve visualization
        let meanArray = [];
        for (let key in countryData) {
            meanArray.push(parseFloat(countryData[key].mean));
        }

        let minMax = extent(meanArray);

        let radius = scalePow()
            .domain(minMax) //data limits
            .range([0, 10]); //mapping

        //transition
        circles.transition()
            .duration(750)
            .attr('r', (country) => {
                let iso = country.properties.iso_a3;
                let mean = countryData.hasOwnProperty(iso) ? (countryData[iso].mean) : minMax[0];
                return radius(mean);
            });

    });

    /*----------  ON CLICK  ----------*/

    let infoBox = select('.info-box');

    function zoomIn(data, countryData) {

        let translate, scale;

        if (data === 'G') {

            //if double click, zoom out
            selected = null;
            translate = [0, 0];
            scale = 1;

            //animate info box
            infoBox.classed('active', false);

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

            let iso = data.properties.iso_a3;

            let mean = countryData.hasOwnProperty(iso) ? `${ (countryData[iso].mean * 100).toFixed(2) }%` : 'No data available';
            let lower = countryData.hasOwnProperty(iso) ? `${ (countryData[iso].lower * 100).toFixed(2) }%` : 'No data available';
            let upper = countryData.hasOwnProperty(iso) ? ` - ${ (countryData[iso].upper * 100).toFixed(2) }%` : '';

            //animate info box
            infoBox.classed('active', true)
                .select('.content')
                .html(`
                    <h1>${data.properties.admin}</h1>
                    <p>Mean: ${ mean }</p>
                    <p>Uncertainty Interval: ${ lower } ${ upper } </p>
                    `);

            /*----------  CHANGE INFO BOX WHEN NEW DATA AND ZOOMED IN  ----------*/

            dispatcher.on('DATA_LOADED.INFO_BOX', function(countryData) {
                let data = (selected !== null) ? selected : 'G';
                zoomIn(data, countryData);
            });
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
