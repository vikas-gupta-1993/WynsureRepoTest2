/*!
 * Wyde Ninja Style Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {

	$('*[disabled=disabled]').css('border', '0');

	$.extend($.fn.classfunc, {
		hoverStyle: function (hoverClass) {
			hoverClass = hoverClass ? hoverClass : 'ui-state-hover';
			$(this).hover(

			function () {
				$(this).addClass(hoverClass);
			}, function () {
				$(this).removeClass(hoverClass);
			});
		},

		ninjaTabs: function (header) {
			header = header || 'h4';
			var tabId = '';
			var tabIndex = 0;
			var tabWrapper;
			$(this).find(header).each(function (index) {
				tabWrapper = $(this).prevAll('div.tabWrapper');
				if (!tabWrapper.hasClass('tabWrapper')) {
					tabWrapper = $('<div class="tabWrapper"></div>').insertBefore($(this));
				}
				var tabTitles = tabWrapper.find('ul.tab-titles:first');
				if (tabTitles.length == 0) {
					tabTitles = $('<ul class="tab-titles"></ul>').prependTo(tabWrapper);
				}
				do {
					tabId = 'tabs-' + tabIndex;
					tabIndex++;
				} while ($(tabId).length > 0);
				$('<li></li>').append('<a href="#' + tabId + '">' + $(this).text() + '</a>').appendTo(tabTitles);
				$('<div id="' + tabId + '"></div>').append($(this).nextAll(':first')).appendTo(tabWrapper);
				$(this).remove();
			});
			tabWrapper.tabs({
				fx: {
					opacity: 'toggle',
					duration: 'fast'
				}
			});
		},

		ninjaAccordion: function (header) {
			header = header || 'h4';
			$(this).find(header).each(function (index) {
				$(this).parents(':first').addClass('accordion header(' + header + ')').EvalClass();
			});
		}

	});

})(jQuery);