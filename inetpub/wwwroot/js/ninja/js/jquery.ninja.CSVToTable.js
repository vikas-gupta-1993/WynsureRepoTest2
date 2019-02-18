/*!
 * Wyde Ninja Display Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */

(function($) {

$.extend($.fn.classfunc,{
/**
 * CSVToHtmlTable : Display csv file in HTML table
 * [selector] Element where to insert table
 * [csvFile] Path to the file to load/data
 */	
	CSVToHtmlTable: function(selector, csvFile) {
		var fn = function() {
			$(selector).CSVToTable(csvFile, {loadingImage: '../../images/CSVToTable/loading.gif', startLine: 0 });
		};
	}
});

})(jQuery);