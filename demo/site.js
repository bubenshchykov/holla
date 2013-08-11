$(function(){

	/* browser support */

	if(!window.holla || !holla.supported) {
		$('.error').html('Ooops, you browser does not support Web RTC. <br/> Go check Chrome 24+ and Firefox 21+');
		return;
	}

	/* ui helper for adding a video box */

	function createCallBax() {
		var $el = $('<div class="call-box"><div class="gutter"><video autoplay="true"></video></div></div>');
		return {
			$el: $el,
			show: function(stream){
				$('.calls').append($el);
				holla.pipe(stream, $el.find('video'));
			},
			destroy: function() {
				$el.remove();
			}
		};
	}

	/* holla-abstracted web rtc */

	holla.createFullStream(function(err, stream) {
		if (err){
			throw err;
		}

		var myCallBox = createCallBax();
		myCallBox.show(stream);

		var myName = (+new Date).toString();
		var server = holla.createClient();

		server.register(myName, function(worked) {
			var crew = {};

			/* auto-call new users, clean users who left */
			server.on("presence", function(user){
				if (!user.online) {
					var callBax = crew[user.name] && crew[user.name];
					if (callBax) {
						callBax.destroy();
						delete crew[user.name];
					}
					return;
				}
				var call = server.call(user.name);
				call.addStream(stream);
				call.ready(function(stream) {
					var callBox = createCallBax();
					callBox.show(stream);
					crew[user.name] = callBox;
				});
			});

			/* auto-answer to all incoming calls */
			server.on("call", function(call) {
				call.addStream(stream);
				call.answer();
				call.ready(function(stream) {
					var callBox = createCallBax();
					callBox.show(stream);
					crew[call.from] = createCallBax(stream);
				});
			});

		});
	});
});