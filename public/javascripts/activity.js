var $ = require('jquery');
var _ = require('underscore');
var MathJax = require('mathjax');
var TinCan = require('./tincan');
var ProgressBar = require('./progress-bar');

var activityCard = require('./activity-card');
var problem = require('./problem');
var theorem = require('./theorem');
var question = require('./question');
var mathAnswer = require('./math-answer');
var multipleChoice = require('./multiple-choice');
var selectAll = require('./select-all');
var wordChoice = require('./word-choice');
var hint = require('./hint');
var foldable = require('./foldable');
var youtube = require('./youtube');

var freeResponse = require('./free-response');
var coding = require('./coding');
var shuffle = require('./shuffle');
var feedback = require('./feedback');
var validator = require('./validator');
var javascript = require('./javascript');

var connectInteractives = require('./interactives').connectInteractives;

var database = require('./database');

var annotator = require('./annotator');

var createActivity = function() {
	var activity = $(this);
	
	$(".foldable", activity).foldable();
	$(".accordion", activity).addClass('hidden-out-of-view')

    //$('.activity-body', this).annotator();
    
    activity.fetchData( function() {
	activity.persistentData( function() {
	    if (!(activity.persistentData( 'experienced' ))) {
		TinCan.experience(activity);
		activity.persistentData( 'experienced', true );
	    }
	});

	ProgressBar.monitorActivity( activity );

	// Number theorems
	["theorem", "axiom", "conjecture", "corollary", "proposition", "lemma", "claim", "condition", "idea", "definition", "conclusion", "summary", "warning", "paradox", "example", "observation", "fact", "remark", "algorithm", "notation", "criterion", "exercise", "problem", "explanation", "exploration", "model","formula","procedure","template"].forEach(function(t){
		$("."+t, activity).numberTheorem();
	})


	$(".question", activity).numberQuestion();

	$(".problem-environment", activity).problemEnvironment();
	$(".multiple-choice", activity).multipleChoice();
	$(".select-all", activity).selectAll();
	$(".word-choice", activity).wordChoice();
	$(".hint", activity).hint();
	
	$(".free-response", activity).freeResponse();
	$(".javascript-code", activity).coding();	
	
	$(".shuffle", activity).shuffle();
	$(".feedback", activity).feedback();
	$(".validator", activity).validator();
	$(".inline-javascript", activity).javascript();
	$('.youtube-player', activity).youtube();
	
	connectInteractives();
	
	$('.activity-card').activityCard();
    });
};

$.fn.extend({
    activity: function() {
	return this.each( createActivity );
    },

    recordCompletion: function(proportionComplete) {
	var hash = $(this).activityHash();

	if (hash != undefined) {
	    var repositoryName = $(this).repositoryName();
	    var activityPath = $(this).activityPath();

	    database.setCompletion( repositoryName, activityPath, proportionComplete );
	}

	return;
    }
});    

