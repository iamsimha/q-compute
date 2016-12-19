define(["https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.2/lodash.min.js"], function(_) {
	var utils = (function () {
		/**************************************/
		var synset = {'least':'min', 'mean':'average', 'arrange':'sort', 'largest':'max', 'total':'sum'};

		/**************************************/
		function replaceSynonyms(tokens) {
			for(var i = 0; i < tokens.length; i++) {
				if (tokens[i].q in synset && !('tag' in tokens[i])) {
					tokens[i].q = synset[tokens[i].q];
				}
			}
		}

		function simpleStemmer(tokens) {
			for (var i = 0; i < tokens.length; i++) {
				if (!('tag' in tokens[i])) {
					tokens[i].q = tokens[i].q.replace(/imum$/, "");
				}
			}
		}

		function normalizeString(s) {
			s = s.toLowerCase();
			s = s.replace(/\ +/, "");
			return s;
		}

		function getUID() {
			return Math.floor(Math.random()* 10000000) + "" + Math.floor(Math.random()* 10000000);
		}

		function combineTokens(tokens, delimiter) {
			if(!delimiter) delimiter = " ";
			var result = [], numTokens = tokens.length;
			for(var i = 0; i < numTokens; i++) {
				if(!('uid' in tokens[i])) {
					var t = {q:tokens[i].q, original:tokens[i].original};
					if('tag' in tokens[i]) t.tag = tokens[i].tag;
					if('tagKey' in tokens[i]) t.tagKey = tokens[i].tagKey;
					if('info' in tokens[i]) t.info = tokens[i].info;
					result.push(t);
				} else {
					var temp = {q:[tokens[i].q], original:[tokens[i].original]}, tag = tokens[i].tag, tagKey = tokens[i].tagKey, info = tokens[i].info||null;
					while(i + 1 < numTokens && tokens[i].uid === tokens[i+1].uid) {
						temp.q.push(tokens[i+1].q);
						temp.original.push(tokens[i+1].original);
						i += 1;
					}
					result.push({q:temp.q.join(""),
								original:temp.original.join(delimiter),
								tag:tag,
								tagKey:tagKey,
								info:info});
				}
			}
			return result;
		}

		function approximateKeyMatch(key, tagDict) {
			var result = {key:key, matched:false};
			if(key in tagDict) {
				result.matched = true;
			}
			var newKey = key.toLowerCase();		
			if(newKey in tagDict) {
					result.matched = true;
					result.key = newKey;
			}
			newKey = key.toUpperCase();
			if(newKey in tagDict) {
				result.matched = true;
				result.key = key;
			}
			return result;
		}

		function gramTagger(tokens, tagDict, gram_length, delimiter) {
			if(!delimiter) delimiter = "";
			for(var i = 0, numTokens = tokens.length; i < tokens.length; i++) {
				for(var j = i, currentTokens = []; j < i + gram_length && j < numTokens && i + gram_length <= numTokens; j++) {
					currentTokens.push(tokens[j].q);
				}
				currentTokens = currentTokens.join(delimiter);
				var result = approximateKeyMatch(currentTokens, tagDict);
				if(result.matched) {
					var uid = getUID();
					currentTokens = result.key;
					for(var j = i; j < i + gram_length && j < numTokens && i + gram_length <= numTokens; j++) {
						tokens[j].tag = tagDict[currentTokens].tag;
						tokens[j].uid = uid;
						tokens[j].tagKey = currentTokens;
						tokens[j].info = tagDict[currentTokens].info;
					}
				}
			}
		}

		function tagTokens(tokens, tagDict) {
			for(var i = 1; i <= tokens.length; i++) {
				gramTagger(tokens, tagDict, i);
			}
		}

		function fillIgnore(tokens) {
			for(var i = 0; i < tokens.length; i++) {
				if(!('tag' in tokens[i])) {
					tokens[i].tag = 'IGNORE';
				}
			}
		}

		function bottomUpTagger(tokens, tagDict) {
			tokens = _.cloneDeep(tokens);
			tagTokens(tokens, tagDict);
			return combineTokens(tokens);
		}

		return {
			bottomUpTagger:bottomUpTagger,
			replaceSynonyms:replaceSynonyms,
			simpleStemmer:simpleStemmer,
			fillIgnore:fillIgnore,
			normalizeString:normalizeString
		}
	})();

	if(typeof module != 'undefined') {
		var _ = require("./lodash.min");
	    module.exports = utils;
	}
	return utils;
})