/*!
 * Wyde Ninja Display Module
 * version 4.6.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */

(function($) {

$.extend($.fn.classfunc,{
 /**
 * currency : formatting amount with currency using blur (on lose focus event)
 */
   currency: function(Symbol) { 
	   var format;
	   
	   switch ( Symbol ) {
			case 'USD':
				format = $.formatCurrency.regions['en-US'];
				break;
			case 'EUR':
				if ( $.lang.LanguageCode = 'En' )
    				format = $.formatCurrency.regions['us-FR'];
   				else
    				format = $.formatCurrency.regions['fr-FR']; 
				
				break;
		};
		$(this).formatCurrency(format);		
		$(this).blur(function(event)
		{
			$(this).formatCurrency(format);
		});
	},
 /**
 * removecurrency : formatting amount with currency using blur (on lose focus event)
 */
   removecurrency: function(Symbol) {
       var format;
	   var input = $(this);
	   switch ( Symbol ) {
			case 'USD':
				format = $.formatCurrency.regions['en-US'];
				break;
			case 'EUR':
				if ( $.lang.LanguageCode = 'En' )
    				format = $.formatCurrency.regions['us-FR'];
   				else
    				format = $.formatCurrency.regions['fr-FR']; 
				break;
		};
	   var fn = function() {
			input.val(input.asNumber(format));
			return true;
		};
		fn();
		input.focus(fn);
		input.blur(fn);
		input.parents('form:eq(0)').submit(fn);
   }
});

})(jQuery);