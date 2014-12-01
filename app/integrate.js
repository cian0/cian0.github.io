
$(function() {
	$(window).on({
		hashchange: function(){
			var page = vs.getURLHash();
			vs.display(page);			
		}
	});


	app.onReady();

	$(window).trigger('hashchange');
});
