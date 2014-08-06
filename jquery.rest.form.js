/*!
 jquery rest form plugin
=======================

## About
 jQuery Form PluginをrestfulなURLに対応させるためのラッパープラグインです。

## jQuery Form Plugin
http://malsup.com/jquery/form/

## Required
* jQuery(Recommende higher version)
* jQuery Form Plugin

## Usage
 urlに[:(param_name)]と入れると該当パラメータに置換します。
 ex: /user/:user_name -> /user/hoge

## License
licensed under MIT
 */
(function($) {
	"use strict";

	$.fn.restForm = function(options) {
		this.ajaxFormUnbind().on('submit.form-plugin', function(e) {
			var that = this;
			if (e.isDefaultPrevented()) {
				return;
			}
			e.preventDefault();

			var $form = $(that);
			var params = $form.formToArray();
			var url = options.url || $form.attr('action');
			var opt = $.extend({}, options, {
				url: url.replace(/:(\w)+/g, function(match) {
					var key = match.substring(1);
					var param = params.filter(function(param) {
						return param.name === key;
					})[0];
					return param.value;
				}),
				beforeSubmit: function(arr, $form, opts) {
					var keys = url.match(/:(\w)+/g).map(function(match) {
						return match.substring(1);
					});

					arr.map(function(item) {
						return keys.indexOf(item.name);
					}).forEach(function(index) {
						arr.splice(index, 1);
					});

					if ($.isFunction(options.beforeSubmit) === false) {
						return;
					}

					return options.beforeSubmit.apply(that, [arr, $form, opts]);
				}
			});

			$(this).ajaxSubmit(opt);
		});
	};
})(jQuery);