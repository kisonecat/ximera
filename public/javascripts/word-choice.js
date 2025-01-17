var $ = require('jquery');
var _ = require('underscore');
var MathJax = require('mathjax');
var database = require('./database');
var TinCan = require('./tincan');

var createWordChoice = function() {
    var wordChoice = $(this);
    
    var id = wordChoice.attr('id');
    var element = $('<div class="dropdown word-choice btn-ximera-submit"><button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&mdash;</button></div>');
    var button = $('button', element);
    element.attr('id', id );
    button.attr('id', id + "-button");

    var menu = $('<div class="dropdown-menu" aria-labelledby="' + id + '-button"></div>');
    element.append(menu);
    
    $('.choice', wordChoice).each( function() {
	var choice = $(this);

	var link = $('<button class="dropdown-item choice" type="button"></button>');
	if (choice.hasClass( "correct" ))
	    link.addClass("correct");
	link.attr( 'id', choice.attr('id') );
	
	link.append( choice.contents() );
	menu.append( link );

	link.click( function() {
	    element.persistentData( 'response', choice.attr('id') );
	    
	    if (link.hasClass("correct")) {
		element.persistentData('correct', true);
	    } else {
		element.persistentData('correct', false);		
	    }

	    element.trigger( 'ximera:attempt' );
	    
	    if (element.persistentData('correct')) {
		element.trigger( 'ximera:correct' );
	    }	    
	
	    TinCan.answer( element, { response: element.persistentData('response'),
				      success: element.persistentData('correct') } );
	    
	});
    });
    
    wordChoice.replaceWith( element );

    element.trigger( 'ximera:answer-needed' );

    element.persistentData( function(event) {
	if (element.persistentData('response')) {
	    var link = element.find( '#' + element.persistentData('response') );
	    button.empty();
	    button.append( link.clone().contents() );
	} else {
	    button.html( '&mdash;' );
	}

	if (element.persistentData('correct')) {
	    element.addClass('btn-ximera-correct');
	    element.removeClass('btn-ximera-incorrect');
	    element.removeClass('btn-ximera-submit');
	    button.addClass('btn-success');
	    button.removeClass('btn-danger');
	    button.removeClass('btn-primary');	    	    	    
	} else {
	    if (element.persistentData('correct') === undefined) {
		element.removeClass('btn-ximera-correct');
		element.removeClass('btn-ximera-incorrect');
		element.addClass('btn-ximera-submit');
		button.removeClass('btn-success');
		button.removeClass('btn-danger');
		button.addClass('btn-primary');	    	    	    
	    } else {
		element.removeClass('btn-ximera-correct');
		element.addClass('btn-ximera-incorrect');
		element.removeClass('btn-ximera-submit');
		button.removeClass('btn-success');
		button.addClass('btn-danger');
		button.removeClass('btn-primary');
	    }
	}
	
	return false;
    });
        
};

$.fn.extend({
    wordChoice: function() {
	return this.each( createWordChoice );
    }
});


