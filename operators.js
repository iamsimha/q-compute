define(function() {
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
		};
	}

	function greaterthan(values, value) {
		var result = values.filter(function(x){return x > value});
		return {
			values : result,
			dataType : 'DECIMAL'
		};
	}

	function lessthan(values) {
		var result = values.filter(function(x) {return x < values});
		return {
			values : result,
			dataType : 'DECIMAL'
		};
	}

	function lessthanorequal(values) {
		var result = values.filter(function(x) {return x <= values});
		return {
			values : result,
			dataType : 'DECIMAL'
		};
	}

	function greaterthanorequal(values) {
		var result = values.filter(function(x) {return x >= values});
		return {
			values : result,
			dataType : 'DECIMAL'
		};
	}

	function sort(columnName) {

	}

	var operators = {
		'average':{tag:'OP', fn:average},
		'max':{tag:'OP', fn:max},
		'min':{tag:'OP', fn:min},
		'median':{tag:'OP', fn:median},
		'sum':{tag:'OP', fn:sum},
		'lessthan':{tag:'OP', fn:lessthan},
		'greaterthanorequal':{tag:'OP', fn:greaterthanorequal},
		'greaterthan':{tag:'OP', fn:greaterthan},
		'lessthanorequal':{tag:'OP', fn:lessthanorequal}
	};
	
	var DECIMAL_OPERATORS = {average:average,
							max:max,
							min:min,
							median:median,
							sort:sort,
							sum:sum,
							greaterthan:greaterthan,
							greaterthanorequal:greaterthanorequal,
							lessthan:lessthan,
							lessthanorequal:lessthanorequal},
	e = {
		//DECIMAL_OPERATORS:DECIMAL_OPERATORS,
		tagDict:operators
	};
	
	if(typeof module != 'undefined') {
	    module.exports = e;
	}

	return e;
});