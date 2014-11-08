/* global require, console, module */
'use strict';	

var Promise = require('es6-promise').Promise;
var remap   = require('obender').remap;

var jquery = require('fs').readFileSync(__dirname + '/vendor/jquery.min.js', 'utf-8');
var t2json = require('fs').readFileSync(__dirname + '/vendor/jquery.tabletojson.js', 'utf-8');

/**
 * Sozin, v0.0.0
 * 
 * Exports for the module.
 * @return {DoExamCrawl}
 */
module.exports = (function () {

	// PRELF.html
	// PRELS.html
	// EXFA.html

	function DoExamCrawl(url) {
		var self = this;
		self.url = url;
	}

	// http://registrar.sas.cornell.edu/Sched/PRELF.html
	DoExamCrawl.prototype.query = function(term, type) {
		var self = this;
		term = (term.toUpperCase() === 'FALL' || term.toUpperCase() === 'SPRING') 
				  ? term.toUpperCase() : undefined;
		type = (type.toUpperCase() === 'PRELIM' || type.toUpperCase() === 'FINAL') 
				  ? type.toUpperCase() : undefined;

		if (!type || !term) return Promise.resolve({});

		var yoda = 
					 (term === 'FALL')   ? 
					 (type === 'PRELIM') ? 'PRELF' : 'EXFA' 
				 : (type === 'PRELIM') ? 'PRELS' : 'EXSP'

		var url   = self.url + yoda + '.html';

		var jsdom = require('jsdom');

		return new Promise(function (resolve, reject) {

			jsdom.env({
				url : url,
				src : [jquery, t2json],
			    done: 
			    function (err, window) {
			    	var $ = window.jQuery;

			    	if (err !== null) {
			    		console.error(err);
			    		reject(err);
			    	}
			    	
						var src = $('pre').html().split("\r\n");
							  src = clean(src, '').map(function (x) {
							  	var objarr = clean(x.split("   ").map(function (y) { return y.trim(); }), "");
							  	if (objarr === []) return null
							  	if (objarr[0].indexOf("<--") > -1) return null 
							  	return {
							  		class_sect : objarr[0],
							  		date			 : objarr[1],
							  		time 			 : objarr[2],
							  		location   : objarr[3],
							  	}
							  });
							  
			    	resolve(clean(src, null));
			  	}
			});
		});
	};

	// http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
	var clean = function(array, deleteValue) {
	  for (var i = 0; i < array.length; i++) {
	    if (array[i] == deleteValue) {         
	      array.splice(i, 1);
	      i--;
	    }
	  }
	  return array;
	};

	DoExamCrawl.prototype.getJSON = function(term, type) {
		return this.query(term, type);
	};

	return new DoExamCrawl('http://registrar.sas.cornell.edu/Sched/');
})();

