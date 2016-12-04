require.config({
  paths: {
    jquery: 'jquery.min',
    semantic: 'semantic'
  },
  shim: {
    // util depends on jquery.
    // util is non-AMD.
    "semantic": {
      deps: ["jquery"]
    }
  }
});



require(['./jquery.min', './semantic/dist/semantic.min'], function() {
    require(['./exprEvaluator'],   function(expr) {
      var columns = [{'name':'Location', 'dataType':'STRING'},
              {'name':'Duration', 'dataType':'DECIMAL'},
              {'name':'Agent name', 'dataType':'STRING'},
              {'name':'Wait Time', 'dataType':'DECIMAL'}];
          dataset = {'Location':['Bangalore', 'Delhi', 'Bangalore', 'Bellary', 'Hyderabad', 'Bellary'],
            'Duration':[120, 135, 88, 225, 90, 98],
            'Agent name':['Murthy', 'Singh', 'Murthy', 'Reddy Brother', 'Salim Pheku', 'Reddy Brother'],
            'Wait Time':[20, 15, 17, 19, 30, 10]};
      if(expr) {
        magic = new expr(dataset, columns);
        var content = [
          { title: 'Location' },
          { title: 'Duration' },
          { title: 'Agent name' },
          { title: 'Wait Time' },
          { title: 'What is the average Duration'},
          { title: 'average Wait Time' }
        ];
        var onSelect = function(result, response) {
          debugger
          var result = magic.answer(result.title);
          var resultArea = document.getElementById('result');
          resultArea.innerHTML = result.values.toString();
        }
        $('.ui.search').keypress(function (e) {
         var key = e.which;
         if(key == 13)  // the enter key code
          {
            var query = $('.ui.search')
              .search('get value');
            var result = magic.answer(query);
            var resultArea = document.getElementById('result');
            resultArea.innerHTML = result.values.toString();
          }
        });
        $('.ui.search')
          .search({
            source: content,
            onSelect:onSelect
          })
        ;

      }
  })
})
