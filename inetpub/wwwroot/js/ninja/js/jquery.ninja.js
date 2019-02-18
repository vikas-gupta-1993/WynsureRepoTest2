/*!
 * Wyde Ninja Core
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {
	///////////////////////// init default arrays //////////////////////////////////
	if (!$.fn.classfunc) $.fn.classfunc = {};
	if (!$.lang) $.lang = {};
	////////////////// fill classfunc with core functions //////////////////////////
	$.extend($.fn.classfunc, {
		/**
		 * LanguageCode : set default language to user messages
		 * apply on : all 
		 * [value] the language defined in jquery.ninja.language.js, default value = 'En'
		 */
		LanguageCode: function (value) {
			$.lang.LanguageCode = value;
			moment.locale($.lang.LanguageCode);
		},
		/**
		 * DateFormat : set default date format
		 * apply on : all 
		 * [value] the default date format : can be 'm_d_y' or 'd_m_y'
		 */
		DateFormat: function (value) {
			if (value == 'm_d_y') {
				$.lang.DateFormat = 'mm/dd/yyyy';
			} else if (value = 'd_m_y') {
				$.lang.DateFormat = 'dd/mm/yyyy';
			} else {
				$.lang.DateFormat = 'mm/dd/yyyy';
			}
		},
		/**
		 * toggle : when element is clicked, display argument if argument is hidden, hide if displayed
		 * apply on : all clickable element
		 * [selector] selector of the element to toggle (for ex : #id_of_element) 
		 */
		toggle: function (selector) {
			$(this).bind('click', selector, function (event) {
				$(event.data).toggle();
			});
		}
	});
	$.lang.DateFormat = 'mm/dd/yyyy';
	$.lang.LanguageCode = 'En';
	$.fn.ClassError = 'has-error';
	$.fn.ClassInfo = 'info';
	$.fn.ClassValid = 'success';
	/**
	 * parseType : transform values in associative array in the corresponding type
	 */
	$.parseType = function (myArray) {
		for (var i = 0; i < myArray.length; i++) {
			switch (myArray[i].substring(0, 1).toLowerCase()) {
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '-':
				if (myArray[i].match("^[-]?[0-9]*[\.]?[0-9]+$")) myArray[i] = myArray[i].toFloat();
				break;
			case 'f':
				if (myArray[i].toLowerCase() == 'false') myArray[i] = false;
				break;
			case 't':
				if (myArray[i].toLowerCase() == 'true') myArray[i] = true;
				break;
			case 'n':
				if (myArray[i].toLowerCase() == 'null') myArray[i] = null;
				break;
			case '\'':
				myArray[i] = myArray[i].substring(1);
		    default:
			    myArray[i] = myArray[i].replace('+',' ');
			}
			
		}
	};

	///////////////////////// extend jquery with wyde core module //////////////////
	$.extend($.fn, {
		/**
		 * enable : enable field (use this for maximum compatibility)
		 */
		enableForm: function () {
			$(this).removeAttr('disabled');
			$(this).removeClass('disabled');
		},
		/**
		 * disabled : disable field (use this for maximum compatibility)
		 */
		disableForm: function () {
			$(this).attr('disabled', 'disabled');
			$(this).addClass('disabled');
		},
		/**
		 * toggleError : Make error appear or disappear
		 * [msg] if null remove error message, else set error specified
		 * chainable
		 */
		toggleError: function (msg, errorClass) {
			this.each(function (i) {
				errorClass = errorClass == undefined ? $.fn.ClassError : errorClass;
				var helpWrappers = $(this).parents('.help-wrapper');
				if (helpWrappers.length > 0) {
					var helpPlaceHolder = $(helpWrappers).first().find('.help-placeholder');
				} else if ($(this).is(':input')) {
					var helpWrappers = $(this).parent().addClass('control-group');
					var helpPlaceHolder = $(this).parent();
				} else {
					var helpWrappers = $(this);
					var helpPlaceHolder = $(this);
				}
				var helpInline = helpPlaceHolder.find('*[class*="help-block"]');
				if (msg == undefined) { // set error message
					helpInline.remove();
					helpWrappers.removeClass(errorClass);
					$(this).removeClass(errorClass);
				} else {
					if (msg) {
						if (helpInline.length == 0) {
							helpInline = $('<span class="help-block"></span>');
							helpPlaceHolder.append(helpInline);
						}
						helpInline.html(msg);
					}
					helpWrappers.addClass(errorClass);
					$(this).addClass(errorClass);
				}
			});
			return this;
		},
		/**
		 * EvalClass : eval a jquery HTML class functions
		 * [context] allow you to make your own classfunc as execution context 
		 * chainable
		 */
		EvalClass: function (context) {
			context = context || $(this).classfunc;
			const myEval = function (i) {
				if ($(this).attr('class')) {
					var ClassNames = $(this).attr('class').split(new RegExp("[ ]+", "g"));
					for (var c = 0; c < ClassNames.length; c++) {
						var ClassName = ClassNames[c];
						if (ClassName != "") {
							var myArgs = ClassName.replace(')', '').split(new RegExp("[(,]+", "g"));
							var myFunc = myArgs.shift();
							$.parseType(myArgs);
							if (context[myFunc]) {
								//alert(myFunc+' called on class="'+$(this).attr('class')+'"...');
								if (context[myFunc].apply($(this), myArgs) == false) break;
							}
						}
					}
				}
			}  
            myEval.apply($(this).first());
            this.find('*[class]').each(myEval);

			return this;
		},
		/**
		 * ClassArgs : get arguments of all classes 
		 * return : object {class.[args]}
		 */
		ClassArgs: function () {
			var ClassNames = $(this).attr('class').split(new RegExp("[ ]+", "g"));
			var result = {};
			for (var c = 0; c < ClassNames.length; c++) {
				var ClassName = ClassNames[c];
				var indexP = ClassName.indexOf('(');
				if (indexP == -1) {
					var myFunc = ClassName;
					var myArgs = [];
				} else {
					var myFunc = ClassName.substring(0, indexP);
					var myArgs = ClassName.substring(indexP + 1, ClassName.length - 1).split(new RegExp("[,]+", "g"));
					$.parseType(myArgs);
				}
				switch (myArgs.length) {
				case 0:
					result[myFunc] = true;
					break;
				case 1:
					result[myFunc] = myArgs[0];
					break;
				default:
					result[myFunc] = myArgs;
				}
			}
			return result;
		},

		htmlVal: function () {
			if ($(this).is(':input')) {
				return $.fn.val.apply(this, arguments);
			} else {
				return $.fn.text.apply(this, arguments);
			}
		},

		textVal: function (str) {
			// JPR if (str == null) { is necessary due to change in .val() and .text() behavior in jquery
			if (str == null) {
				if ($(this).is(':input')) return $(this).val();
				else return $(this).text();
			} else {
				if ($(this).is(':input')) return $(this).val(str);
				else return $(this).text(str);
			}
		},
		/**
		 * translate : translate an array in current language
		 * [args] array of parameters to replace with {0}, {1}, {2}, etc... in translation 
		 */
		translate: function (args) {
			var fn;
			var message = this[0][$.lang.LanguageCode.toUpperCase()];
			if (args !== undefined) {
				if (typeof args == 'object' && args.length) {
					fn = function (index) {
						for (var i = 0; i < args.length; i++) {
							message = message.replace('{' + i + '}', args[i]);
						}
					}
				} else {
					fn = function (index) {
						message = message.replace('{0}', args);
					};
				}
				this.each(fn);
			}
			return message;
		},

		callDialogBlock: function (){
			$.blockUI({
				message : "<h1>Do you want to leave the page?</h1>",
				css :{
					width: '275px'
				}
			}
			);
		}
	});
})(jQuery);
//////////////////////// set javascript core functions ///////////////////////// 
/**
 * toInt : convert to Int
 * return a number
 */
String.prototype.toInt = function () {
	var str = this;
	while (str.substring(0, 1) == '0' && str.length > 1) {
		str = str.substring(1);
	}
	return parseInt(str);
};
/**
 * toFloat : convert to float
 * return a number 
 */
String.prototype.toFloat = function () {
	str = this.replace(",", ".");
	while (str.substring(0, 1) == '0' && str.length > 1 && str.substring(0, 2) != '0.') {
		str = str.substring(1);
	}
	return parseFloat(str);
};
Number.prototype.toFloat = function () {
	return this;
};
/**
 * parseType : transform value in the corresponding type
 */
String.prototype.parseType = function () {
	switch (this.substring(0, 1).toLowerCase()) {
	case '0':
	case '1':
	case '2':
	case '3':
	case '4':
	case '5':
	case '6':
	case '7':
	case '8':
	case '9':
	case '-':
		if (this.match("^[-]?[0-9]*[\.]?[0-9]+$")) return this.toFloat();
		break;
	case 'f':
		if (this.toLowerCase() == 'false') return false;
		break;
	case 't':
		if (this.toLowerCase() == 'true') return true;
		break;
	case 'n':
		if (this.toLowerCase() == 'null') return null;
		break;
	case '\'':
		return this.substring(1);
	}
	return this;
};

/////////////////// starts html class evaluation /////////////////////////////// 
$(document).ready(function () {
	$("*[class]").EvalClass();
	$('body').removeClass('loading');
});

$('body').addClass('loading');
$(document).on("keydown", function(e){
	if (e.which === 8 && !$(e.target).is(":input")){
			e.preventDefault();
		}
	})