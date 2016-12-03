var assert = require('assert');
require("amd-loader");
utils = require('../utils');
describe('utils load methods', function () {
	it("should check the module is loaded", function () {
		assert.equal(false, utils === undefined);
	});

	it("bottom up tagger", function () {
		var tokens = [{q:'a'}, {q:'b'}],
			tagDict = {'a':{tag:'COLUMN'}};
		assert.deepEqual([{q:'a', tag:'COLUMN', tagKey:'a', info:null}, {q:'b'}], utils.bottomUpTagger(tokens, tagDict));
	})

	it("should test for bigram column name", function () {
		var tokens = [{q:'a'}, {q:'b'}],
		tagDict = {'a b':{tag:'COLUMN'}};
		assert.deepEqual([{q:'a b', tag:'COLUMN', tagKey:'a b', info:null}], utils.bottomUpTagger(tokens, tagDict));
	})

	it("bigram column name should take precedence over single name", function () {
		var tokens = [{q:'a'}, {q:'b'}],
		tagDict = {'a b':{tag:'COLUMN'}, 'a':{tag:'COLUMN'}};
		assert.deepEqual([{q:'a b', tag:'COLUMN', tagKey:'a b', info:null}], utils.bottomUpTagger(tokens, tagDict));
	})

	it("Last columns are tagged correctly", function () {
		var tokens = [{q:'a'}, {q:'b'}, {q:'a'}],
		tagDict = {'a b':{tag:'COLUMN'}, 'a':{tag:'COLUMN'}};
		assert.deepEqual([{q:'a b', tag:'COLUMN', tagKey:'a b', info:null}, {q:'a', tag:'COLUMN', tagKey:'a', info:null}], utils.bottomUpTagger(tokens, tagDict));
	})

	it("column names are case insensitive", function () {
		var tokens = [{q:'A'}, {q:'b'}, {q:'a'}],
		tagDict = {'a b':{tag:'COLUMN', info:{DATATYPE:'DECIMAL'}}, 'a':{tag:'COLUMN', info:{DATATYPE:'STRING'}}};
		assert.deepEqual([{q:'A b', tag:'COLUMN', tagKey:'a b', info:{DATATYPE:'DECIMAL'}}, {q:'a', tag:'COLUMN', tagKey:'a', info:{DATATYPE:'STRING'}}], utils.bottomUpTagger(tokens, tagDict));
	})

	it("find synsets for some words", function () {
		var tokens = [{q:'maximum'}, {q:'lease'}, {q:'least'}];
		utils.replaceSynonyms(tokens)
		assert.deepEqual([ { q: 'maximum' }, { q: 'lease' }, { q: 'min' } ], tokens)
	})

	it("stem some words", function () {
		var tokens = [{q:'maximum'}, {q:'lease'}, {q:'least'}];
		utils.simpleStemmer(tokens);
		assert.deepEqual([{q:'max'}, {q:'lease'}, {q:'least'}], tokens)
	})
})