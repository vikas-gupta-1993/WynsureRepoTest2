/*!
 * Wyde Ninja Submit Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {

	$.fn.ajaxfunc = {
		myform : null,
		closeDialogOnResponse: false,
		displayResultOnDialog: false,
		updateWithResult: null,
		redirectOnEmptyResponse: null,
		dismissOnError: false,
		data: {},
		blockSelector: '',
		inputData: [],
		toggleWaitClass: [],
		toggleStateClass: [],
		successOnResponse: '',
		resetForm: false,
		dataType: null,
		redirectOnResponse: null,
		beforeSerialize: function(form, options) {
			var elementsToBlur;
			if (options.dismissOnError === true) {
				var sel = $.fn.ajaxfunc.myform;
			} else if (options.dismissOnError) {
				var sel = $($.fn.ajaxfunc.myform.find(options.dismissOnError)[0]);
			}
			if (sel) {
				var blockSubmit = sel.find('.blockSubmit');
				blockSubmit.each(function () {
					var args = blockSubmit.ClassArgs();
					blockSubmit.toggleError('', args.blockOnSubmit);
				});
				if (blockSubmit.length > 0) return false;
				elementsToBlur = sel.find("*[class]");
				//forbidBlurOnSubmit is a key word to use on element that should not blur when submiting a form
				//this is usefull for element with particular behavior using a blur event.
				elementsToBlur.not('.forbidBlurOnSubmit').blur();
				if (sel.find(":input." + $(this).ClassError).filter(":available").length > 0) {
					return false;
				}
			}
			$.fn.ajaxfunc.myform.find('*[class]').trigger('beforeSubmit', $.fn.ajaxfunc.myform);
			return true;
		},
		beforeSubmit: function (arr, form, options) {
			if (!$(this).is(':enabled')) {
				return false;
			}
			if (this.toggleWaitClass.length > 1) {
				$(this.toggleWaitClass[0]).addClass(this.toggleWaitClass[1]);
			}
			switch (this.toggleStateClass.length) {
			case 4:
				$(this.toggleStateClass[0]).removeClass(this.toggleStateClass[3]);
			case 3:
				$(this.toggleStateClass[0]).removeClass(this.toggleStateClass[2]);
			case 2:
				$(this.toggleStateClass[0]).addClass(this.toggleStateClass[1]);
			}
			var BlockOptions = {message: null};
			if (this.transparent) {
				BlockOptions.overlayCSS = {opacity: 0.0}
			}
			this.blockSelector == '' ? form.block(BlockOptions) : $(this.blockSelector).block(BlockOptions);
			return true;
		},
		success: function (responseText, statusText, jqXHR, form) {
			this.blockSelector == '' ? form.unblock() : $(this.blockSelector).unblock();
			if (jqXHR.getResponseHeader('Content-Location')) {
				window.location = jqXHR.getResponseHeader('Content-Location');
				return;
			}
			if (responseText == '' && (this.redirectOnEmptyResponse == '' || this.redirectOnEmptyResponse == true)) {
				window.location.reload();
				return;
			} else if (this.redirectOnResponse != null && typeof this.redirectOnResponse == 'object') {
				if (this.redirectOnResponse[0] == responseText) {
					window.location = this.redirectOnResponse[1];
					return;
				}
			} else if (typeof this.redirectOnResponse == 'string') {
				if (this.redirectOnResponse == responseText) {
					window.location.reload();
					return;
				}
			}
			if (this.refreshOnHeader) {
				var httpHeader = jqXHR.getResponseHeader(this.refreshOnHeader[0]);
				if (httpHeader == this.refreshOnHeader[1]) {
					window.location.reload();
					return;
				}
			}
			if (this.closeDialogOnResponse != false) {
				if ((this.closeDialogOnResponse == true && responseText == '') || responseText == this.closeDialogOnResponse) {
					form.parents('.dialog').dialog('close');
				}
			}
			if (this.displayResultOnDialog && responseText != '') {
				$(responseText).dialog({
					modal: true
				});
			}
			if (this.toggleWaitClass.length > 1) {
				$(this.toggleWaitClass[0]).removeClass(this.toggleWaitClass[1]);
			}
			switch (this.toggleStateClass.length) {
			case 4:
				$(this.toggleStateClass[0]).removeClass(this.toggleStateClass[3]);
			case 3:
				if (this.successOnResponse == responseText) {
					$(this.toggleStateClass[0]).addClass(this.toggleStateClass[2]);
				}
			case 2:
				$(this.toggleStateClass[0]).removeClass(this.toggleStateClass[1]);
			}
			if (this.updateFormWithResult) {
				var toAppend = $.parseHTML(responseText);
				var container = form;
				container.empty();
				$(toAppend).appendTo(container);
				$(toAppend).appendTo(form.empty()).EvalClass();
			} else if (this.updateWithResult) {
				var toAppend = $.parseHTML(responseText);
				var container = $(this.updateWithResult).first();
				container.empty();
				$(toAppend).appendTo(container);
				$(toAppend).EvalClass();
			}
			if (this.triggerOnSuccess) {
				$(this.triggerOnSuccess[1]).trigger(this.triggerOnSuccess[0]);
			}

		},
		statusCode: {
			301: function (xhr) {
				alert('301');
			},
			404: function () {
				alert('404 not found');
				$.fn.ajaxfunc.myform.unblock();
			},
			418: function () {
				window.location.reload();
			}
		}
	};


	$.extend($.fn.classfunc, {
		
		/**
		 * dismissOnError : cancel submit when an input has failed validation
		 * apply on : form submit item 
		 */
		dismissOnError: function (selector) {
			if ($(this).is('form')) {
				var form = $(this);
			} else {
				var form = $(this).parents('form:eq(0)');
			}
			if (selector) {
				var sel = $(selector);
			} else {
				var sel = form;
			}
			if (form) {
				form.bind('submit', function () {
					if (sel) {
						sel.find("*[class]").blur();
						if (sel.find(":input." + $(this).ClassError).filter(":available").length > 0) {
							form.unblock();
							return false;
						}
						return true;
					}
				});
			}
		},
		/**
		 * blockOnSubmit : block form submission
		 * [ErrorHtmlClass] html class used to toggle error is submission happens 
		 * apply on : any element in form
		 */
		blockOnSubmit: function (ErrorHtmlClass) {
			$(this).addClass('blockSubmit');
			//ErrorHtmlClass is used in before submit
		},
		/**
		 * inputSubmitOn : submit form on specified event and optionaly insert an input name and value in request before submit
		 * [event] (optional) event to bind on submit, default = click 
		 * [name] (optional) name of the input inserted into the form before submit (if not specified, input not inserted into request)
		 * [value] (optional) value of the input inserted into the form before submit (if not specified, take the content or the value)
		 * apply on : all clickable element inside a form
		 */
		inputSubmitOn: function (event, name, value) {
			$(this).bind(event ? event : 'click', function () {
				if (!$(this).is(':enabled')) {
					return false;
				}
				$.fn.ajaxfunc.myform  = $(this).parents('form:eq(0)');
				if ($.fn.ajaxfunc.myform.length == 0) return;
				if (name) {
					if (value == null) value = $(this).htmlVal();
					var myinput = $.fn.ajaxfunc.myform.find(':input[name=' + name + ']');
					if (myinput.length > 0) {
						myinput.val(value);
						$.fn.ajaxfunc.myform.submit();
					} else {
						myinput = $('<input type="hidden" name="' + name + '" value="' + (value ? value : '0') + '" />');
						$.fn.ajaxfunc.myform.append(myinput);
						$.fn.ajaxfunc.myform.submit();
						myinput.remove();
					}
				} else {
					$.fn.ajaxfunc.myform.submit();
				}
				return false;
			});
		},
		/**
		 * inputSubmit : submit form on click and optionaly insert an input name and value in request before submit
		 * [name] (optional) name of the input inserted into the form before submit (if not specified, input not inserted into request)
		 * [value] (optional) value of the input inserted into the form before submit (if not specified, take the content or the value)
		 * apply on : all clickable element inside a form
		 */
		inputSubmit: function (name, value) {
			$(this).click(function () {
				if (!$(this).is(':enabled')) {
					return false;
				}
				$.fn.ajaxfunc.myform = $(this).parents('form:eq(0)');
				if ($.fn.ajaxfunc.myform.length == 0) return;
				if (name) {
					if (value == null) value = $(this).htmlVal();
					var myinput = $.fn.ajaxfunc.myform.find(':input[name="' + name + '"]');
					if (myinput.length > 0) {
						myinput.val(value);
						$.fn.ajaxfunc.myform.submit();
					} else {
						myinput = $('<input type="hidden" name="' + name + '" value="' + (value ? value : '0') + '" />');
						$.fn.ajaxfunc.myform.append(myinput);
						$.fn.ajaxfunc.myform.submit();
					}
				} else {
					$.fn.ajaxfunc.myform.submit();
				}
			});
		},
		/**
		 * inputAjaxSubmitOn : submit form asynchroneously and optionaly insert an input name and value in request before submit [can be used with the same functions as ajaxSubmit to parameter the behaviour on reponse]
		 * [event] (optional) event to bind on submit, default = click 
		 * [name] (optional) name of the input inserted into the form before submit (if not specified, input not inserted into request)
		 * [value] (optional) value of the input inserted into the form before submit (if not specified, take the input value)
		 * can be used with the following function to parameter the behaviour on response :  
		 * 		closeDialogOnResponse : close the wrapping dialog box when response is matches the specified response
		 * 			[response] (optional) if set, closes the wrapping dialog when response matches, if not set, closes the wrapping dialog when response is empty
		 * 		displayResultOnDialog : display the result on dialog if the result is not empty
		 * 		updateWithResult : update with the result the selector. Note : the result is evaluated
		 * 			[selector] the selector of the tag to update
		 * 		updateFormWithResult : update form with result 
		 * 		redirectOnEmptyResponse : redirect with the specified url when the response is empty
		 * 		 	[url] (optional) the url to redirect with, if not set, it reloads the current page
		 * 		redirectOnResponse : redirect with the specified url if the response match the specified response
		 * 		 	[response] the response to test
		 * 		 	[url] (optional) the url to redirect with, if not set, it reloads the current page   
		 * 		dismissOnError : prevent submit when any field in form is in error
		 * 		 	[Boolean] default = false
		 * 		toggleWaitClass : add the specified class to the specified selector before submit, and remove it after submit
		 * 		 	[selector] the selector to add a class
		 * 		 	[class] the class to toggle
		 * 		toggleStateClass : add the specified class to the specified selector on specific states of the ajax submission
		 * 		  [selector] the selector to add a class
		 * 		  [classOnSubmit] the class to add to the selector during ajax submit, removed after submit
		 * 		  [classOnSuccess] (optional) the class to add to the selector on ajax submit
		 * 		  [classOnFailure] (optional) the class to add to the selector on ajax failure      
		 * 		resetForm
		 * 		  [boolean] default=false, reset form after submit
		 * 		triggerOnSuccess : trigger an event on a specified selector on server response
		 * 		  [event] the event to trigger (click)
		 * 		  [selector] the selector to trigger
		 * 		data : add a pair of name/value to the submission
		 * 		  [name] the name of the input
		 * 		  [value] the value of the input  
		 *		transparent : this disables the overlay opacity of blockui
		 * apply on : all clickable element inside a form  
		 */
		inputAjaxSubmitOn: function (event, name, value) {
			var functionToCall = function (event) {
				if (event.isPropagationStopped()) return;
				
				var Options = $(this).ClassArgs();
				Options = $.extend({
					forceSync: true
				}, $.fn.ajaxfunc, Options);

				$.fn.ajaxfunc.myform = null;
				$.fn.ajaxfunc.myform = $(this).parents('form:eq(0)');
				
				if ($.fn.ajaxfunc.myform.length == 0) return;

				while (Options.inputData.length > 0) {
					var additionalName = Options.inputData.shift();
					var additionalValue = Options.inputData.shift();
					var myinput = $.fn.ajaxfunc.myform.find(':input[name=' + additionalName + ']');
					myinput = $('<input type="hidden" name="' + additionalName + '" class="toDeleteAfterSubmit" value="' + additionalValue + '" />');
					$.fn.ajaxfunc.myform.append(myinput);
				}

				if (name) {
					var myinput = $.fn.ajaxfunc.myform.find(':input[name=' + name + ']');
					if (myinput.length > 0) {
						myinput.val(value ? value : myinput.htmlVal());
						$.fn.ajaxfunc.myform.ajaxSubmit(Options);

					} else {
						myinput = $('<input type="hidden" name="' + name + '" class="toDeleteAfterSubmit" value="' + (value ? value : '0') + '" />');
						$.fn.ajaxfunc.myform.append(myinput);
						$.fn.ajaxfunc.myform.ajaxSubmit(Options);
					}
				} else {
					$.fn.ajaxfunc.myform.ajaxSubmit(Options);
				}
				$('.toDeleteAfterSubmit').remove();
			};
			
			$(this).bind(event ? event : 'click', functionToCall);
		},
		/**
		 * ajaxUpdateFormOnChange : automatically update form with ajax when the field changes  
		 * this is ghost function, this function is removed server side and replaced server side by the following statement combination :
		 * inputAjaxSubmitOn(theGoodEvent,UpdateForm) updateFormWithResult
		 * apply on : all fields  
		 */
		ajaxUpdateFormOnChange: function () {},
		/**
		 * disabledForm : DEPRECATED disable field (use this for maximum compatibility)
		 * apply on : input 
		 */
		disabledForm: function () {
			$(this).disableForm();
		},
		/**
		 * enabledForm : DEPRECATED enable field (use this for maximum compatibility)
		 * apply on : input 
		 */
		enabledForm: function () {
			$(this).enableForm();
		}
	});

})(jQuery);