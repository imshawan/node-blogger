'use strict';

define('modules/http', () => {
	const http = {};
	const baseUrl = '/api/v1';
	const csrfToken = {
		get: () => String($('form#csrf_token > input').val())
	};

	http.GET = async (route, payload={}, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}
		if (!payload) {
			payload={}
		}

		if (options.hasOwnProperty('headers')) {
			if (!options.headers.hasOwnProperty('csrf-token')) {
				options.headers = $.extend(options.headers, {
					'csrf-token': csrfToken.get()
				});
			}
		} else {
			options.headers = {
				'csrf-token': csrfToken.get()
			};
		}

		return await callAjax({
			url: route + (Object.keys(payload).length ? ('?' + $.param(payload)) : ''),
			...options,
		}, onSuccess);
	}

	http.POST = async (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		return await callAjax({
			url: route,
			method: 'post',
			data: payload,
			headers: {
				'csrf-token': csrfToken.get()
			},
			...options,
		}, onSuccess);
	}

	http.PUT = async (route, payload, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		return await callAjax({
			url: route,
			method: 'put',
			data: payload,
			headers: {
				'csrf-token': csrfToken.get()
			},
			...options,
		}, onSuccess);
	}

	http.DELETE = async (route, options={}, onSuccess) => {
		if (!Object.keys(options).length) {
			options = {};
		}

		return await callAjax({
			url: route,
			method: 'delete',
			data: {},
			headers: {
				'csrf-token': csrfToken.get()
			},
			...options,
		}, onSuccess);
	}

  function callAjax(options, callback) {
		options.url = options.url.startsWith('/api') ? options.url :
			baseUrl + options.url;
		
		if (options.hasOwnProperty('headers')) {
			options.headers = $.extend(options.headers, {'csrf-token': csrfToken.get()});
		} else {
			options.headers = {'csrf-token': csrfToken.get()}
		}

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
