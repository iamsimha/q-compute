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
	var dataset = {'company':['Google', 'Facebook', 'Palantir', 'Quora', 'Microsoft'],
				'salary':[1, 2, 3, 4, 5]};
	it("tokenize words correctly", function() {
		var query = "what is max value of salary";
		var columns = {
			'company':{tag:'COLUMN', info :{dataType:'STRING'}},
			'salary':{tag:'COLUMN', info:{dataType:'DECIMAL'}}
		};
		var operators = {
			'average':{tag:'OP'},
			'max':{tag:'OP'},
			'min':{tag:'OP'},
			'median':{tag:'OP'}
		}
		var tagDict = (_.extend({}, columns, operators));
		magic = new expr(dataset, tagDict);
		compute = magic.answerRecursive(query);
	})
})