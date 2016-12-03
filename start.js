define(function() {
	var QueryProcessor = (function () {

		var synset = {'least':'min', 'mean':'average', 'arrange':'sort', 'largest':'max'};

		/*********************/
		function getNgram(tokens, gram_length, delimiter) {
			var result = [], numTokens = tokens.length, currentTokens = "", start = 0, end = 0;
			if(!delimiter) {delimiter = " "};
			for(var i = 0; i < numTokens; i++) {
				for (var j = i, currentTokens = []; j < i + gram_length && j < numTokens && i + gram_length <= numTokens; j++) {
					currentTokens.push(tokens[j].token);
					if(j == i) {
						start = tokens[j].position.start;
					}
					end = tokens[j].position.end;
				}
				currentTokens = currentTokens.join(delimiter);
				if(currentTokens) {

					result.push({token:currentTokens, position:{start:start, end:end}});
				}
			}
			return result;
		}

		function fuzzyStringEquals(s1, s2) {
			s1 = s1.toLowerCase(), s2 = s2.toLowerCase();
			s1 = s1.replace(" ", "").replace("-", "");
			s2 = s2.replace(" ", "").replace("-", "");
			if(s1 === s2) {return true};
			return false;
		}

		function removeOverlapMatches(allMatches) {
			var uniqueMatches = [], match, currentMatch, toBeExcluded;
			for (var i = 0; i < allMatches.length; i++) {
				match = allMatches[i], toBeExcluded = false;
				for(var j = i + 1;  j < allMatches.length; j++) {
					currentMatch = allMatches[j];
					if(currentMatch.position.start === match.position.start
						&& currentMatch.position.end - match.position.end > 0) {
						toBeExcluded = true;
					}
				}
				if(!toBeExcluded) uniqueMatches.push(match);
			}
			return uniqueMatches
		}
		/*********************/


		function ngramTokenizer(query) {
			var nGramTokens = [], tokens = query.split(/\ +/), start = 0, end = 0, tokensWithPosition = [];
			for (var i = 0; i < tokens.length; i++) {
				tokensWithPosition.push({token:tokens[i], position:{start:start, end:start+tokens[i].length}});
				start = start + tokens[i].length;
			}
			for (var i = 0; i < tokens.length; i++) {
				nGramTokens.push(getNgram(tokensWithPosition, i+1));
			}
			return nGramTokens;
		}

		function columnNamePreprocessor(columns) {
			var processedColumns = JSON.parse(JSON.stringify(columns))
			// for (var i = 0; i < processedColumns.length; i++) {
			// 	processedColumns[i].name = processedColumns[i].name.replace(" ", '-'); 
			// }
			return processedColumns
		}

		function queryPreprocessor(queryString, columnNames) {
			queryString.toLowerCase();
			return queryString
		}

		function columnMapper(ngrams, columns) {
			var allMatches = [];
			for(var i = 0, allNgrams = []; i < ngrams.length; i++) {
				allNgrams = allNgrams.concat(ngrams[i])
			}
			for (var i = 0; i < allNgrams.length; i++) {
				for(var j = 0; j < columns.length; j++) {
					if(fuzzyStringEquals(allNgrams[i].token, columns[j].name)) {
						allNgrams[i].columnName = columns[j].name
						allNgrams[i].dataType = columns[j].dataType
						allMatches.push(allNgrams[i]);
					}
				}
			}
			return removeOverlapMatches(allMatches);
		}

		function replaceSynonyms(tokens) {
			for(var i = 0; i < tokens.length; i++) {
				if (tokens[i].token in synset && tokens[i].tag !== 'COLUMN') {
					tokens[i].token = synset[tokens[i].token];
				}
			}
		}

		function simpleStemmer(tokens) {
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i].tag !== 'COLUMN') {
					tokens[i].token = tokens[i].token.replace(/imum$/, "");
				}
			}
		}

		/*
		Needs refactoring
		 */
		function getColumnTagged(query, columns) {
			var nGrams = ngramTokenizer(query),mappedColumns = columnMapper(nGrams, columns),
				oneGram = nGrams[0], taggedQuery = [], startPositionMap = {}, lastTokenEnd = 0,
				currentToken, matchedColumn;
			for(var i = 0; i < mappedColumns.length; i++) {
				startPositionMap[mappedColumns[i].position.start] = mappedColumns[i];
			}
			var i = 0;
			while(i < oneGram.length) {
				currentToken = oneGram[i];
				if(currentToken.position.start in startPositionMap) {
					matchedColumn = startPositionMap[currentToken.position.start];
					while (currentToken.position.start < matchedColumn.position.end) {
						i += 1
						if(i < oneGram.length) currentToken = oneGram[i];
						else break;
					}
					taggedQuery.push(matchedColumn);
				} else {
					taggedQuery.push(currentToken);
					i += 1;
				}

			}
			replaceSynonyms(taggedQuery);
			simpleStemmer(taggedQuery);
			return taggedQuery;
		}

		return {
			columnNamePreprocessor:columnNamePreprocessor,
			queryPreprocessor:queryPreprocessor,
			ngramTokenizer:ngramTokenizer,
			fuzzyStringEquals:fuzzyStringEquals,
			columnMapper:columnMapper,
			getColumnTagged:getColumnTagged
		}
	})();
	if(typeof module != 'undefined') {
	    module.exports = QueryProcessor;
	}
	return QueryProcessor;
});