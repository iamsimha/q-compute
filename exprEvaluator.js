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
		// expr.dataset = dataset || {};
		// expr.backUpdataset = _.cloneDeep(expr.dataset); 
		expr.invertedIndex = {};


		function transformColumns(columns) {
			expr.columns = {};
			for(var i = 0; i < columns.length; i++) {
				expr.columns[utils.normalizeString(columns[i].name)] = {tag:'COLUMN',
																		info:{
																			dataType:columns[i].dataType||null,
																			trueName:columns[i].name
																		}
																};
			}
		}

		var buildInvertedIndex = function() {
			for(var column in expr.columns) {
				if((expr.columns[column].info.dataType === 'STRING') && (column in expr.dataset)) {
					var values = expr.dataset[column];
					for(var j = 0; j < values.length; j++) {
						var jValue = utils.normalizeString(values[j]);
						if(!(jValue in expr.invertedIndex)) {
							expr.invertedIndex[jValue] = {tag:'VALUE', info:{column:[], tagKey:values[j]}};
						}
						if(expr.invertedIndex[jValue].info.column.indexOf(column) === -1) {
							expr.invertedIndex[jValue].info.column.push(column);
						}
						values[j] = jValue;
					}
				}
			}
		}

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
			filterdataset(expr.acc.values[0].info.column[0], expr.acc.values[0].q, tok.tagKey);
			expr.acc.values = expr.dataset[tok.tagKey];
			expr.acc.dataType = tok.info.dataType;

		}

		function normalizeDataset(dataset) {
			var keys = Object.keys(dataset);
			for(var i = 0; i < keys.length; i++) {
				var newKey = utils.normalizeString(keys[i]);
				if(newKey !== keys[i]) {
					dataset[newKey] = dataset[keys[i]];
					delete dataset[keys[i]];
				}
			}
		}

		function initializeDataset(dataset) {
			dataset = dataset || {};
			normalizeDataset(dataset);
			expr.dataset = dataset;
		}

		function isValueTag() {
			return expr.acc.values[0] && expr.acc.values[0].info;
		}

		function COLUMN (tok) {
			expr.acc.state = 'COLUMN';
			expr.acc.history.push(expr.acc.state);
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
			expr.acc.history.push(expr.acc.state);
			if(tok.tagKey in ops.tagDict) {
				if(expr.acc.dataType === 'DECIMAL') {
					expr.acc.values = ops.tagDict[tok.tagKey].fn(expr.acc.values).values;
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
			expr.acc.history.push(expr.acc.state);
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
			console.log(myFsa)
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

		function getTaggedTokens(query) {
			var tokens = query.split(/\ +/).map(function(x) {return {q:utils.normalizeString(x), original:x}});
			
			var tokens =  utils.bottomUpTagger(tokens, expr.columns);
			var tokens = utils.bottomUpTagger(tokens, expr.invertedIndex);
			utils.replaceSynonyms(tokens);
			utils.simpleStemmer(tokens);

			tokens = utils.bottomUpTagger(tokens, ops.tagDict);
			
			utils.fillIgnore(tokens);
			return tokens;
		}

		function fillOriginalValues() {
			for(var i = 0; i < expr.acc.values.length; i++) {
				if(expr.acc.values[i] in expr.invertedIndex) {
					expr.acc.values[i] = expr.invertedIndex[expr.acc.values[i]].info.tagKey
				}
			}
		}

		var answer = function(query) {
			if(expr.error.errMsg.length !== 0) return {errMsg : INAVLID_DATASET};
			expr.dataset = _.cloneDeep(expr.backUpdataset);
			expr.acc = {state:'IGNORE', values:[], history:[]};
			var tokens = getTaggedTokens(query);
			console.log(tokens)
			for(var i = tokens.length - 1; i > -1; i--) {
				executor(tokens[i]);
			}
			fillOriginalValues();
			return expr.acc;
		};

		function init() {
			initializeDataset(dataset);
			transformColumns(columns);
			buildInvertedIndex(Object.keys(expr.columns));
			checkForMissingInfo();
			expr.backUpdataset = _.cloneDeep(expr.dataset);
		}

		init()
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