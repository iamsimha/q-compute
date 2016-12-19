"use strict"
function Parser(tokens) {
	var sm = this;
	sm.formula = "";
	sm.tokenIndex = -1;
	sm.currentToken = null;
	sm.columns = {};
	sm.tokens = tokens;

	sm.startToks = {'what':true, 'how':true, 'the':true, 'is':true, 'when':true, 'where':true};
	sm.orderTokens = {'by':true, 'is':true, 'sort':true, 'descending':true, 'desc':true};
	sm.reduceTokens = {'average':true, 'max':true, 'min':true, 'median':true};



	/**************************************/

	function updateTokenWithTag(tag) {
		sm.tokens[sm.tokenIndex].tag = tag;
	}

	function saveColumnNames() {
		for (var i = 0; i < (sm.tokens||[]).length; i++) {
			if('columnName' in sm.tokens[i]) {
				sm.columns[sm.tokens[i].columnName] = {name:sm.tokens[i].token, dataType:sm.tokens[i].dataType}
			}
		}
	}

	function isStartToken() {
		if(sm.currentToken === null) return false; 

		var token = sm.currentToken.token, prevToken = null;
		if(lookAheadPreviousToken()) prevToken = lookAheadPreviousToken().token;


		if(token === 'is' && prevToken === null) return false;
		
		if(token in sm.startToks &&
			(prevToken in sm.startToks || prevToken === null) &&
			!(token in sm.columns)) {
			updateTokenWithTag('START-TOKEN');
			return true;
		}

		return false;
	}

	function isOPToken() {
		if(sm.currentToken === null)  return false;
		var token = sm.currentToken.token, prevToken = lookAheadPreviousToken(), nxtToken = lookAheadNextToken();
		console.log("ooooooooo********");
		console.log(token);
		if(token in sm.opTokens && ((prevToken === null) || 
			(prevToken.tag === 'OP-TOKEN') ||
			('columnName' in nextToken)) ) {
			updateTokenWithTag('OP-TOKEN');
			return true;
		}
		return false;
	}

	function isColumnToken() {
		if(sm.currentToken === null) return false;
		var token = sm.currentToken;
		if('columnName' in token) {
			updateTokenWithTag('COLUMN-TOKEN');
			return true;
		}
		return false;
	}
	/**************************************/
	function accept(s) {
		if(s(sm.currentToken)) {
			nextToken();
			return 1;
		}
		return 0;
	}

	function nextToken() {
		var nextIndex = sm.tokenIndex + 1;
		if(nextIndex > -1 && nextIndex < (sm.tokens|| []).length) {
			sm.tokenIndex = nextIndex;
			sm.currentToken = sm.tokens[sm.tokenIndex];
		} else {
			sm.currentToken = null;
		}
	}

	function lookAheadPreviousToken() {
		var tokenIndex = sm.tokenIndex - 1;
		if (tokenIndex > -1 && tokenIndex < sm.tokens.length) {
			return sm.tokens[tokenIndex];
		}
		return null;
	}

	function lookAheadNextToken() {
		var tokenIndex = sm.tokenIndex + 1;
		if (tokenIndex > -1 && tokenIndex < sm.tokens.length) {
			return sm.tokens[tokenIndex];
		}
		return null;
	}

	function getFormula() {
		return sm.formula;
	}

	function getCurrentToken() {
		return sm.currentToken;
	}

	function getColumnNames() {
		return sm.columns;
	}

	function getTokens() {
		return sm.tokens;
	}

	function question() {

	}

	function parse() {
		while(accept(isStartToken)) {}
		while(accept(isOPToken)) {}
		while(accept(isColumnToken)) {}
	}

	function parseTokens() {
		nextToken();
		parse();
	}
	/*Code to initialize parser*/

	saveColumnNames();


	return {
		getFormula:getFormula,
		getColumnNames:getColumnNames,
		isStartToken:isStartToken,
		isOPToken:isOPToken,
		isColumnToken:isColumnToken,
		nextToken:nextToken,
		getCurrentToken:getCurrentToken,
		parseTokens:parseTokens,
		getTokens:getTokens
	}
}
if(typeof module != 'undefined') {
    module.exports = Parser;
}