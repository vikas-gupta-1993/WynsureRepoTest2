/*!
 * Wyde Ninja Display Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {

	function webgl_support() { 
		try{
	    	var canvas = document.createElement( 'canvas' ); 
	    	return !! window.WebGLRenderingContext && ( 
	        canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
	   	}catch( e ) {
	   		return false; 
	   	} 
	};

	$.extend($.fn.classfunc, {
		/**
		 * Translate a date into its moment
         * apply on : div
         */
        moment: function (date,format) {
            $(this).append(moment(date, format).fromNow());
        },
		/**
		 * checkRepeatPassword : check if repeated password is the same as the target password
		 * apply on : input 
		 */
		checkRepeatedPassword: function (selector) {
			var OriginalPasswordSelector = $(selector);
			$(this).bind('blur', function () {
			var OriginalPassword = OriginalPasswordSelector.htmlVal();
			var RepeatedPassword = $(this).htmlVal();
			if (RepeatedPassword != OriginalPassword){
				$(this).toggleError($($.lang.mlPasswordNotConsistent).translate());
			} else {
				//append the ok icon
				$('<span class="icon-ok password-ok"></span>').appendTo($(this).parent());
 			}			
			});
		},	
		/**
		 * ajaxGet : get a content throught ajax, and replace selector content with it. If applied on input, or select, send the value through url (url += name=value).
		 * apply on : input, select
		 * [url] url to request
		 * [selector] selector to update with content received from url
		 * [event] (optional) trigger ajaxGet on a specific event 
		 */
		ajaxGet: function (url, selector, event) {
			var fn = function () {
					var InputVal = $(this).val();
					var InputName = $(this).attr('name');
					var theUrl = url;
					if (InputVal != '' && InputVal != null && InputName != '') {
						theUrl += url.indexOf('?') == -1 ? '?' : '&';
						theUrl += InputName + '=' + InputVal;
					}
					$.ajax({
						url: theUrl,
						success: function (data) {
							var Element = selector ? $(selector).empty() : undefined;
							$(data).appendTo(Element).EvalClass();
						},
						error: function (jqXHR, textStatus, errorThrown) {
							if (Options.toggleWaitClass.length > 1) {
								$(Options.toggleWaitClass[0]).removeClass(Options.toggleWaitClass[1]);
							}
							switch (textStatus) {
							case 'timeout':
								alert('The server is not responding, please try again later');
								break;
							case 'error':
								alert('Unknown error : ' + errorThrown);
								break;
							}
						}
					});
				};
			event ? $(this).bind(event, fn) : fn();
		},

		/**
		 *  add a dynamic google map window to the html tag, centered on the address specified in a sub node having a "address" class.
		 */
		GoogleDynamicMap: function () {
			var container = $('<div class="MapDialog"></div>').appendTo($(this));
			var address = $(this).find('.address').text();
			$(this).bind('click', function (event) {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'address': address
				}, function (results, status) {
					if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
						container.empty();
						var map = new google.maps.Map(container.get(0), {
							zoom: 15,
							center: results[0].geometry.location,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						});
						var marker = new google.maps.Marker({
							map: map,
							position: results[0].geometry.location,
							title: address
						});
						container.dialog({
							position: ['center', 'middle'],
							title: 'Google Map',
							width: 800,
							height: 600,
							modal: true,
							resize: function (event, ui) {
								google.maps.event.trigger(map, 'resize');
							}
						});
						google.maps.event.trigger(map, 'resize');
						map.setCenter(results[0].geometry.location);
					}
				});
			});
		},
		/**
		 * treeView : display tree
		 * apply on : ul
		 */
		treeview: function () {
			var Options = $(this).ClassArgs();
			$(this).treeview(Options);
		},
		/**
		 * dialog : build a dialog box (see documentation on  http://jqueryui.com/demos/dialog/)
		 * 			all boolean options are false by default, unless option name is specified in class (boolean argument not allowed for autoOpen, closeOnEscape, draggable, modal, resizable, stack, bgiframe)
		 * 			the position option needs two arguments (not an array of two strings)  
		 * example : <div class="dialog autoOpen width(100) position('middle','top')" title="hello">hello world !</div>
		 * apply on : all containers (div, span, etc...)
		 */
		dialog: function () {
			var Options = $(this).ClassArgs();
			var Default = {
				buttons: {},
				position: ['center', 'middle']
			};
			Options = $.extend(Default, Options);
			$(this).dialog(Options);
		},
		modal: function () {
			var that = $(this)
			that.on('hidden.bs.modal', function(){
				that[0].reset();
				if (that.hasClass('deleteOnClose')) {
					//delete the modal
					that[0].remove();
				}
			});
		},
		/**
		 * openDialog : open the dialog
		 * [event] (optionnal, default=null) if specified, bind action with event
		 * [selector] (optionnal, default=null) jQuery selector to select the dialog (no comma allowed!)
		 * apply on : all clickable element
		 */
		openDialog: function (event, selector) {
			var fn = function () {
					if (selector) $(selector).modal('show');
					else $(this).parents('.modal').modal('show');
					return false;
				};
			event ? $(this).bind(event, fn) : fn();
		},
		/**
		 * closeDialog : close the dialog
		 * [event] (optionnal, default=null) if specified, bind action with event 
		 * [selector] (optionnal, default=null) jQuery selector to select the dialog (no comma allowed!)
		 * apply on : all clickable element
		 */
		closeDialog: function (event, selector) {
			var fn = function () {
					if (selector) $(selector).modal('hide');
					else $(this).parents('.modal').modal('hide');
					return false;
				};
			event ? $(this).bind(event, fn) : fn();
		},
		/**
		 * disableDialog : disable the dialog
		 * [event] (optionnal, default=null) if specified, bind action with event  
		 * [selector] (optionnal, default=null) jQuery selector to select the dialog (no comma allowed!)
		 * apply on : all clickable element
		 */
		disableDialog: function (event, selector) {
			var fn = function (event) {
					$(selector).dialog('disable');
					return false;
				};
			event ? $(this).bind(event, fn) : fn();
		},
		/**
		 * enableDialog : enable the dialog specified in selector
		 * [event] (optionnal, default=null) if specified, bind action with event   
		 * [selector] (optionnal, default=null) jQuery selector to select the dialog (no comma allowed!)
		 * apply on : all clickable element
		 */
		enableDialog: function (event, selector) {
			var fn = function (event) {
					$(selector).dialog('enable');
					return false;
				};
			event ? $(this).bind(event, fn) : fn();
		},
		/**
		 * toButtonPane : move the button to dialog button pane
		 * apply on : button
		 */
		toButtonPane: function () {
			var buttons = $(this).parents('.dialog').dialog('option', 'buttons');
			var button = $(this);
			button.hide();
			buttons[$(this).htmlVal()] = function () {
				button.click();
			};
			$(this).parents('.dialog').dialog('option', 'buttons', buttons);
		},
		/**
		 * defaultButton : if key "ENTER" is pressed on the form, click on the button
		 * apply on : button
		 */
		defaultButton: function () {
			var form = $(this).parents('form:eq(0)');
			form.unbind('keydown');
			form.keydown(function (event) {
				if (event.keyCode == '13') {
					if (!$(':focus').is('textarea')) {
						form.find('.defaultButton:eq(0)').click();
					}
				}
			});
		},
		/**
		 * noCloseCross : hide close top-right cross in dialog
		 */
		noCloseCross: function () {
			$(this).parents(".ui-dialog:eq(0)").find(".ui-dialog-titlebar-close").hide();
		},
		/**
		 * tabs : display folders, for more info, see doc http://getbootstrap.com/2.3.2/javascript.html#tabs
		 * example :
		 * 		<ul class="nav nav-tabs tabs">
		 * 			<li><a href="#tab1">Hello world !</a></li>
		 * 			<li><a href="#tab2">Hello 2</a></li>
		 * 		</ul>
		 * 		<div id="tab1">Hello world !</div>
		 * 		<div id="tab2">Hello world 2 !</div>
		 * apply on : div 
		 */
		tabs: function () {
			$(this).tab();
		},

		/**
		 * toggleDisableOn : disable or enable an input on an event
		 * [event] when event occurs on input having this class, disable the selected input
		 * [selector] (optional) disable the specified input. If argument is empty, disable the input having this class
		 * apply on : all
		 */
		toggleDisableOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).find(':input').andSelf().each(function (index) {
					if ($(this).is(':disabled')) {
						$(this).enable();
					} else {
						$(this).toggleError().disable();
					}
				});
			});
		},
		/**
		 * disableOn : disable an input on an event
		 * [event] when event occurs on input having this class, disable the selected input
		 * [selector] (optional) disable the specified input. If argument is empty, disable the input having this class
		 * apply on : input
		 */
		disableOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).disable();
			});
		},
		/**
		 * enableOn : enable an input on an event
		 * [event] when event occurs on input having this class, disable the selected input
		 * [selector] (optional) disable the specified input. If argument is empty, disable the input having this class
		 * apply on : input
		 */
		enableOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).enable();
			});
		},
		/**
		 * remove : remove the current node. If a selector is specified, remove the selector and remove the class
		 * [selector] (optional, default = this) jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		remove: function (selector) {
			if (selector) {
				$(this).removeClass("remove(" + selector + ")");
				$(selector).remove();
			} else {
				$(this).remove();
			}
		},
		/**
		 * slider : create sliders, for more informations see doc http://jqueryui.com/demos/slider/
		 * example : <div class="slider range min(0) max(3000) step(50) values(500,2500) sliderLink(#sliderInput1,#sliderInput2) sliderLink(#sliderSpan1,#sliderSpan2)"></div> 
		 * apply on : div
		 */
		slider: function () {
			var Options = $(this).ClassArgs();
			var Default = {
				animate: false
			};
			Options = $.extend(Default, Options);
			$(this).slider(Options);
		},
		/**
		 * sliderLink : link the slider value to an input
		 * [selector1] link the first slider to the input specified by the selector1
		 * [selector1] (optionnal, default=null) usefull only with the range option. Link the first slider to the input specified by the selector1
		 */
		sliderLink: function (selector1, selector2) {
			var Options = $(this).ClassArgs();
			if (selector2 && $(this).hasClass('range')) {
				if (Options.values) {
					$(selector1).htmlVal(Options.values[0]);
					$(selector2).htmlVal(Options.values[1]);
				}
				$(this).bind('slide', function (event, ui) {
					$(selector1).htmlVal(ui.values[0]);
					$(selector2).htmlVal(ui.values[1]);
				});
			} else {
				if (Options.value) $(selector1).htmlVal(Options.value);
				$(this).bind('slide', function (event, ui) {
					$(selector1).htmlVal(ui.value);
				});
			}
		},
		/**
		 * buttonset : create a button set
		 * apply on : any group of links or buttons 
		 */
		buttonset: function () {
			var Options = $(this).ClassArgs();
			$(this).buttonset(Options);
		},
		/**
		 * button : create a button
		 * apply on : any link or button 
		 */
		button: function () {
			var Options = $(this).ClassArgs();
			$(this).button(Options);
		},
		/**
		 * icons : create icons in button, framework icons available here : http://jqueryui.com/themeroller/
		 * [Primary] (optionnal, default=null) set primary icon class (null to unset)
		 * [Secondary] (optionnal, default=null) set secondary icon class (null to unset)
		 * apply on : any link or button with a button class
		 */
		icons: function (Primary, Secondary) {
			$(this).button('option', 'icons', {
				primary: Primary,
				secondary: Secondary
			});
		},
		/**
		 * displayIconOnClick : display icon(s) when clicked, framework icons available here : http://jqueryui.com/themeroller/
		 * [Primary] (optionnal, default=null) set primary icon class (null to remove)
		 * [Secondary] (optionnal, default=null) set secondary icon class (null to remove)
		 * apply on : any link or button with button class 
		 */
		displayIconOnClick: function (Primary, Secondary) {
			$(this).click(function () {
				$(this).button('option', 'icons', {
					primary: Primary,
					secondary: Secondary
				});
			});
		},
		/**
		 * tableRow : apply alternate colors on each row
		 * apply on : table
		 */
		tableRow: function () {
			$(this).find('tbody tr:odd').removeClass('even').addClass('odd');
			$(this).find('tbody tr:even').removeClass('odd').addClass('even');
		},
		/**
		 * redirectOnClick : redirect on url specified when clicked
		 * [url] url to redirect on
		 * apply on : all tags
		 */
		redirectOnClick: function (url) {
			$(this).click(function () {
				$(location).attr('href', url);
			});
		},
		/**
		 * progressbar : display a progress bar
		 * [value] integer from 0 to 100
		 * apply on : div
		 */
		progressbar: function (value) {
			value = value || 0;
			$(this).progressbar({
				value: value
			});
		},
		/**
		 * UpdateOnFinalize : used only in conjuction of ninjaProgressBar: refresh the content specified by selector with the content at specified url
		 * [UrlPercentProgress] url containing the html to update selector
		 * [Selector] the content to update, if not set, dont do anything with url return
		 * apply on : div[class=ninjaProgressBar]
		 */
		UpdateOnFinalize: function (Url, Selector) {},
		/**
		 * triggerOnFinalize : used only in conjuction of ninjaProgressBar: trigger the specified event on the specified selector
		 * [event] the event to trigger
		 * [Selector] the element to be triggered
		 * apply on : div[class=ninjaProgressBar]
		 */
		triggerOnFinalize: function (Url, Selector) {},

		/**
		 * RefreshDelay : used only in conjuction of ninjaProgressBar: progress bar refresh delay in millisecond
		 * [Delay] progress bar refresh delay in millisecond
		 * apply on : div[class=ninjaProgressBar]
		 */
		RefreshDelay: function (Delay) {},
		/**
		 * ninjaProgressBar : display a progress bar
		 * [UrlPercentProgress] url returning an integer (the progress percentage).
		 * [InitialProgress] If initial progress is already at 100, does not launch UpdateOnFinalize
		 * apply on : div
		 */
		ninjaProgressBar: function (UrlPercentProgress, InitialProgress) {
			var Progress = 0;
			var Element = $(this);
			var timer;
			var Options, Default;
			Default = {
				triggerOnFinalize: false,
				UpdateOnFinalize: false,
				RefreshDelay: 1000
			};
			Options = $(this).ClassArgs();
			Options = $.extend(Default, Options);

			timer = $.timer(function () {
				$.ajax({
					url: UrlPercentProgress,
					success: function (data) {
						Progress = data;
						var ProgressForDisplay;
						// For the sake of visual effect, we do not start the bar from 0
						ProgressForDisplay = (Progress > 0 && Progress <= 20 ? 20 : Progress) ;
						// Update the progress bar percentage
						var progressbar = Element.find('.bar');
						var barPercentage = 'width: ' + ProgressForDisplay + '%;';
						if (progressbar.length > 0) {
							progressbar.attr('style', barPercentage );
						}else{
							$('<div class="bar" style="' + barPercentage + '"></div>').appendTo(Element.find('.progress'));
						}
						// Update the status messages for the process
						if ((Progress > 0) && (Progress < 100)) {
							Element.find('.progression_rate').removeClass('hidden');
							Element.find('.task_complete').addClass('hidden'); 
							Element.find('.progression_rate').appendTo(Element.find('.bar'));
						}
						if (Progress >= 100) {
							Element.find('.progression_rate').addClass('hidden');
							Element.find('.task_complete').removeClass('hidden'); 
							Element.find('.task_complete').appendTo(Element.find('.bar'));
							if (Options.UpdateOnFinalize) {
								$.ajax({
									url: Options.UpdateOnFinalize[0],
									success: function (data) {
										$(Options.UpdateOnFinalize[1]).empty().append(data).EvalClass();
									}
								});
							}
							if (Options.triggerOnFinalize !== false) {
								$(Options.triggerOnFinalize[1]).trigger(Options.triggerOnFinalize[0]);
							}
							timer.stop();
						}

					}
				});
			});
			timer.set({
				time: Options.RefreshDelay
			});
			timer.play();
		},
		/**
		 * bindEvent : trigger the current event on the element targetSelector
		 * [event] event to trigger on targetSelector
		 * [targetSelector] the selector of the element to trigger
		 * [targetEvent] (optional, default=event) the event triggered on targetSelector when event is triggered
		 * apply on : all element 
		 */
		bindEvent: function (event, targetSelector, targetEvent) {
			var targetEvent = targetEvent || event;
			$(this).bind(event, function () {
				$(targetSelector).trigger(targetEvent);
			});
		},
		/**
		 * fixedTableHeader : set table header always shown
		 * [HighLightRowClass] (optional) Class to highlight a row on mouse over (default : selected) 
		 * apply on : table 
		 */
		fixedTableHeader: function (HighLightRowClass) {
			var options = {
				highlightrow: true,
				highlightclass: HighLightRowClass ? HighLightRowClass : 'selected'
			};
			$(this).fixedtableheader(options);
		},
		/**
		 * removeOn : remove an element on a event
		 * [event] when event occurs on element having this class, remove the selected element
		 * [selector] (optional) remove the element pointed by the selector. If argument is empty, remove the element having this class
		 * apply on : all clickable element
		 */
		removeOn: function (event, selector) {
			$(this).bind(event, function () {
				if (selector) {
					$(selector).remove();
				} else {
					$(this).remove();
				}
			});
		},
		/**
		 * removeClassOn : remove a class on the given selector. 
		 * [event] when event occurs on element having this class, remove a class from the given selector
		 * [classToRemove] class to remove
		 * [selector] (optional, default = this) jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		removeClassOn: function (event, classToRemove, selector) {
			if (selector) {
				$(this).bind(event, function () {
					$(selector).removeClass(classToRemove);
				});
			} else {
				$(this).bind(event, function () {
					$(this).removeClass(classToRemove);
				});
			}

		},
		/**
		 * addClassOn : add a class on the given selector when event occurs. 
		 * [event] when event occurs on element having this class, add a class from the given selector
		 * [classToRemove] class to add
		 * [selector] (optional, default = this) jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		addClassOn: function (event, classToRemove, selector) {
			if (selector) $(this).bind(event, function () {
				$(selector).addClass(classToRemove);
			});
			else $(this).bind(event, function () {
				$(this).addClass(classToRemove);
			});
		},
		/**
		 * addClass : add a class on the given selector. 
		 * [classToRemove] class to add
		 * [selector] (optional, default = this) jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		addClass: function (classToRemove, selector) {
			if (selector) $(selector).addClass(classToRemove);
			else $(this).addClass(classToRemove);
		},
		/**
		 * removeClass : remove a class on the given selector. 
		 * [classToRemove] class to add
		 * [selector] (optional, default = this) jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		removeClass: function (classToRemove, selector) {
			if (selector) $(selector).removeClass(classToRemove);
			else $(this).removeClass(classToRemove);
		},
		/**
		 * toggleClass : toggle the specified class on the specified selector on the specified event
		 * [theClass] the class to toggle
		 * [selector] (optional, default=this)
		 * [event] (optional, default=null) if not set, directly toggle class   
		 * [toggleClassOnClickOutside] (optional, default=null) when set to true, toggles class on event and THEN an outside click toggles the class again, when set to false, click outside toggles class immediatly 
		 */
		toggleClass: function (theClass, selector, event, toggleClassOnClickOutside) {
			var displayed = 'Registered';
			var clicked = 'Clicked';

			//subToggle is called when <HTML> is clicked
			var subToggle = function (intEvent) {
					//if item is opened
					if (item.data(displayed)) {
						//but not clicked
						if (!item.data(clicked)) {
							//item is closed
							item.hasClass(theClass) ? item.removeClass(theClass) : item.addClass(theClass);
							item.data(displayed, false);
							$('html').unbind('click', subToggle);
						}
						//each time item was clicked, subToggle is called ( because used <HTML>), so item is notified as not clicked just after
						item.data(clicked, false);
					}
				};
			var item = $(selector ? selector : this);
			if (event) {
				// When the item is clicked, this must be notify because subToggle will be called and musn't close the item
				if (toggleClassOnClickOutside === true) {
					item.click(function (intEvent) {
						item.data(clicked, true);
					});
				}
				var bindToggle = function () {
						if (toggleClassOnClickOutside === true) {
							//each time item was clicked, subToggle will be called ( because uned <HTML>), so item is notified as clicked.
							item.data(clicked, true);
							//if item is not opened yet
							if (!item.data(displayed)) {
								//item is set as opened
								item.data(displayed, true);
								$('html').bind('click', subToggle);
							} else {
								//else the item as to be closed
								$('html').unbind('click', subToggle);
								item.data(displayed, false);
							}
						}

						//toggle the class each time item is cliked
						item.hasClass(theClass) ? item.removeClass(theClass) : item.addClass(theClass);
					};
				if (event == 'hover') {
					$(this).hover(bindToggle, bindToggle);
				} else {
					$(this).bind(event, bindToggle);
				}

				if (toggleClassOnClickOutside === false) {
					item.data(clicked, true);
					if (!item.data(displayed)) {
						item.data(displayed, true);
						$('html').bind('click', subToggle);
					}
				}
			} else {
				item.hasClass(theClass) ? item.removeClass(theClass) : item.addClass(theClass);
			}
		},
		/**
		 * toggle : toggle the specified element
		 * [selector] the element selector
		 * [event] (optional, default=null) if set, toggle selector on a specified event. If not set, toggle immediately the selector (usefull when you get a content through ajax, and you want to interact with the rest of the page)  
		 * apply on : all  
		 */
		toggle: function (selector, event) {
			if (event) {
				$(this).bind(event, function () {
					$(selector).toggle();
				});
			} else {
				$(selector).toggle();
			}
		},
		/**
		 * hide : hide the specified element
		 * [selector] the element selector
		 * [event] (optional, default=null) if set, hide selector on a specified event. If not set, hide immediately the selector (usefull when you get a content through ajax, and you want to interact with the rest of the page)  
		 * apply on : all  
		 */
		hide: function (selector, event) {
			if (event) {
				$(this).bind(event, function () {
					if (selector) {
						$(selector).hide();
					}
				});
			} else {
				$(selector).hide();
			}
		},
		/**
		 * show : show the specified element
		 * [selector] the element selector
		 * [event] (optional, default=null) if set, show selector on a specified event. If not set, show immediately the selector (usefull when you get a content through ajax, and you want to interact with the rest of the page)
		 * apply on : all 
		 */
		show: function (selector, event) {
			if (event) {
				$(this).bind(event, function () {
					$(selector).show();
					if ($(selector).hasClass('hide')) $(selector).removeClass('hide');
				});
			} else {
				$(selector).show();
				if ($(selector).hasClass('hide')) $(selector).removeClass('hide');
			}
		},
		/**
		 * contentIn : move the current node content in the selector and remove the current node
		 * [selector] jQuery selector (no comma allowed!)
		 * [append] (optional, default=false) if true, append content to selector, else replace content in selector
		 * apply on : all   
		 */
		contentIn: function (selector, append) {
			append = append || false;
			if (!append) $(selector).empty();
			$(this).children().appendTo($(selector));
			$(this).remove();
		},
		/**
		 * replace : replace the selector node(s) with the current node
		 * [selector] jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		replace: function (selector) {
			$(this).removeClass("replace(" + selector + ")");
			$(selector).replaceWith($(this));
		},
		/**
		 * valueIn : move the current value (or content if current node is not an input) to the selector input value and remove the node
		 * [selector] jQuery selector (no comma allowed!)
		 * apply on : all 
		 */
		valueIn: function (selector) {
			var item = selector == undefined ? $(this) : $(selector);
			item.htmlVal($(this).htmlVal());
			if (selector != undefined) $(this).remove();
		},
		/**
		 * resetValue : fix firefox bug on dropdowwn cache
		 * apply on : select 
		 */
		resetValue: function () {
			var option = $(this).find('option[selected]');
			$(this).val(option.attr('value'));
		},
		/**
		 * valueOn : move the current or given value (or content if current node is not an input) to the selector when event occurs on self
		 * [event] when event occurs on self, html value from self is writen in selector
		 * [selector] jQuery selector (no comma allowed!)
		 * [value] (optional) value replaces the self value when given
		 * apply on : all 
		 */
		valueOn: function (event, selector, value) {
			$(this).bind(event, function () {
				if (value == undefined) {
					//tempValue is required to avoid getting the variable value set otherwise than "undefined"
					var tempValue;
					if ($(this).attr('data-value') !== undefined) {
						tempValue = $(this).attr('data-value');
					} else {
						tempValue = $(this).htmlVal();
					}
					$(selector).htmlVal(tempValue);
				}else{
					$(selector).htmlVal(value);
				}
			});
		},
		/**
		 * copyValueOn : move the current or given value (or content if current node is not an input) to the selector when event occurs on self
		 * [event] when event occurs on self, html value from self is writen in selector
		 * [selector] jQuery selector (no comma allowed!)
		 * [selectorSource] selectorSource value is used to fill the selector value
		 * apply on : all 
		 */
		copyValueOn: function (event, selector, selectorSource) {
			$(this).bind(event, function () {
				$(selector).htmlVal($(selectorSource).htmlVal());
			});
		},

		/**
		 * fillValuesOn : propogate the values fields in the origin zone to other fields which contains the same prefix in its class attributes
		 * [event] when event occurs on self, html value from self is writen in selector
		 * [origin] the selector for the origin zone
		 * [selector] jQuery selector (no comma allowed!)
		 * [rankprefix] the prefix rule that will be matched for fields to be set
		 * apply on : all 
		 */
		fillValuesOn: function (event, origin, selector, rankprefix) {
			$(this).bind(event, function () {
				$(origin).find(selector).andSelf().each(function () {
					var rankselector = null;
					var className = $(this).attr('class').split(" ");
					for (var i = 0; i < className.length; i += 1) {
						if (className[i].indexOf(rankprefix) >= 0) {
							// get the corresponding selector sharing the same rank in its class
							rankselector = "." + className[i];
							$(rankselector).htmlVal($(this).htmlVal());
						}
					}
				});
			});
		},
		/**
		 * copyOn : copy the content of the current element into the specified element on the specified event
		 * [event] the event triggering the copy
		 * [selector] the target element selector of the copy
		 * apply on : all
		 */
		copyOn: function (event, selector) {
			$(this).bind(event, function () {
				$(selector).html($(this).html());
			});
		},
		/**
		 * trigger : trigger a specified event on a specified selector and remove the node 
		 * [event] possible value : blur, click, ... 
		 * [selector] (optional, default = this)
		 * apply on : all 
		 */
		trigger: function (event, selector) {
			selector = selector || this;
			$(selector).trigger(event);
			$(this).remove();
		},
		/**
		 * triggerOn : trigger a specified event on a specified selector 
		 * [event] possible value : blur, click, ...
		 * [triggerThisEvent] the event that will be triggered on selector  
		 * [selector] the target element of the trigger
		 * apply on : all 
		 */
		triggerOn: function (event, triggerThisEvent, selector) {
			$(this).bind(event, function () {
				$(selector).trigger(triggerThisEvent);
			});
		},
		/**
		 * includeJs : include dynamically javascript in current html page 
		 * [url] javascript url 
		 * apply on : all 
		 */
		includeJs: function (url) {
			var urlSelector = $('script[src="' + url + '"]');
			if (urlSelector.length == 0) $('head').append('<script language="javascript" type="text/javascript" src="' + url + '"></script>');
		},
		/**
		 * includeCss : include dynamically css in current html page 
		 * [url] css url 
		 * [media] (optional, default=all) css media
		 * apply on : all 
		 */
		includeCss: function (url, media) {
			var urlSelector = $('link[href="' + url + '"]');
			if (urlSelector.length == 0) {
				if (media) {
					$('head').append('<link href="' + url + '" rel="stylesheet" media="' + media + '" type="text/css" />');
				} else {
					$('head').append('<link href="' + url + '" rel="stylesheet" type="text/css" />');
				}
			}
		},
		/**
		 * dataTable : display fancy table with pagination, and other cool stuff.
		 * doc at http://datatables.net
		 * please include /js/DataTables/media/js/jquery.dataTables.min.js before use
		 * please include /css/DataTables/jquery.dataTables.css
		 * can be used with the following function to parameter the behaviour on response :  
		 * 		bFilter : Allow to search a particular word with a search field (true if defined, false otherwise)
		 * 		bPaginate : Allow to paginate content (true if defined, false otherwise)
		 * 		bInfo : Allow to display which line & page is displayed (true if defined, false otherwise)
		 * 
		 */
		dataTable: function () {
			var Options = $(this).ClassArgs();

			//language
			var TextFile = "js/DataTables/media/i18n/english.txt";
			switch ($.lang.LanguageCode) {
			case 'FR':
				TextFile = "js/DataTables/media/i18n/french.txt";
			}
			
			//columnDefs options
			var columnDefsJson = $('#dt-columnDefs');
			if (columnDefsJson) {
				try {
				   var columnDefs = JSON.parse(columnDefsJson.text()) || {};
				   Options = $.extend(columnDefs, Options);
				}
				catch (e) {
				   console.log(e);
				}
			}

			//default options
			var Default = {
				"oLanguage": {
					"sUrl": TextFile
				},
				"bRetreive": true,
				"bPaginate": false,
				"bFilter": false,
				"bInfo": false,
			};

			//Fill Options
			Options = $.extend(Default, Options);

			//Active dataTable
			$(this).dataTable(Options);
		},

		/**
		 * flyout : display link as a flyout panel. Use href to fill popover content 
		 * for more information about html class parameters, see http://jasny.github.io/bootstrap/javascript.html#popovers
		 * apply on : a 
		 */
		flyout: function () {
			var isVisible = false;
			var data;
			var Options = $(this).ClassArgs();
			var self = $(this);
			var Default = {
				html: true,
				title: $(this).attr('title'),
				trigger: 'manual',
				noCache: false,
				content: function () {
					if (data == undefined || Options.noCache) {
						data = $($.ajax({
							url: $(this).attr('href'),
							async: false
						}).responseText);
					}
					return data;
				}
			};
			Options = $.extend(Default, Options);

			$(this).popover(Options).click(function (e) {
				e.preventDefault();
				if (!isVisible) {
					$(this).popover('show');
					data.EvalClass();
					isVisible = true;
					$(this).next('.popover').bind('click', function (event) {
						event.stopPropagation();
					});
				}
				e.stopPropagation();
			});

			$(document).click(function (e) {
				if (isVisible) {
					self.popover('hide');
					isVisible = false;
				}
			});
		},

		/**
		 * slimScroll : display a fancy scrollbar
		 * [height] (optional) specify height of the content, by default set to '200px'
		 * apply on : all 
		 * requires : /js/slimScroll/jquery.slimscroll.min.js
		 */
		slimScroll: function (height) {
			var Options = $(this).ClassArgs();
			var Default = {
				height: height ? height : '200px'
			};
			Options = $.extend(Default, Options);
			$(this).slimScroll(Options);
		},
		/**
		 * (deprecated) modal : display modal dialog as described in http://jasny.github.io/bootstrap/javascript.html#modals (deprecated)
		 * WBO-87
		 * 	Problem
		 * 		The keyword 'modal' conflicts with bootstrap 3.3.7 class keyword 'modal'
		`*		Additionally the functionality is no longer required as it is now manage by bootstrap js
		 * 	Solution
		 *		Renaming to displayDialogOnPageLoad
		 *		We going to utilize this function to maintain wynsure feature to show a dialog on page load
		 */
		displayDialogOnPageLoad: function () {
			var Options = $(this).ClassArgs();
			$(this).appendTo($('body'));
			$(this).modal(Options);
		},
		/**
		 * tooltip : display tooltip 
		 * [selector] (optional) if set, use selector to get tooltip html content, if not set, uses title attribute as tooltip html content
		 * apply on : all 
		 */
		tooltip: function (selector) {
			var Default = {};
			if (selector !== undefined) {
				Default = {
					title: function () {
						return $(selector).html();
					},
					html: true
				}
			}
			var Options = $(this).ClassArgs();
			Options = $.extend(Default, Options);
			$(this).tooltip(Options);
		},
		/**
		 * resetParentPadding : reset parent padding properties
		 * apply on : all
		 */
		resetParentPadding: function () {
			$(this).parent().css('padding', '0px');
		},
		/**
		 * table : apply particular properties when using a table
		 * apply on : table
		 */
		table: function () {
			//When a table is alone under a section
			if ($(this).siblings().length == 0) if ($(this).parent().hasClass('section-content')) $(this).parent().css('padding', '0px');
		},
		/**
		 * fancyTree : trandforme list as fancy tree
		 * [iconOpen] (optional) if set, is used as icon when a folder is opened
		 * [iconClose] (optional) if set, is used as icon when a folder is closed
		 * [iconLastChild] (optional) if set, is used as icon for final node (not folder)
		 * apply on : div
		 * Required: include theme\MPhasisWyde\css\fancy-tree.css
		 */
		fancyTree: function (iconOpen,iconClose,iconLastChild) {

			//for css purpose:
			$(this).addClass('fancyTreeUsed');
			var iconOpenToUse = "";
	            var iconCloseToUse = "";
	            if (iconOpen !== undefined) 
	            	iconOpenToUse = iconOpen;

	            if (iconClose !== undefined) 
	            	iconCloseToUse = iconClose;

	        //Add parent_li to parent node fro css purpose
	        var parentNodes = $(this).find('li:has(ul)');
			parentNodes.addClass('parent_li');

			//change icon for parent nodes
			var spansFromParents = parentNodes.find(' > div');
			spansFromParents.find(' > i').addClass(iconCloseToUse);
			
			//change icon for final node
			var spanFromFinalNodes = $(this).find('li:not(:has(ul)) > div');
			if (iconLastChild !== undefined) 
					spanFromFinalNodes.find(' > i').addClass(iconLastChild);

	        //event click to close or open tree node
		    spansFromParents.on('click', function (e) {
		        var children = $(this).parent('li.parent_li').find(' > ul > li');
		        
		        if (children.is(":visible")) {
		            children.hide('fast');
		            $(this).parent('li.parent_li').addClass('isClosed').removeClass('isOpen');
		            $(this).find(' > i').addClass(iconOpenToUse).removeClass(iconCloseToUse);
		        } else {
		            children.show('fast');
		            $(this).parent('li.parent_li').addClass('isOpen').removeClass('isClosed');
		            $(this).find(' > i').addClass(iconCloseToUse).removeClass(iconOpenToUse);
		        }
		        e.stopPropagation();
		    });
		},
		/**
		 * Display3DCar : replace the div content with a 3D car. If webGL is not supported, the old car images are displayed
		 * apply on : Div
		 * [width] (optional) : Canvas width . -1 by default for no width
		 * [height] (optional) : Canvas height . -1 by default for no height
		 * [allowSelection] (optional) : If, true, car part can be selected
		 * [carOriginColor] (optional) the color given to the car. 0x64B6DF by default
		 * [carDamageColor] (optional) the color given to the damage car parts. 0xFF0000 by default
		 * can be used with the following function to defined damage car parts  :  
		 * 		carDamage(values) : values are the damage car part ( see js/three.js-component/car/car.js to know the available cart parts)
		 */
		display3DCar: function (rank,width, height,allowSelection,carOriginColor,carDamageColor) {
			var CanDisplay3DCar = true;
			if (!webgl_support()){
			    // the browser doesn't even know what WebGL is
			    CanDisplay3DCar = false;
			}
			if (CanDisplay3DCar == true){
				//Get default damage car parts
				var Options = $(this).ClassArgs();
				
				var damagecarPartsTitles = [];
				if (Options['carDamage'] != null) {
					var damagecarPartsTitle = $(Options['carDamage']);
					if ( damagecarPartsTitle.length ==0){
						damagecarPartsTitles[0] = damagecarPartsTitle.selector.replace(/_/g, ".");
					}else
						for (var i = 0; i < damagecarPartsTitle.length; i += 1) {
							//js/three.js-component/car/car.js key words requestes '.' instread of '_'
							damagecarPartsTitles[i] = damagecarPartsTitle[i].replace(/_/g, ".");
						}
				}

				//empty the html before displaying the car inside
				$(this).empty();
				if (width != undefined && width != -1)
					$(this).css( 'width', width );
				if (height != undefined && height != -1)
					$(this).css( 'height', height );

				//set colors
				if ( carOriginColor == undefined)
	    			carOriginColor=0x64B6DF;
	    		if ( carDamageColor == undefined)
	    			carDamageColor=0xFF0000;
	   			
	   			//display the car
	   			$(this)[0].style.cursor="pointer";
	   			if (allowSelection == undefined)
					$.fn.display3DCar( rank,$(this)[0],false,damagecarPartsTitles,carOriginColor,carDamageColor);
				else
					$.fn.display3DCar( rank,$(this)[0],allowSelection,damagecarPartsTitles,carOriginColor,carDamageColor);
				//verify all works fine
				CanDisplay3DCar = false
				 var canvas = $(this).find('canvas');
				 if ( canvas != undefined)
				 	CanDisplay3DCar = true
			}

			if (CanDisplay3DCar == false){
				$(this).remove();
			}
		}


	});
})(jQuery);

