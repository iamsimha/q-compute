define(function() {

	var operators = {
		'average':{tag:'OP'},
		'max':{tag:'OP'},
		'min':{tag:'OP'},
		'median':{tag:'OP'},
		'sum':{tag:'OP'}
	};

	function average(values) {
		var ary = values, avg = 0, t = 1;
		for(var i = 1; i <= ary.length; i++) {
			avg += (ary[i-1] - avg)/i;
		}
		return {
			values:[avg],
			dataType:'DECIMAL'
		}
	}

	function max(values) {
		return {
			values : [Math.max.apply(null, values)],
			dataType:'DECIMAL'
		}
	}

	function min(values) {
		return {
			values : [Math.min.apply(null, values)],
			dataType:'DECIMAL'
		}
	}

	function median(values) {
		values.sort( function(a,b) {return a - b;} );

		var half = Math.floor(values.length/2);

		if(values.length % 2)
		    return values[half];
		else
		    return (values[half-1] + values[half]) / 2.0;
	}

	function sum(values) {
		var result = 0;
		for(var i = 0; i < values.length; i++) {
			result += values[i];
		}
		return {
			values:[result],
			dataType:'DECIMAL'
		}
	}

	function sort(columnName) {

	}

	var DECIMAL_OPERATORS = {average:average, max:max, min:min, median:median, sort:sort, sum:sum},
	e = {
		DECIMAL_OPERATORS:DECIMAL_OPERATORS,
		tagDict:operators
	};
	
	if(typeof module != 'undefined') {
	    module.exports = e;
	}
	return e;
});