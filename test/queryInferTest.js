var assert = require('assert');
require("amd-loader");
describe('Array', function() {

  // describe('Testing queryPreprocessor', function() {
  //   it('lower case conversion', function() {
  //     assert.equal("what is company Name", QI.queryPreprocessor("what is company Name"));
  //   });
  // });

  describe('Testing Column name preprocessor', function() {
    it('spaces converted to hyphen', function() {
    	var columns = [{name:"company name", dataType:"STRING"},
    					{name:"Status", dataType:"STRING"},
    					{name:"Salary", dataType:"DECIMAL"},
    					{name:"joinDate", dataType:"DATETIME"}];

    	var processedColumns = [{name:"company name", dataType:"STRING"},
    					{name:"Status", dataType:"STRING"},
    					{name:"Salary", dataType:"DECIMAL"},
    					{name:"joinDate", dataType:"DATETIME"}];
    	 
    	assert.deepEqual(processedColumns, QI.columnNamePreprocessor(columns));
    });

  });


  describe('Testing nGram tokenizer', function() {
    it('Assert correct tokens ngram are returned', function() {
    	var query = "what is the company name",
    		ngramTokens=[
    		[{"token":"what","position":{"start":0,"end":4}},{"token":"is","position":{"start":4,"end":6}},{"token":"the","position":{"start":6,"end":9}},{"token":"company","position":{"start":9,"end":16}},{"token":"name","position":{"start":16,"end":20}}],
    		[{"token":"what is","position":{"start":0,"end":6}},{"token":"is the","position":{"start":4,"end":9}},{"token":"the company","position":{"start":6,"end":16}},{"token":"company name","position":{"start":9,"end":20}}],
    		[{"token":"what is the","position":{"start":0,"end":9}},{"token":"is the company","position":{"start":4,"end":16}},{"token":"the company name","position":{"start":6,"end":20}}],
    		[{"token":"what is the company","position":{"start":0,"end":16}},{"token":"is the company name","position":{"start":4,"end":20}}],[{"token":"what is the company name","position":{"start":0,"end":20}}]
    		];
    	assert.deepEqual(ngramTokens, QI.ngramTokenizer(query));
    });

    it('Assert correct tokens ngram are returned', function() {
    	var query ="", ngramTokens = [[]];
    	assert.deepEqual(ngramTokens, QI.ngramTokenizer(query));
    });
    
    it('Assert that for one token, only one token is returned', function() {
    	var query ="ABC", ngramTokens = [[{token:'ABC', position:{start:0, end:3}}]];
    	assert.deepEqual(ngramTokens, QI.ngramTokenizer(query));
    });

    it('verify that redundant spaces are neglected', function() {
    	var query ="ABC   CBD", ngramTokens = [[{"token":"ABC","position":{"start":0,"end":3}},{"token":"CBD","position":{"start":3,"end":6}}],
    	[{"token":"ABC CBD","position":{"start":0,"end":6}}]];
    	assert.deepEqual(ngramTokens, QI.ngramTokenizer(query));
    });

  });

  describe("Verify fuzzy string matching", function() {
  	it("Assert that equal string match", function() {
  		var s1 = "company", s2 = "company";
  		assert.equal(true, QI.fuzzyStringEquals(s1, s2));
  	})
  	
  	it("Assert that unequal strings donot match", function() {
  		var s1 = "company", s2 = "Salary";
  		assert.equal(false, QI.fuzzyStringEquals(s1, s2));
  	})

  	it("assert that case is ignored", function() {
  		var s1 = "company", s2 = "ComPany";
  		assert.equal(true, QI.fuzzyStringEquals(s1, s2));
  	})

  	it("assert that space and case are ignore", function() {
  		var s1 = "company name", s2 = "companyName";
  		assert.equal(true, QI.fuzzyStringEquals(s1, s2));
  	})

  	it("assert that hyphen is ignored", function() {
  		var s1 = "company-name", s2 = "companyName";
  		assert.equal(true, QI.fuzzyStringEquals(s1, s2));
  	})
  });

  describe("Test column mapper", function() {
  	it("assert column mapper maps the query to longest match", function() {
  		var query = "what is the company name",
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}],
  		matches = [ { token: 'company name',
    position: { start: 9, end: 20 },
    columnName: 'company name',
    dataType:'STRING' } ];
  		assert.deepEqual(matches, QI.columnMapper(QI.ngramTokenizer(query), columns))
  	})

  	it("assert column mapper maps correctly duplicate columns", function() {
  		var query = "what is the company name and company",
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}],
  		matches = [ { token: 'company', position: { start: 23, end: 30 }, columnName: "company", dataType:'STRING'},
  		{ token: 'company name', position: { start: 9, end: 20 }, columnName: "company name", dataType:'STRING'} ];
  		assert.deepEqual(matches, QI.columnMapper(QI.ngramTokenizer(query), columns))
  	})

  	it("verify that concatenated names are mapped correctly", function() {
  		var query = "what is the companyName and company",
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}],
  		matches = [ { token: 'companyName', position: { start: 9, end: 20 }, columnName: 'company name', dataType:'STRING' }, { token: 'company', position: { start: 23, end: 30 }, columnName: 'company', dataType:'STRING' } ];
  		
  		assert.deepEqual(matches, QI.columnMapper(QI.ngramTokenizer(query), columns))
  	})

  })

  describe("query is tagged correctly", function() {
  	it("column mapper works as expected", function() {
  		var query = "what is the company Name and company",
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
  		parsedQuery = [ { token: 'what', position: { start: 0, end: 4 } },
  						{ token: 'is', position: { start: 4, end: 6 } },
  						{ token: 'the', position: { start: 6, end: 9 } },
  						{ token: 'company Name', position: { start: 9, end: 20 }, columnName: 'company name', dataType:'STRING' },
  						{ token: 'and', position: { start: 20, end: 23 } },
  						{ token: 'company', position: { start: 23, end: 30 }, columnName: 'company', dataType:'STRING'} ];
  		assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns));
  	})

  	it("column mapper works as expected", function() {
  		var query = "what is the companyName when salary is 100",
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
  		parsedQuery = [ { token: 'what', position: { start: 0, end: 4 } },
  						{ token: 'is', position: { start: 4, end: 6 } },
  						{ token: 'the', position: { start: 6, end: 9 } },
  						{ token: 'companyName', position: { start: 9, end: 20 }, columnName: 'company name', dataType:'STRING'},
  						{ token: 'when', position: { start: 20, end: 24 } },
  						{ token: 'salary', position: { start: 24, end: 30 }, columnName: 'salary', dataType:'DECIMAL'},
  						{ token: 'is', position: { start: 30, end: 32 } },
  						{ token: '100', position: { start: 32, end: 35 } } ];
  		assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns));
  	})

  	it("column for different query", function() {
  		var query = "what is the join date when jayasimha joined";
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
  		parsedQuery = [ { token: 'what', position: { start: 0, end: 4 } },
  						{ token: 'is', position: { start: 4, end: 6 } },
  						{ token: 'the', position: { start: 6, end: 9 } },
  						{ token: 'join date', position: { start: 9, end: 17 }, columnName: 'joinDate', dataType:'DATETIME'},
  						{ token: 'when', position: { start: 17, end: 21 } },
  						{ token: 'jayasimha', position: { start: 21, end: 30 } },
  						{ token: 'joined', position: { start: 30, end: 36 } } ]
  		assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns));
  	})


  	it("query with zero match", function() {
  		var query = "what is the joi date when jayasimha joined";
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
		parsedQuery = [{ token: 'what', position: { start: 0, end: 4 } },
				  		  { token: 'is', position: { start: 4, end: 6 } },
				  		  { token: 'the', position: { start: 6, end: 9 } },
				  		  { token: 'joi', position: { start: 9, end: 12 } },
				  		  { token: 'date', position: { start: 12, end: 16 } },
				  		  { token: 'when', position: { start: 16, end: 20 } },
				  		  { token: 'jayasimha', position: { start: 20, end: 29 } },
				  		  { token: 'joined', position: { start: 29, end: 35 } } ]
		assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns));
  	})

  	it("assert that empty strings behaves responsibly", function() {
  		var query = "";
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
  		assert.deepEqual([], QI.getColumnTagged(query, columns))
  	})

  	it("all strings are a match", function() {
  		var query = "company ComPany name join join date date join";
  		columns = [{'name':'company', 'dataType':'STRING'},
  						{'name':'salary', 'dataType':'DECIMAL'},
  						{'name':'joinDate', 'dataType':'DATETIME'},
  						{'name':'company name', 'dataType':'STRING'}];
  		parsedQuery = [ { token: 'company', position: { start: 0, end: 7 }, columnName: 'company', dataType:'STRING'},
  		  { token: 'ComPany name', position: { start: 7, end: 18 }, columnName: 'company name', dataType:"STRING"},
  		  { token: 'join', position: { start: 18, end: 22 } },
  		  { token: 'join date', position: { start: 22, end: 30 }, columnName: 'joinDate', dataType:'DATETIME'},
  		  { token: 'date', position: { start: 30, end: 34 } },
  		  { token: 'join', position: { start: 34, end: 38 } } ]
  		assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns))
  	})

    it("all strings are a match", function() {
      var query = "what is the least salary";
      columns = [{'name':'company', 'dataType':'STRING'},
              {'name':'salary', 'dataType':'DECIMAL'},
              {'name':'joinDate', 'dataType':'DATETIME'},
              {'name':'company name', 'dataType':'STRING'}];
      var parsedQuery = [ { token: 'what', position: { start: 0, end: 4 } }, { token: 'is', position: { start: 4, end: 6 } }, 
      { token: 'the', position: { start: 6, end: 9 } }, { token: 'min', position: { start: 9, end: 14 } },
      { token: 'salary', position: { start: 14, end: 20 }, columnName: 'salary', dataType: 'DECIMAL' } ];
      assert.deepEqual(parsedQuery, QI.getColumnTagged(query, columns))
    })


  })
});
