var assert = require('assert');
require("amd-loader");
expr = require('../exprEvaluator');
QI = require('../start');
_ = require('../node_modules/lodash/lodash.min');
describe("expr basic load test", function() {
	it("Should load parser", function() {
		assert(Object.keys(new expr()).length > 0);
	})
})

describe("Operator testing", function() {

	it("indicate error if column lengths are not equal", function () {
		var query = "salary",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
					'salary':[1, 2, 3, 4]};
		magic = new expr(dataset, columns);
		assert.deepEqual({ errMsg: 'dataset is not valid, use getErrorMsg() for more info' }, magic.answer(query));
	});

	it("should correct result for column", function () {
		var query = "salary",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
					'salary':[1, 2, 3, 4, 5]};
		magic = new expr(dataset, columns);
		assert.deepEqual([1, 2, 3, 4, 5], magic.answer(query).values);

	});

	it("Should give out correct values for average", function() {
		var query = "what is the average salary",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
					'salary':[1, 2, 3, 4, 5]};

		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([3], compute.values)

		query = "what is the average company";
		compute = magic.answer(query);
		assert.equal('only valid for DECIMAL', compute.errMsg);
	});

	it("Should give out correct values for min", function() {
		var query = "what is the least value of salary",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
					'salary':[1, 2, 3, 4, 5]};

		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([1], compute.values)

		query = "what is the least company";
		compute = magic.answer(query);
		assert.equal('only valid for DECIMAL', compute.errMsg);
	});

	it("Should give out correct values for max", function() {
		var query = "what is the max value of salary",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
					'salary':[1, 2, 3, 4, 5]};

		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([5], compute.values)

		query = "what is the max company";
		compute = magic.answer(query);
		assert.deepEqual('only valid for DECIMAL', compute.errMsg);
	});

	it("Should give out correct selection queries", function() {
		var query = "what is Location when Agent name is Singh",
		columns = [{'name':'company', 'dataType':'STRING'},
						{'name':'salary', 'dataType':'DECIMAL'},
						{'name':'joinDate', 'dataType':'DATETIME'},
						{'name':'company name', 'dataType':'STRING'}];
		dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft', 'Microsoft'],
					'salary':[1, 2, 3, 4, 5, 7]};

		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual(['Delhi'], compute.values);

		query = "what is the max company";
		compute = magic.answer(query);
		assert.deepEqual('only valid for DECIMAL', compute.errMsg);
	});
});


describe.only("Verify that recursive answering works", function () {
	var dataset = {'country':['USA', 'Germany', 'France', 'China', 'Britain'],
				'population':[318.9, 80.62, 66.03, 1357, 64.1],
				'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
	
	it("indicate error if column lengths are not equal", function () {
		var query = "salary",
		columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];

		var dataset = {'country':['USA', 'Germany', 'France', 'China', 'Britain'],
					'population':[318.9, 80.62, 66.03, 1357]};
		magic = new expr(dataset, columns);
		assert.deepEqual({ errMsg: 'dataset is not valid, use getErrorMsg() for more info' }, magic.answer(query));
	});

	it("verify that correct answers are given for a column name", function() {
		var query = "what is population";
		var columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([ 318.9, 80.62, 66.03, 1357, 64.1 ], compute.values)
	})

	it("verify that correct answers are given for max", function() {
		var query = "what is max value of population";
		var columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([1357], compute.values)

		query = "what is maximum value of population";
		compute = magic.answer(query);
		assert.deepEqual([1357], compute.values);
	})

	it("verify that correct answers are given for min", function() {
		var query = "what is min value of population";
		var columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([64.1], compute.values)

		query = "what is minimum value of population";
		compute = magic.answer(query);
		assert.deepEqual([64.1], compute.values);

		query = "what is least value of population";
		compute = magic.answer(query);
		assert.deepEqual([64.1], compute.values);
	})

	it("verify that we get corect answers for average", function () {
		var query = "what is the average population";
		var columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([377.33], compute.values)

		query = "what is the mean population";
		compute = magic.answer(query);
		assert.deepEqual([377.33], compute.values)
	})

	it("verify that we get corect answers for sum", function () {
		var query = "what is the sum population";
		var columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([1886.6499999999999], compute.values);

		query = "what is the total population";
		compute = magic.answer(query);
		assert.deepEqual([1886.6499999999999], compute.values);
	})

	it("verify that selection queries work correctly", function() {
		var query = "what is capital of USA",
		columns = [{name:'country', dataType:'STRING'}, {name:'population', dataType:'DECIMAL'}, {name:'capital', dataType:'STRING'}];
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual(['Washinton DC'], compute.values);
	})

	it("verify that selection queries work correctly", function() {
		var query = "what is the average temperature of India",
		columns = [{name:'country', dataType:'STRING'}, {name:'temperature', dataType:'DECIMAL'}, {name:'district', dataType:'STRING'}],
		dataset = {'country':['India', 'USA', 'India', 'India', 'Britain'],
					'temperature':[40.5, 10.8, 31.5, 32.5, 12.5],
					'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);
	})

	it("verify that selection queries work correctly", function() {
		var query = "what is the average temperature when country is India",
		columns = [{name:'country', dataType:'STRING'}, {name:'temperature', dataType:'DECIMAL'}, {name:'district', dataType:'STRING'}],
		dataset = {'country':['India', 'USA', 'India', 'India', 'Britain'],
					'temperature':[40.5, 10.8, 31.5, 32.5, 12.5],
					'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);
	})

	it("verify that selection queries work correctly", function() {
		var query = "what is the average national temperature when country is India",
		columns = [{name:'country', dataType:'STRING'}, {name:'national temperature', dataType:'DECIMAL'}, {name:'district', dataType:'STRING'}],
		dataset = {'country':['India', 'USA', 'India', 'India', 'Britain'],
					'national temperature':[40.5, 10.8, 31.5, 32.5, 12.5],
					'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);

		var query = "what is the average national temperature of India";
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);
	})

	it("case insenstive Operator", function() {
		var query = "Average National temperature",
		columns = [{name:'country', dataType:'STRING'}, {name:'national temperature', dataType:'DECIMAL'}, {name:'district', dataType:'STRING'}],
		dataset = {'country':['India', 'USA', 'India', 'India', 'Britain'],
					'national temperature':[40.5, 10.8, 31.5, 32.5, 12.5],
					'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
		magic = new expr(dataset, columns);
		compute = magic.answer(query);
		assert.deepEqual([25.56], compute.values);

		var query = "what is the average National temperature of india";
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);

		var query = "what is the average National temperature of India";
		compute = magic.answer(query);
		assert.deepEqual([34.833333333333336], compute.values);
	})

	// it.only("should work for greater or than or less than queries", function() {
	// 	var query = "Average National temperature less than 31",
	// 	columns = [{name:'country', dataType:'STRING'}, {name:'national temperature', dataType:'DECIMAL'}, {name:'district', dataType:'STRING'}],
	// 	dataset = {'country':['India', 'USA', 'India', 'India', 'Britain'],
	// 				'national temperature':[40.5, 10.8, 31.5, 32.5, 12.5],
	// 				'capital':['Washinton DC', 'Berlin', 'Paris', 'Beijing', 'London']};
	// 	magic = new expr(dataset, columns);
	// 	compute = magic.answer(query);
	// 	assert.deepEqual([10.8, 12.5], compute.values);
	// })
})