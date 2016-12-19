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

function fillHeader(heading, table) {
  var thead = document.createElement('THEAD'),
  tr = document.createElement('TR');
  for(var i = 0; i < heading.length; i++) {
    var th = document.createElement('TH');
    th.appendChild(document.createTextNode(heading[i].name));
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  table.appendChild(thead);
}

function fillBody(heading, data, table) {
  var tbody = document.createElement("TBODY");
  for(var i = 0; i < data[heading[0].name].length; i++) {
    tr = document.createElement("TR");
    for(var j = 0; j < heading.length; j++) {
      var td = document.createElement("TD");
      td.appendChild(document.createTextNode(data[heading[j].name][i]));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}


function fillTable(heading, data, domNode) {
  var table = document.createElement('TABLE');
  fillHeader(heading, table)
  fillBody(heading, data, table)
  domNode.appendChild(table)
  table.className = "ui celled table";
}



// require(['./jquery.min', './semantic/dist/semantic.min'], function() {

// })
require(['../../exprEvaluator'],   function(expr) {
    var divNode = document.getElementById("data-table");



    var columns = [{'name':'Location', 'dataType':'STRING'},
            {'name':'Duration', 'dataType':'DECIMAL'},
            {'name':'Agent name', 'dataType':'STRING'},
            {'name':'Wait time', 'dataType':'DECIMAL'}];
        dataset = {'Location':['Bangalore', 'Delhi', 'Bangalore', 'Bellary', 'Hyderabad', 'Bellary'],
          'Duration':[120, 135, 88, 225, 90, 98],
          'Agent name':['Murthy', 'Singh', 'Murthy', 'Reddy Brother', 'Salim Pheku', 'Reddy Brother'],
          'Wait time':[20, 15, 17, 19, 30, 10]};
    debugger;
    fillTable(columns, dataset, divNode);
    if(expr) {
      magic = new expr(dataset, columns);
      var content = [
        { title: 'Location' },
        { title: 'Duration' },
        { title: 'Agent name' },
        { title: 'Wait time' },
        { title: 'what is the average Duration'},
        { title: 'what is the min Duration'},
        { title: 'what is the max Duration'},
        { title: 'what is the average Wait time'},
        { title: 'what is the min Wait time'},
        { title: 'what is the max Wait time'}
      ];
      var onSelect = function(result, response) {
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
          debugger;
          var result = magic.answer(query);
          var resultArea = document.getElementById('result');
          resultArea.innerHTML = result.values.toString();
          $('.ui.search')
                      .search('hide results');
        }
      });
      $('.ui.search')
        .search({
          source: content,
          onSelect:onSelect,
          showNoResults:false
        })
      ;

    }
})