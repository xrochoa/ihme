/*----------  LIBRARIES  ----------*/

let d3dsv = require('d3-dsv');
let fs = require('fs');

/*----------  EXPORT JSON FOR API  ----------*/

let csv = fs.readFileSync('data.csv', 'utf8');

var data = d3dsv.csvParse(csv);
//returned by csvParse method
delete data['columns'];


let newData = {};

//location: id, code, name
//year
//age: groupId, start, end
//sex: id, sex
//metric: obesity, overweight

//percentage: unit, measure, mean, lower, upper

for (var key in data) {

    let value = data[key];

    if ((value.year == 2013) &&
        (value.age_group_id == 38) &&
        (value.sex_id == 3) &&
        (value.metric === 'overweight')
    ) {
        newData[value.location] = {
            mean: value.mean,
            lower: value.lower,
            upper: value.upper
        };
    }

}

console.log(newData);

fs.writeFileSync('2013.json', JSON.stringify(newData), 'utf-8');
