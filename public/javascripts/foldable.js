var $ = require('jquery');
require('jquery-ui/ui/widgets/accordion');
var _ = require('underscore');
var database = require('./database');

var buttonHtml = '<button class="btn btn-info btn-xs btn-hint-collapse" type="button" aria-expanded="false" aria-controls="collapse"><i class="fa fa-chevron-down"></i></button>';

jQuery.fn.removeAttributes = function () {
	return this.each(function () {
		var attributes = $.map(this.attributes, function (item) {
			return item.name;
		});
		var img = $(this);
		$.each(attributes, function (i, item) {
			img.removeAttr(item);
		});
	});
}

var createFoldable = function() {
    var foldable = $(this);
	foldable.removeAttributes()
	foldable.wrap('<div class="accordion"></div>')
	foldable.before("<h3>Klap uit</h3>")

	/*foldable.wrap(function () {
		return '<div class="accordion"><h3>Klap uit</h3><div>'+ $(this).html() + '</div></div>'
	});*/

    /*var button = $(buttonHtml);
    foldable.before('<div class="clearfix"></div>');
    foldable.before(button);

    button.click( function() {
	if (foldable.persistentData( 'collapsed' )) {
	    foldable.persistentData( 'collapsed', false );
	} else {
	    foldable.persistentData( 'collapsed', true );
	}
    });
    
    foldable.persistentData( function(event) {
	if ( (foldable.persistentData( 'collapsed' ) == true) != (foldable.attr('data-original') == 'expandable') ) {
	    button.find('i').addClass('fa-rotate-90');
	    //foldable.collapse('hide');
	    foldable.css( 'font-size', '0px' );
	    foldable.children().hide();
	    $('.unfoldable', foldable).show();
	    $('.unfoldable', foldable).parentsUntil( foldable ).show();
	    $('.foldable', foldable).hide();	    
	} else {
	    button.find('i').removeClass('fa-rotate-90');
	    foldable.children().show();
	    //$('.unfoldable', foldable).show();	    
	    //foldable.collapse('show');
	    foldable.css( 'font-size', '12pt' );
	    $('.foldable', foldable).show();
	}

    });*/

};

$.fn.extend({
    foldable: function() {
		this.each( createFoldable );
    }
});    
