
$(function() {
	$(window).hashchange(function() {
		var page = vs.getURLHash();
		vs.display(page);
	});

	app.onReady();

	$(window).hashchange();
});
