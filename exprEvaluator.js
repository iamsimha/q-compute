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
		expr.columns = columns || [];
		expr.invertedIndex = {};
		function COLUMN (tok) {
			if(expr.acc.state === 'VALUE') {
				console.log("filter values");
			} else {
				expr.acc.state = 'COLUMN';
				expr.acc.values = expr.dataset[tok.columnName];
				expr.acc.dataType = tok.dataType;
			}
		}


		function OP(tok){
			var operator = null
			expr.acc.state = 'OP';
			if(tok.token in ops.DECIMAL_OPERATORS) {
				if(expr.acc.dataType === 'DECIMAL') {
					expr.acc.values = ops.DECIMAL_OPERATORS[tok.token](expr.acc.values).values;
				} else {
					expr.acc.errMsg = 'only valid for DECIMAL';
				}
			}
		}

		function IGNORE(tok) {
			expr.acc.state = 'IGNORE';
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
			ignoreFsa =  {'IGNORE':IGNORE, 'COLUMN':COLUMN, 'OP':OP};

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
		var buildInvertedIndex = function() {
			for(var i = 0; i < expr.columns.length; i++) {
				if((expr.columns[i].dataType === 'STRING') && (expr.columns[i].name in expr.backUpdataset)) {
					var values = expr.backUpdataset[expr.columns[i].name];
					for(var j = 0; j < values.length; j++) {
						if(!(values[j] in expr.invertedIndex)) {
							expr.invertedIndex[values[j]] = [];
						}
						if(expr.invertedIndex[values[j]].indexOf(expr.columns[i].name) === -1) {
							expr.invertedIndex[values[j]].push(expr.columns[i].name);
						}
					}
				}
			}
		}

		/*----------------------------------------------------------------------*/

		function arrayEquals(a1, a2) {
			var isEqual = true;
			if(a1.length != a2.length) return false;
			for(var i = 0; i < a1.length; i++) {
				if(a1[i] !== a2[i]) {
					isEqual = false;
					break;
				}
			}
			return isEqual;
		}

		function isValid() {
			return expr.error.errMsg.length === 0;
		}


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
		/**Move it to queryinfer*/
		var tagTokens = function (tokens) {
			var ele = null;
			for (var i = 0; i < tokens.length; i++) {
				ele = tokens[i];
				if(ele.token in ops.DECIMAL_OPERATORS && !('columnName' in ele)) {
					ele.tag = 'OP';
				} else if('columnName' in ele){
					ele.tag = 'COLUMN';
				} else {
					ele.tag = 'IGNORE';
				}
			}
			return tokens;
		}

		var answer = function (query) {
			expr.acc = {state:'IGNORE', values:[]};
			if(expr.error.errMsg.length === 0) {
				var tokens =  tagTokens(QI.getColumnTagged(query, expr.columns));
				buildInvertedIndex();
				for(var i = tokens.length - 1; i > -1; i--) {
					executor(tokens[i]);
				}
				console.log(expr.invertedIndex)
				return expr.acc;
			} else {
				return {
					errMsg : INAVLID_DATASET
				}
			}
		};
		checkForMissingInfo();


		var answerRecursive = function(query) {
			var tokens = query.split(/\ +/).map(function(x) {return {q:x}});
			var tokens =  utils.bottomUpTagger(tokens, expr.columns);
			console.log(tokens);
		};


		return {
			answer : answer,
			answerRecursive:answerRecursive
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