'use strict';

define('modules/http', () => {
	const http = {};
	const baseUrl = '/api/v1';

	http.GET = (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		callAjax({
			url: route + (Object.keys(payload).length ? ('?' + $.param(payload)) : ''),
			...options,
		}, onSuccess);
	}

	http.POST = (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		callAjax({
			url: route,
			method: 'post',
			data: payload,
			headers: {
				
			},
			...options,
		}, onSuccess);
	}

	http.PUT = (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		callAjax({
			url: route,
			method: 'put',
			data: payload,
			headers: {
				
			},
			...options,
		}, onSuccess);
	}

	http.DELETE = (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		callAjax({
			url: route,
			method: 'delete',
			data: payload,
			headers: {
				
			},
			...options,
		}, onSuccess);
	}

  function callAjax(options, callback) {
		options.url = options.url.startsWith('/api') ? options.url :
			baseUrl + options.url;

		function doAjax(cb) {
			$.ajax(options)
				.done((res) => {
					cb(null,
						res && res.hasOwnProperty('status') && res.hasOwnProperty('payload') ?
							res.payload : (res || {})
					);
				})
				.fail((ev) => {
					let errMessage;
					if (ev.responseJSON) {
						errMessage = ev.responseJSON.status && ev.responseJSON.status.message ?
							ev.responseJSON.status.message :
							ev.responseJSON.error;
					}

					cb(new Error(errMessage || ev.statusText));
				});
		}

		if (typeof callback === 'function') {
			doAjax(callback);
			return;
		}

		return new Promise((resolve, reject) => {
			doAjax(function (err, data) {
				if (err) reject(err);
				else resolve(data);
			});
		});
	}

	return http;

});
