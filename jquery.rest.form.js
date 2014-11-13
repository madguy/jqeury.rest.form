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
	var urlParameterRegex = /:((?:\w)+)/g;

	var dataToJSON = function(data) {
		if (data == null) {
			return data;
		}

		if ($.isPlainObject(data)) {
			return JSON.stringify(data);
		}

		if (/^\{.+\}$/.test(data)) {
			return data;
		}

		var kvRegex = /^(.+)=(.+)$/;
		var booleanRegex = /^(?:true|false)$/i;
		var params = data.split('&').reduce(function(params, kv) {
			var match = kvRegex.exec(kv);
			if (match == null) {
				return params;
			}

			var key = decodeURIComponent(match[1]);
			var value = decodeURIComponent(match[2]);
			if ($.isNumeric(value)) {
				value = parseInt(value, 10);
			}

			if (booleanRegex.test(value)) {
				value = /^true$/i.test(value);
			}

			var isArray = /\[\]$/.test(key);
			if (isArray) {
				key = key.slice(0, -2);
				params[key] = params[key] || [];
				params[key].push(value);
			} else {
				params[key] = value;
			}

			return params;
		}, {});

		return JSON.stringify(params);
	};

	$.fn.restForm = function(options) {
		this.ajaxFormUnbind().on('submit.form-plugin', function(e) {
			if (e.isDefaultPrevented()) {
				return;
			}
			e.preventDefault();
			$(this).restSubmit(options);
		});
		return this;
	};

	$.fn.restSubmit = function(options) {
		options = $.isPlainObject(options) ? options : {};

		var $form = this;
		var url = options.url || $form.attr('action');
		var opt = $.extend({}, options, {
			url: url.replace(urlParameterRegex, function(match, g1) {
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
				var matches = url.match(urlParameterRegex);
				if (matches != null) {
					var keys = matches.map(function(match) {
						return match.replace(urlParameterRegex, '$1');
					});

					params.filter(function(param) {
						return keys.indexOf(param.name) > -1;
					}).forEach(function(param) {
						var index = params.indexOf(param);
						params.splice(index, 1);
					});
				}

				if ($.isFunction(options.beforeSubmit) === false) {
					return;
				}

				return options.beforeSubmit.apply(this, arguments);
			},
			beforeSend: function(jqXHR, settings) {
				if (settings.type !== 'GET' && settings.contentType === 'application/json' && settings.data != null) {
					settings.data = dataToJSON(settings.data);
				}

				if ($.isFunction(options.beforeSend) === false) {
					return;
				}

				return options.beforeSend.apply(this, arguments);
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

		$form.ajaxSubmit(opt);
	};

})(jQuery);