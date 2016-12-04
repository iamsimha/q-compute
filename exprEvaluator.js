// "use strict"
/*
Evaluate Natural language expressions
dataset : Javascrit Object, Key is the column name and value is an array of Objects.
columns : Javascript object representing the columns of the dataser.
 */

define(["./start", "./node_modules/lodash/lodash.min", "./operators", './utils'], function(QI, _, ops, utils) {
	var exprEvaluator = function (dataset, columns) {
		var INAVLID_DATASET = 'dataset is not valid, use getErrorMsg() for more info',
		expr = this;
		expr.error = {errMsg:''};
		expr.dataset = dataset || {};
		expr.backUpdataset = _.cloneDeep(expr.dataset); 
		expr.invertedIndex = {};


		function transformColumns(columns) {
			expr.columns = {};
			for(var i = 0; i < columns.length; i++) {
				expr.columns[columns[i].name] = {tag:'COLUMN', info:{dataType:columns[i].dataType||null}};
			}
		}

		var buildInvertedIndex = function(columns) {
			for(var i = 0; i < columns.length; i++) {
				if((columns[i].dataType === 'STRING') && (columns[i].name in expr.backUpdataset)) {
					var values = expr.backUpdataset[columns[i].name];
					for(var j = 0; j < values.length; j++) {
						if(!(values[j] in expr.invertedIndex)) {
							expr.invertedIndex[values[j]] = {tag:'VALUE', info:[]};
						}
						if(expr.invertedIndex[values[j]].info.indexOf(columns[i].name) === -1) {
							expr.invertedIndex[values[j]].info.push(columns[i].name);
						}
					}
				}
			}
		}




		buildInvertedIndex(columns);
		transformColumns(columns);

		function filterdataset(sourceColumn, value, resultColumn) {
			var resultValues = [], res = {},
			allColumns = Object.keys(expr.dataset), values = expr.dataset[sourceColumn];
			for(var i = 0; i < allColumns.length; i++) {
				res[allColumns[i]] = [];
			}
			for (var i = 0; i < values.length; i++) {
				if(values[i] === value) {
					for(var j = 0; j < allColumns.length; j++) {
						res[allColumns[j]].push(expr.dataset[allColumns[j]][i]);
					}
				}
			}
			expr.dataset = res;
		}


		function handleColumnValues(tok) {
			//will only work for one value
			filterdataset(expr.acc.values[0].info[0], expr.acc.values[0].q, tok.tagKey);
			expr.acc.values = expr.dataset[tok.tagKey];
			expr.acc.dataType = tok.info.dataType;

		}

		function isValueTag() {
			return expr.acc.values[0] && expr.acc.values[0].info;
		}
		function COLUMN (tok) {
			expr.acc.state = 'COLUMN';
			if(isValueTag()) {
				handleColumnValues(tok)
			} else {
				expr.acc.values = expr.dataset[tok.tagKey];
				expr.acc.dataType = tok.info.dataType;
			}
		}


		function OP(tok){
			var operator = null
			expr.acc.state = 'OP';
			if(tok.q in ops.DECIMAL_OPERATORS) {
				if(expr.acc.dataType === 'DECIMAL') {
					expr.acc.values = ops.DECIMAL_OPERATORS[tok.q](expr.acc.values).values;
				} else {
					expr.acc.errMsg = 'only valid for DECIMAL';
				}
			}
		}

		function IGNORE(tok) {
			expr.acc.state = 'IGNORE';
		}

		function VALUE(tok) {
			expr.acc.state = 'VALUE';
			expr.acc.values = [{q:tok.q, info:tok.info}];
		}

		function COLUMN_VALUE (tokens) {
			var columnName = tokens[0].columnName,
			value = tokens[1].token, res = Object.keys(expr.backUpdataset).map(function(key) {return {key:[]}}),
			allColumns = Object.keys(expr.backUpdataset), values = expr.backUpdataset[columnName];
			for (var i = 0; i < values.length; i++) {
				if(values[i] === value) {
					for(var j = 0; j < allColumns.length; i++) {
						res[allColumns[j]].push(expr.backUpdataset[allColumns[j]][i]);
					}
				}
			}
			expr.dataset = res;
		}

		var valueFsa = {'COLUMN':COLUMN, IGNORE:IGNORE},
			columnFsa = {'OP':OP, IGNORE, IGNORE},
			ignoreFsa =  {'IGNORE':IGNORE, 'COLUMN':COLUMN, 'OP':OP, 'VALUE':VALUE};

		var operatorFSA = {
			'VALUE' : valueFsa,
			'COLUMN' : columnFsa,
			'IGNORE': ignoreFsa,
			'OP':{'OP':OP, 'IGNORE':IGNORE}
		}
		/*********************************************************************************/
		// Build the executor.
		var executor = function(tok) {			
			myFsa = operatorFSA[expr.acc.state];
			myFsa[tok.tag](tok);
		}


		/*----------------------------------------------------------------------*/

		/*----------------------------------------------------------------------*/

		function checkForMissingInfo() {
			var keys = Object.keys(expr.dataset), colLength;
			if(keys.length > 0) {
				colLength = expr.dataset[keys[0]].length;
				for(var i = 0; i < keys.length; i++) {
					if(expr.dataset[keys[i]].length !== colLength) {
						expr.error.errMsg = 'Length of column '+ keys[0] + ' and ' + keys[i] + ' are not equal'; 
					}
				}
			}
		}
		/*********************************************************************/

		checkForMissingInfo();


		function getTaggedTokens(query) {
			var tokens = query.split(/\ +/).map(function(x) {return {q:x}});
			
			var tokens =  utils.bottomUpTagger(tokens, expr.columns);
			var tokens = utils.bottomUpTagger(tokens, expr.invertedIndex);
			utils.replaceSynonyms(tokens);
			utils.simpleStemmer(tokens);

			tokens = utils.bottomUpTagger(tokens, ops.tagDict);
			
			utils.fillIgnore(tokens);
			return tokens;
		}


		var answer = function(query) {
			if(expr.error.errMsg.length !== 0) return {errMsg : INAVLID_DATASET};
			expr.acc = {state:'IGNORE', values:[]};
			var tokens = getTaggedTokens(query)
			for(var i = tokens.length - 1; i > -1; i--) {
				executor(tokens[i]);
			}
			return expr.acc;
		};


		return {
			answer : answer
		}
	}

	if(typeof module != 'undefined') {
		var QI = require("./start");
		var _ = require("./lodash.min");
		var ops = require('./operators');
		var utils = require('./utils');
	    module.exports = function(dataset, columns) {
	    	return exprEvaluator(dataset, columns);	
	    }
	}      
	return exprEvaluator;
});