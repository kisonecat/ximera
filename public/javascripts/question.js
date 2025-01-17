var $ = require('jquery');
//
// Number questions within there parent environment (presumable exercise or example ...)
// 
var addNumbers = function(index) {
    var q = $(this);
    var nr = q.parent().children('[class~="question"]').index(q)
//	console.log("sibling questions of " + q.attr("id"))
//	console.log(q.parent().children('[class~="question"]'))
	q.attr("numbered",nr+1)
// or without jQuery ...?
//	q.setAttribute("numbered",[].slice.call(q.parentNode.getElementsByClassName("question")).indexOf(q)+1)
};

$.fn.extend({
    numberQuestion: function() {
		return this.each( addNumbers );
    }
});    



