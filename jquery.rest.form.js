/*!
 jquery rest form plugin
 =======================

 ## About
 jQuery Form PluginをRESTfulなURLに対応させるためのラッパープラグインです。

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
	var regex = /:((?:\w)+)/g;

	$.fn.restForm = function(options) {
		this.ajaxFormUnbind().on('submit.form-plugin', function(e) {
			if (e.isDefaultPrevented()) {
				return;
			}
			e.preventDefault();
			$(this).restSubmit(options);
		});
	};

	$.fn.restSubmit = function(options) {
		var that = this;
		var $form = $(that);
		var url = options.url || $form.attr('action');
		var opt = $.extend({}, options, {
			url: url.replace(regex, function(match, g1) {
				var key = g1;
				var param = $form.formToArray().filter(function(param) {
					return param.name === key;
				})[0];
				if (param == null) {
					return match;
				}
				return param.value;
			}),
			beforeSubmit: function(params, $form, opts) {
				var matches = url.match(regex);
				if (matches == null) {
					return;
				}

				var keys = matches.map(function(match) {
					return match.replace(regex, '$1');
				});

				params.filter(function(param) {
					return keys.indexOf(param.name) > -1;
				}).forEach(function(param) {
					var index = params.indexOf(param);
					params.splice(index, 1);
				});

				if ($.isFunction(options.beforeSubmit) === false) {
					return;
				}

				return options.beforeSubmit.apply(that, arguments);
			},
			success: function() {
				$form.trigger('success', arguments);
				if ($.isFunction(options.success)) {
					options.success.apply(this, arguments);
				}
			},
			error: function() {
				$form.trigger('error', arguments);
				if ($.isFunction(options.error)) {
					options.error.apply(this, arguments);
				}
			},
			complete: function() {
				$form.trigger('complete', arguments);
				if ($.isFunction(options.complete)) {
					options.complete.apply(this, arguments);
				}
			}
		});

		$(this).ajaxSubmit(opt);
	};

})(jQuery);