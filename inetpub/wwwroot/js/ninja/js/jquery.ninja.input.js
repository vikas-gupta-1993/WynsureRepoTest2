/*!
 * Wyde Ninja Display Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
 
function toDate(str, format) {
	var format2 = /^(\d{1,2}\/){2}\d{2,4}$/;
	if(!format2.test(str)){
		return false;
	}
	var dateArray = str.split('/');
	switch(format || $.lang.DateFormat) {
		case 'dd/mm/yyyy':
			dateArray[1] -=1;
			var day = dateArray[0];
			var month = dateArray[1];
			var year = dateArray[2];
			break;
		case 'mm/dd/yyyy':
		default:
			dateArray[0] -=1;
			var day = dateArray[1];
			var month = dateArray[0];
			var year = dateArray[2];
			break;
	}
	var dateObj = new Date(year, month, day, 0, 0, 0, 0);
	return dateObj
}

function getInputLabel(input) {
	if (input && $(input).is(':input')) {
		var helpWrappers = $(input).parents('.help-wrapper');
		if (helpWrappers.length > 0) {
			var controlLabel = $(helpWrappers).first().find('.control-label');
			if (controlLabel && controlLabel[0] && controlLabel[0].innerText) {
				return controlLabel[0].innerText.split('*')[0];
			}
		}
	}
	return null;
}
 
(function ($) {

	/****************************
	 *** jQuery extend functions
	 ****************************/
	oldVal = jQuery.fn.val;
	jQuery.fn.extend({
		val: function () {
			var obj = $(this);
			if (obj.hasClass('ninjaCheckbox')) {
				return $.fn.val.apply($('input', obj), arguments);
			} else {
				return oldVal.apply(this, arguments);
			}
		},
		toggleCheck: function () {
			return this.each(function () {
				var obj = $(this);
				var input = $('input', obj);
				if (!obj.hasClass('disabled')) {
					if (!obj.is(':checked')) {
						obj.removeClass('unchecked').addClass('checked');
						input.val('true');
					} else {
						obj.removeClass('checked').addClass('unchecked');
						input.val('false');
					}
				}
			});
		},
		check: function () {
			return this.each(function () {
				if (!$(this).is(':checked')) {
					$(this).toggleCheck();
				}
			});
		},

		unCheck: function () {
			return this.each(function () {
				if ($(this).is(':checked')) {
					$(this).toggleCheck();
				}
			});
		},

		disable: function () {
			return this.each(function () {
				if ($(this).hasClass('ninjaCheckbox')) {
					$(this).addClass('disabled');
				} else if ($(this).is(':input')) {
					$(this).attr('disabled', 'disabled');
				}
			});
		},

		enable: function () {
			return this.each(function () {
				if ($(this).hasClass('ninjaCheckbox')) {
					$(this).removeClass('disabled');
				} else if ($(this).is(':input')) {
					$(this).removeAttr('disabled');
				}
			});
		}
	});
	/**************************
	 * jQuery extend selectors 
	 **************************/
	/**
	 * :checked selector for ninja checkbox
	 */
	oldChecked = $.expr[':'].checked;
	$.expr[':'].checked = function (obj, index, meta, stack) {
		if ($(obj).hasClass('ninjaCheckbox')) {
			return $(obj).hasClass('checked');
		} else {
			return oldChecked(obj, index, meta, stack);
		}
	};
	/**
	 * :checkbox selector for ninja checkbox
	 */
	oldCheckbox = $.expr[':'].checkbox;
	$.expr[':'].checkbox = function (obj, index, meta, stack) {
		return oldCheckbox(obj, index, meta, stack) ? true : $(obj).hasClass('ninjaCheckbox');
	};
	/**
	 * :isClassDisabled selector for ninja checkbox
	 */
	$.expr[':'].isClassDisabled = function (obj, index, meta, stack) {
		return $(obj).hasClass('btn') || $(obj).hasClass('ninjaCheckbox');
	};
	/**
	 * :disabled selector for ninja checkbox
	 */
	oldDisabled = $.expr[':'].disabled;
	$.expr[':'].disabled = function (obj, index, meta, stack) {
		if ($(obj).is(':isClassDisabled')) {
			return $(obj).hasClass('disabled');
		} else {
			return oldDisabled(obj, index, meta, stack);
		}
	};
	/**
	 * :enabled selector for ninja checkbox
	 */
	oldEnabled = $.expr[':'].enabled;
	$.expr[':'].enabled = function (obj, index, meta, stack) {
		return !$.expr[':'].disabled(obj, index, meta, stack);
	};
	/**
	 * :input selector for ninja checkbox
	 */
	oldInput = $.expr[':'].input;
	$.expr[':'].input = function (obj, index, meta, stack) {
		return oldInput(obj, index, meta, stack) ? true : $(obj).hasClass('ninjaCheckbox');
	};
	/**
	 * :available
	 * return true if the field is available to the end user	 
	 */
	$.expr[':'].available = function (obj, index, meta, stack) {
		var Visible = $(obj).is(':visible');
		var Disabled = $(obj).attr('disabled') == 'disabled' || $(obj).hasClass('disabled');
		//var InError = $(obj).hasClass($(obj).ClassError);
		return Visible && !Disabled;// && !InError;
	};
	/**
	 * :inError
	 * return true if the field is in error	 
	 */
	$.expr[':'].inError = function (obj, index, meta, stack) {
		return $(obj).hasClass($(obj).ClassError);
	};
	
	/**
	 * :passwordLongEnough
	 * return true if the field contains a valid date 
	 */
	$.expr[':'].passwordLongEnough = function (obj, index, meta, stack) {
		var notsure = $(obj).val();
		return notsure.length >= 6;
	};
	/**
	 * :passwordDoesNotHasUppercaseLetter
	 * return true if the field contains a valid date 
	 */
	$.expr[':'].passwordDoesNotHasUppercaseLetter = function (obj, index, meta, stack) {
	var notsure = $(obj).val();
	var format = /[A-Z]/;
	if(!format.test(notsure)){
		return false;
	}
	else return true;
	};	
	/**
	 * :passwordDoesNotHasLowercaseLetter
	 * return true if the field contains a valid date 
	 */
	$.expr[':'].passwordDoesNotHasLowercaseLetter = function (obj, index, meta, stack) {
	var notsure = $(obj).val();
	var format = /[a-z]/;
	if(!format.test(notsure)){
		return false;
	}
	else return true;
	};	
	/**
	 * :passwordDoesNotHasNumber
	 * return true if the field contains a valid date 
	 */
	$.expr[':'].passwordDoesNotHasNumber = function (obj, index, meta, stack) {
	var notsure = $(obj).val();
	var format = /[0-9]/;
	if(!format.test(notsure)){
		return false;
	}
	else return true;
	};			
	/**
	 * :validDate
	 * return true if the field contains a valid date 
	 */
	$.expr[':'].validDate = function (obj, index, meta, stack) {
		var notsure = $(obj).val();
		var numChars = notsure.length;
		var format = /^(\d{1,2}\/){2}\d{2,4}$/;
		if(!format.test(notsure)){
			return false;
		}					
		var dateArray = notsure.split('/');
		switch($.lang.DateFormat) {
			case 'dd/mm/yyyy':
				dateArray[1] -=1;
				var day = dateArray[0];
				var month = dateArray[1];
				var year = dateArray[2];
				break;
			case 'mm/dd/yyyy':
			default:
				dateArray[0] -=1;
				var day = dateArray[1];
				var month = dateArray[0];
				var year = dateArray[2];
				break;
			}
		var dateObj = new Date(year, month, day, 0, 0, 0, 0);
		if (dateObj === false) {
			return false
		}
		var wynsureWFDateLimit = new Date(1800, 0, 1, 0, 0, 0, 0) // 01/01/1800 
		if (dateObj < wynsureWFDateLimit) {
			return false
		}
		if(dateObj.getFullYear()!=year || dateObj.getMonth()!=month || dateObj.getDate()!=day){
			return false;
		} else {
			return true;
		}
	};
	/**
	 * :emptyControl
	 * return true if the field is empty	 
	 */
	$.expr[':'].emptyControl = function (obj, index, meta, stack) {
		switch($(obj).attr('type')) {
			case 'radio':
				var checked = $(obj).parents('form').find('*[name="'+$(obj).attr('name')+'"]:checked');
				var result = checked.length == 0 || checked.val() == '';
				return result;
			case 'date':	
				var val = $(obj).val();
				var result = val == '' || val == '--/--/----';
				return result;
			default:
				var result = $(obj).val() == '';
				return result;
		}
	};
	/**
	 * :selected
	 */
	$.expr[':'].selected = function (obj, index, meta, stack) {
		if (obj.selected) return true;
		var selected = $(obj).attr('selected');
		return selected == 'selected';
	};
	/**
	 * :prev
	 */
	$.expr[':'].prev = function (obj, index, meta, stack) {
		var me = $(this);
		return $(this).prev().filter($(obj)).length > 0;
	};
	/******************
	 * ninja functions
	 ******************/
	$.extend($.fn.classfunc, {
		/**
		 * ninjaCheckbox : manage ninja checkbox
		 * can be used with the following function to parameter the behaviour :  
		 * 		propagateOn : check specified checkboxes as the current one. 
		 *					  If none of the specified cheboxes checked, the current one is automatically unchecked.
		 *					  If one of the specified cheboxes checked, the current one is automatically checked.
		 * 			[selector] the selector used for checkboxes to update
		 */
		ninjaCheckbox: function () {
			var checkbox = $(this);
			var id = checkbox.attr('id');
			var input = checkbox.find('input');
			if (!checkbox.is(':disabled')) {
				input.val(checkbox.is(':checked'));
			}
			//get option used for checkbox in classArgs
			var Options = $(this).ClassArgs();
			if (Options['propagateOn'] != null) {
				var CheckBoxes = $(Options['propagateOn']);
				//bind a function to modify children status on Father click
				$(this).bind('click', {
					Children: CheckBoxes
				}, function (event, IsPropagate) {
					if (IsPropagate == undefined || IsPropagate == false) {
						var Children = $(event.data.Children);
						if ($(this).is(':checked')) {
							Children.filter(':disabled').trigger('click', true);
						} else {
							Children.filter('not(:disabled)').trigger('click', true);
						}
					}
				});
				//for each check box link to father
				for (var i = 0; i < CheckBoxes.length; i++) {
					//bind a function to modify father status on child click
					$(CheckBoxes[i]).bind('click', {
						Father: this,
						Children: CheckBoxes
					}, function (event, IsPropagate) {
						if (IsPropagate == undefined || IsPropagate == false) {
							//when child clicked
							var FatherAsToBeChecked = false;
							//for each child linked to father
							var CheckBoxes = event.data.Children;
							//verify if a check box is checked among children
							for (var i = 0; i < CheckBoxes.length; i++) {
								if (CheckBoxes[i] !== $(this)[0]) {
									if ($(CheckBoxes[i]).is(':checked')) {
										FatherAsToBeChecked = true;
										break;
									}
								} else {
									if (!$(this).is(':checked')) {
										FatherAsToBeChecked = true;
										break;
									}
								}
							}
							var f = $(event.data.Father);
							//if there is one check box checked, the father must be check to
							if ((FatherAsToBeChecked && !f.is(':checked')) || (!FatherAsToBeChecked && f.is(':checked'))) f.trigger('click', true);
						}
					});
				}
			}
			$(this).click(function (e) {
				e.preventDefault();
				$(this).toggleCheck();
			});
		},
		/**
		 * toggleCheckOn : toggle a ninja checkbox on a specific event
		 * apply on : all 
		 * [event] the specific event to toggle ninja checkbox on
		 * [selector] the ninja checkbox selector
		 * [value] (optional) if set, only apply the toggle when the current input value reach the specified value   
		 */
		toggleCheckOn: function (event, selector, value) {
			$(this).bind(event, function () {
				if (value == undefined) {
					$(selector).toggleCheck();
				} else {
					if ($(this).htmlVal() == value) {
						$(selector).toggleCheck();
					}
				}
			});
		},
		/**
		 * CheckOn : check a ninja checkbox on a specific event
		 * apply on : all 
		 * [event] the specific event to check ninja checkbox on
		 * [selector] the ninja checkbox selector
		 * [value] (optional) if set, only apply the check when the current input value reach the specified value   
		 */
		checkOn: function (event, selector, value) {
			$(this).bind(event, function () {
				if (value == undefined) {
					$(selector).check();
				} else {
					var myVal = $(this).htmlVal();
					if (myVal == value) {
						$(selector).check();
					}
				}
			});
		},
		/**
		 * unCheckOn : uncheck a ninja checkbox on a specific event
		 * apply on : all 
		 * [event] the specific event to uncheck ninja checkbox on
		 * [selector] the ninja checkbox selector
		 * [value] (optional) if set, only apply the uncheck when the current input value reach the specified value   
		 */
		unCheckOn: function (event, selector, value) {
			$(this).bind(event, function () {
				if (value == undefined) {
					$(selector).unCheck();
				} else {
					var myVal = $(this).htmlVal();
					if (myVal == value) {
						$(selector).unCheck();
					}
				}
			});
		},
		/**
		 * disableOn : disable an input on a specific event
		 * apply on : all 
		 * [event] the specific event to disable the input on
		 * [selector] the input selector
		 */
		disableOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).disable();
			});
		},
		/**
		 * enableOn : enable an input on a specific event
		 * apply on : all 
		 * [event] the specific event to enable the input on
		 * [selector] the input selector 
		 */
		enableOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).enable();
			});
		},
		/**
		 * lt : Less Than : compare argument with the object value
		 * apply on : input 
		 * [value] the value to compare
		 * ex : <input type="text" class="lt(15)" /> 
		 */
		lt: function (value) {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().toFloat() < value) return;
				$(this).toggleError($($.lang.mlValueShouldBeLessThan).translate(value));
			});
		},
		/**
		 * le : Less or Equal : compare argument with the object value
		 * apply on : input 
		 * [value] the value to compare
		 */
		le: function (value) {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().toFloat() <= value) return;
				$(this).toggleError($($.lang.mlValueShouldBeLessThanOrEqual).translate(value));
			});
		},
		/**
		 * gt : Greater Than : compare argument with the object value
		 * apply on : input 
		 * [value] the value to compare
		 */
		gt: function (value) {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().toFloat() > value) return;
				$(this).toggleError($($.lang.mlValueShouldBeGreaterThan).translate(value));
			});
		},
		/**
		 * ge : Greater or Equal : compare argument with the object value
		 * apply on : input 
		 * [value] the value to compare
		 */
		ge: function (value) {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).autoNumeric('get').toFloat() >= value) return;
				$(this).toggleError($($.lang.mlValueGreaterThanOrEqual).translate(value));
			});
		},
		/**
		 * ne : Not Equal : compare argument with the object value
		 * apply on : input 
		 * [value] the value to compare (no comma allowed!)
		 */
		ne: function (value) {
			if ($(this).is('select')) {
				$(this).find('option[value="' + value + '"]').remove();
			} else {
				$(this).bind('blur', function () {
					if ($(this).is(':not(:available),:inError,:emptyControl')) return;
					if ($(this).val() != value) return;
					$(this).toggleError($($.lang.mlValueIsForbidden).translate(value));
				});
			}
		},
		/**
		 * num : is a numeric number positive/negative, float/integer
		 * apply on : input 
		 */
		num: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[-]?[0-9]*[\.,]?[0-9]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeNumeric).translate());

			});
		},
		/**
		 * integer : is integer positive or negative
		 * apply on : input 
		 */
		integer: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[-]?[0-9]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeInteger).translate());
			});
		},
		/**
		 * alphanum : is digits or alpha (without accent)
		 * apply on : input 
		 */
		alphanum: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[a-zA-Z0-9 ]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeAlphaNumeric).translate());
			});
		},
		/**
		 * alphanumAccent : is digits or alpha (with accent)
		 * apply on : input 
		 */
		alphanumAccent: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[a-zA-Z0-9ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàâáéãåæçèéêëìíîïñòóôõöùúûüÿ ]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeAphaNumericAccent).translate());
			});
		},
		/**
		 * alpha : is alpha (without accent)
		 * apply on : input 
		 */
		alpha: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[a-zA-Z ]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeAlphabetic).translate());
			});
		},
		/**
		 * alphaAccent : is alpha (with accent)
		 * apply on : input 
		 */
		alphaAccent: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàâáéãåæçèéêëìíîïñòóôõöùúûüÿ ]+$")) return;
				$(this).toggleError($($.lang.mlFormatShouldBeAlphabeticAccent).translate());
			});
		},
		/**
		 * minLength : specify input min char number
		 * [value] the min length
		 * apply on : input
		 */
		minLength: function (value) {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().length < value) {
					$(this).toggleError($($.lang.mlYouMustFillWithAtLeastChars).translate(value));
				}
			});
		},
		/**
		 * maxLength : specify input max char number
		 * [value] the max length
		 * apply on : input
		 */
		maxLength: function (value) {
			$(this).attr('maxlength', value);
		},
		/**
		 * disabled : specify if input should be disabled
		 * [bool] if set to true or not set, disable the input, else if set to false, enable the field 
		 * apply on : input 
		 */
		disabled: function (bool) {
			if (bool || bool == undefined) {
				$(this).disable();
			} else {
				$(this).enable();
			}
		},
		/**
		 * email : is an email format
		 * apply on : input 
		 */
		email: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match(/^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$/i)) return;
				$(this).toggleError($($.lang.mlValueIsNotMail).translate());
			});
		},
		/**
		 * nodigit : has no digit
		 * apply on : input 
		 */
		nodigit: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[^0-9]+$")) return;
				$(this).toggleError($($.lang.mlValueShouldNotContainDigit).translate());
			});
		},
		/**
		 * required : let the user know when he miss a field
		 * apply on : input 
		 */
		required: function () {
			if ($(this).is(':input')) {
				$(this).parents('*[class*="form-group"]:eq(0)').find('label[class*="control-label"]:eq(0)').each(function () {
					if (!$(this).hasClass('requireDisplayed')) {
						$(this).addClass('requireDisplayed');
						$(this).append(' *');
					}
				})
				$(this).blur(function () {
					if ($(this).is(':not(:available),:inError,:not(:emptyControl)')) return;
					var inputLabel = getInputLabel($(this)[0]);
					if (inputLabel) {
						$(this).toggleError(inputLabel + $($.lang.mlIsRequired).translate($(this).val()));
					} else {
						$(this).toggleError($($.lang.mlFieldIsRequired).translate($(this).val()));
					}
				});
			}
		},
		/**
		 * checkPassword : check if password is valid
		 * apply on : input 
		 */
		checkPassword: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				// remove the ok icon
				$(".password-ok").remove();
				if (!$(this).is(':passwordLongEnough')){
					$(this).toggleError($($.lang.mlPasswordNotLongEnough).translate());
				} else if (!$(this).is(':passwordDoesNotHasUppercaseLetter')){
					$(this).toggleError($($.lang.mlPasswordDoesNotHasUppercaseLetter).translate());
				} else if (!$(this).is(':passwordDoesNotHasLowercaseLetter')){
					$(this).toggleError($($.lang.mlPasswordDoesNotHasLowercaseLetter).translate());
				} else if (!$(this).is(':passwordDoesNotHasNumber')){
					$(this).toggleError($($.lang.mlPasswordDoesNotHasNumber).translate());
				} else {
				//append the ok icon
					$('<span class="icon-ok password-ok"></span>').appendTo($(this).parent());
				}
			});
		},			
		/**
		 * fraction : check if input entry is fraction
		 * apply on : input 
		 */
		fraction: function () {
			$(this).bind('blur', function () {
				if ($(this).is(':not(:available),:inError,:emptyControl')) return;
				if ($(this).val().match("^[0-9]+(\/[0-9]+)?$")) return;
				$(this).toggleError($($.lang.mlValueShouldBeAFraction).translate());
			});
		},
		/**
		 * password : transform an text input in password input
		 * apply on : input 
		 */
		password: function () {
			var NewInput = $(this).clone();
			NewInput.attr('type', 'password').removeClass('password').EvalClass();
			$(this).hide().parent().append(NewInput);
			$(this).remove();
		},

		/**
		 * ninjaDatePicker : add a date picker to structure
		 * apply on : input
		 */
		ninjaDatePicker: function () {
			var Options = $(this).ClassArgs();
			//bootstrap-datepicker.js is modified to support french words (line 774)
			var language = $.lang.LanguageCode.toLowerCase();
			var Default = {
				language: language,
				format: $.lang.DateFormat.toLowerCase(),
				autoclose: true
			}
			Options = $.extend(Default, Options);
			$(this).datepicker(Options);
		},
		/**
		 *
		 *
		 */
		select2: function() {
			$(this).select2({
				theme: "bootstrap",
				width: '100%'
			});
		},
		/**
		 * multiselect : add a multiselect look and feel to input[type=radio] and select
		 * for more info : http://davidstutz.github.io/bootstrap-multiselect/
		 * apply to : input[type=radio] and select 
		 */
		multiselect: function () {
			var Options = $(this).ClassArgs();
			var Default = {
				 buttonText : function(options, select) {
								var caret = '<span class="caretSpace"><!--[if IE]><b class="caret"></b><![endif]--></span>';
								if (options.length == 0) {
									return '<span class="labelSelect" style="vertical-align: super;"></span>'+caret;
								}
								else
								if (options.length > 3) {
									return '<span class="labelSelect" style="vertical-align: super;">' + options.length + ' ' + $($.lang.mlSelected).translate() + '</span>'+caret;
								}
								else {
									var selected = '<span class="labelSelect" style="vertical-align: super;">';
									options.each(function() {
										var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).text();

										selected += label + ', ';
									});
									return selected.substr(0, selected.length - 2) + '</span>'+caret;
								}
					}
			};
			Options = $.extend(Default, Options);
			$(this).multiselect(Options);
		},
		/**
		 * dtColumnFilter: 	Update the form input with a single name/value pair for selected options.
		 * 		           	the value respect the format defined for dataTable columnDefs 
		 *					See documentation in js/dataTable/ folder
		 * apply to : select
		 */
		dtColumnFilter: function(tableId, serverVariableName) {
			var functionToCall = function () {
				var myForm = $(this).parents('form:eq(0)');
				var dtTable = $(tableId).dataTable();
				
				if (dtTable) {
					var columnDefs = {aoColumnDefs:[{bVisible:false,aTargets:[]}]};
					// update columns visibility
					$(this).children().each(function (i) {
						dtTable.fnSetColumnVis(i, this.selected);
						if (!this.selected) {
							columnDefs.aoColumnDefs[0].aTargets.push(i);
						}
					})
					
					// update form input value
					var selectInput = myForm.find(':input[name=' + serverVariableName + ']');
					if (selectInput.length > 0) {
						selectInput.val(JSON.stringify(columnDefs));
					} else {
						selectInput = $('<input type="hidden" name="' + serverVariableName + '" class="toDeleteAfterSubmit" value="" />');
						selectInput.val(JSON.stringify(columnDefs));
						myForm.append(selectInput);
					}
				}
			};
			$(this).bind('change', functionToCall);			
		},
		/**
		 * isDate : control if the field is filled with a valid date
		 * apply on : input 
		 */
		isDate: function () {
			if ($(this).val() == '--/--/----') {
				$(this).val('');
			}
			$(this).bind('changeDate', function (e) {
				if ($(this).is(':not(:available),:inError,:emptyControl')) {
					e.stopPropagation();
					return;
				}
				if (!$(this).is(':validDate')) {
					e.stopPropagation();
				}
			});
			/**
			 * 					|WBO-559|
			* AutoSlash feature to add slashes automatically after day(first 2 chars) 
			*	and month(5 chars including slash). 
			* Keycodes 8 and 46 to allow backspace and delete buttons.
			*/
			$(this).bind('keyup', 'keydown', function(e) {
				if (e.which !== 8 && e.which !== 46) {
					var numChars = $(this).val().length;
					if (numChars === 2 || numChars === 5) {
						var thisVal = $(this).val();
						thisVal += '/';
						$(this).val(thisVal);
					}
				}
			});
			$(this).bind('blur', function (e) {
				if ($(this).is(':not(:available),:inError,:emptyControl')) {
					e.stopPropagation();
					return;
				}
				/**			|WBO-559|
				* AutoComplete feature to accept YY format.
				* Logic: 
				*	US typed	US Interpreted	
				    MMDDYY	    	 if YY < 30 --> MM/DD/20YY					 
									if YY >= 30 --> MM/DD/19YY	
					FRtyped		FR Interpreted	
					DDMMYY			if YY < 30 --> DD/MM/20YY 
									if YY >= 30 -->DD/MM/19YY
				*NOTE: "Blur" event is used instead of "changeDate" since the event 
				*	is fired too quick before the date is entered completely.
				*/
				var dateVal = $(this).val().split('/');
				var yearVal = parseInt(dateVal[2]);
				if(yearVal < 30){
					yearVal = 2000 + yearVal;
				} else if (yearVal >= 30 && yearVal < 100){
					yearVal = 1900 + yearVal;
				}
				//After splitting the yearfrom date and converting it to YYYY,
				//Check for Portal type and switch date array format while 
				//using "setDate".
				switch($.lang.DateFormat) {
					case 'dd/mm/yyyy':
					$(this).datepicker("setDate",new Date(yearVal,parseInt(dateVal[1])-1,parseInt(dateVal[0])));
					break;
					case 'mm/dd/yyyy':
					default:
							$(this).datepicker("setDate",new Date(yearVal,parseInt(dateVal[0])-1,parseInt(dateVal[1])));
							break;
						}
				if (!$(this).is(':validDate')) {
					$(this).toggleError($($.lang.mlNotValidDate).translate($.lang.DateFormat));
					e.stopPropagation();
				}
			});
		},
		/**
		 * dateGt : add a constraint to input date to prevent ajax submit
		 * [date] the min date (dd/mm/yyyy)
		 * apply on : input
		 */
		dateGt: function(date) {
			$(this).bind('changeDate', function (e) {
				var dateInput = toDate($(this).val())
				if (dateInput === false) {
					e.stopPropagation();
					return
				}
				var dateRequested = toDate(date,'dd/mm/yyyy')
				if (dateInput < dateRequested) {
					$(this).toggleError($($.lang.mlDateShouldBeGreaterThan).translate(date));
					e.stopPropagation();
				}
			})
		},
		/**
		 * isCountry : fill the field with all countries, more documentation on http://vincentlamanna.com/BootstrapFormHelpers/country.html
		 * requires : http://vincentlamanna.com/BootstrapFormHelpers
		 * apply on : input / select
		 */
		isCountry: function () {
			var Options = $(this).ClassArgs();
			var Default = {};
			Options = $.extend(Default, Options);
			$(this).bfhcountries(Options);
		},
		/**
		 *  autoComplete : allow  you to build an autoCompleted field input.
		 *  [SourceUrl] the url where to find data. Three parameters are given to the url :
		 *    autoComplete : the name of the input
		 *    autoCompleteValue : the characters typed by the user
		 *    autoCompleteType : the optional parameter set 
		 *  the url must return a JSON array containing the autocomplete fields displayed to the user. ex : ['toto','tata','titi']
		 *  [Name] (optional) if set, autoCompleteName is set with Name, else, autoCompleteName is set with the name of the input
		 *  [Type] (optional) if set, autoCompleteType is set with Type, else, autoCompleteType is not set
		 *  apply on : input
		 */
		autoComplete: function (SourceUrl, Name, Type) {
			var Options = $(this).ClassArgs();
			var TagName = Name ? Name : $(this).attr('name');
			var Default = {
				source: function (query, process) {
					return $.getJSON(
					SourceUrl, {
						AutoComplete: TagName,
						autoCompleteValue: encodeURIComponent(query),
						autoCompleteType: Type
					}, function (data) {
						return process(data);
					});
				}
			};
			Options = $.extend(Default, Options);
			$(this).typeahead(Options);
		},
		/**
		 * inputButtonSet : provide dynamic input hidden through button group
		 */
		inputButtonSet: function () {
			var input = $(this).parent().find('input').first();
			var group = $(this);
			$(this).find('*[class*="btn"]').click(function () {
				var value = $(this).attr('data-value');
				input.attr('value', value);
				group.find('.active').removeClass('active');
				$(this).addClass('active');
			});
		},
		/**
		 * inputTab : provide dynamic input hidden through tab
		 */
		inputTab: function () {
			var input = $(this).parent().find('input.inputTabField');
			var tab = $(this);
			$(this).find('li>a').click(function () {
				var value = $(this).attr('data-value');
				input.attr('value', value);
				tab.find('.active').removeClass('active');
				$(this).parent().addClass('active');
			});
		},
		/*
		 * Load currencies to options
		 */
		loadCurrencies: function () {
			var Opt = {
				currency: $(this).attr('data-currency'),
				currencyList: $(this).attr('data-currencyList')
			};
			$(this).bfhcurrencies(Opt);
		},
		
		 /**
		 * currency : formatting amount with currency using blur (on lose focus event)
		 * include Currency/jquery.formatCurrency-1.4.0.min.js
		 * SymbolMustBeRemoved : True if the symbole used as currency must be removed from the string result
		 */
		currency: function(Symbol,SymbolMustBeRemoved) { 
		   var format;
		   
		   switch ( Symbol ) {
				case '$':
					format = {regions:'en-US'};
					break;
				case '€':
					if ( $.lang.LanguageCode = 'En' )
						format = {regions:'us-FR'};
						else
						format = {regions:'fr-FR'};
					break;
			};
			if (SymbolMustBeRemoved != undefined && SymbolMustBeRemoved == true)
				format['symbol'] = '';
			$(this).formatCurrency(format);		
			$(this).blur(function(event)
			{
				$(this).formatCurrency(format);
			});
		},
		/**
		 * numericMask : apply a numeric pattern to input text fields http://www.decorplanit.com/plugin/
		 */
		numericMask: function() {
			if ($(this).is('input[type=text]')) {
				$.fn.classfunc.includeJs('js/autoNumeric/autoNumeric.js');
				$(this).autoNumeric('init', $.lang.getNumberFormat());
				$(this).on('beforeSubmit', function(event, form) {
					$(this).val($(this).autoNumeric('get'));
					$(this).attr('value',$(this).autoNumeric('get'));
				});
			}
		},
		 /**
		 * removecurrency : formatting amount with currency using blur (on lose focus event)
		 * include Currency/jquery.formatCurrency-1.4.0.min.js
		 * tu use with currency() function
		 */
		removecurrency: function(Symbol,SymbolMustBeRemoved) {
		   var format;
		   var input = $(this);
		   switch ( Symbol ) {
				case '$':
					format = {regions:'en-US'};
					break;
				case '€':
					if ( $.lang.LanguageCode = 'En' )
						format = {regions:'us-FR'};
						else
						format = {regions:'fr-FR'};
					break;
			};
			if (SymbolMustBeRemoved != undefined && SymbolMustBeRemoved == true)
				format['symbol'] = '';
		   var fn = function() {
				input.val(input.asNumber(format));
				input.attr('value',input.asNumber(format));
				return true;
			};
			fn();
			input.focus(fn);
			input.blur(fn);
			input.parents('form:eq(0)').submit(fn);
		},
		/**
		 * SimpleWysiwyg : add a rich text editor
		 * apply on : textarea
		 */
		SimpleWysiwyg: function () {
			var Options = $(this).ClassArgs();
			var Default = {
				script_url: './js/tinymce/tiny_mce.js',
				theme: "advanced",
				plugins: "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,advlist",
				theme_advanced_buttons1: "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,formatselect,fontselect,|,bullist,numlist,|,outdent,indent,blockquote,|,link,unlink",
				theme_advanced_buttons2: "",
				theme_advanced_buttons3: "",
				theme_advanced_toolbar_location: "top",
				theme_advanced_toolbar_align: "left",
				theme_advanced_resizing: true,
				content_css: "css/content.css",
				template_external_list_url: "lists/template_list.js",
				external_link_list_url: "lists/link_list.js",
				external_image_list_url: "lists/image_list.js",
				media_external_list_url: "lists/media_list.js"
			};
			Options = $.extend(Default, Options);
			$(this).tinymce(Options);
		},
		/**
		 * ninjaTimePicker : add a time picker to structure
		 * apply on : input
		 */
		ninjaTimePicker: function () {
			var Options = $(this).ClassArgs();
			var Default = {
				minuteStep: 1,
				showSeconds: true,
				showMeridian: false,
                defaultTime: false
			};
			Options = $.extend(Default, Options);
			$(this).timepicker(Options);
		},
		/**
		 * clean : reset error when field changes. it has to be the first class in all dynamic input
		 * apply on : all clickable element
		 */
		clean: function () {
			$(this).toggleError();
			if ($(this).attr('type') == 'file') {
				$(this).val('')
				//this[0].files.length = 0;
			}
			var args = $(this).ClassArgs();
			var event = args.isDate ? 'changeDate' : 'change'
				
			$(this).bind(event, function (event) {
				if ($(this).attr('type') == 'radio') {
					$(this).parents('form').find('input[name="'+$(this).attr('name')+'"]').toggleError();
				} else {
					$(this).toggleError();
				}
			});
			
		}


	});

})(jQuery);