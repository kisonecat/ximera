var $ = require('jquery');

var addNumbers = function(index) {
    var theorem = $(this);
	theorem.attr("numbered", " " + (index+1))
};

$.fn.extend({
    numberTheorem: function() {
		return this.each( addNumbers );
    }
});    



