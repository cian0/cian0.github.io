
$(function() {
	$(window).on({
		hashchange: function(){
			var page = vs.getURLHash();
			if(page == ''){
				window.location.hash = '#!/login';
			} else {
				vs.display(page);
			}
		}
	});

	app.onReady();

	$(window).trigger('hashchange');
});
