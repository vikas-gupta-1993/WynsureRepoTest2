/*!
 * Wyde Ninja Display Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {

	$.extend($.fn.classfunc, {

		/**
		 * ajaxExpandTree : get a content throught ajax, and replace td content with it. Send the rank through url (url += name=value) and get children content
		 * apply on : input, select
		 * [url] url to request
		 * [selector] selector to update with content received from url
		 * [event] (optional) trigger ajaxGet on a specific event 
		 */
		ajaxExpandTree: function (url, selector, event) {
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
							$('.UnwrapTree').unwrap();
							$('.UnwrapTree').removeClass('UnwrapTree');
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
		 * toogleTreeElement : Expand/Collapse tree element
		 * [selector] Parent element to expand or collapse
		 * [event] (optional) trigger ajaxGet on a specific event 
		 */
		toogleTreeElement: function (selector, event) {
			var fn = function () {
					$(selector).toggleBranch();
				};
			event ? $(this).bind(event, fn) : fn();
		}
	});

})(jQuery);