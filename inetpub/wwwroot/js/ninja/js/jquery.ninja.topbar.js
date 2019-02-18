/*!
 * Wyde Ninja topbar Module
 * version 5.4.0.0
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {

	$('*[disabled=disabled]').css('border', '0');

	$.extend($.fn.classfunc, {

		topnav: function () {
			$(this).find('ul.subnav').parents('li:eq(0)').addClass('subnav').append('<span class="arrow"></span>');
			$(this).find('li[class="subnav"]').click(function () {
				$(this).parent().find('ul.subnav').slideDown('fast').show();
				$(this).parent().hover(

				function () {}, function () {
					$(this).parent().find("ul.subnav").slideUp('slow');
				});
			}).hover(

			function () {
				$(this).addClass('subhover');
			}, function () {
				$(this).removeClass('subhover');
			});
		}

	});

})(jQuery);