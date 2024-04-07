// Off Canvas
$(document).ready(function () {
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active');
	});

	/* activate sidebar */
	$('#sidebar-scrollspy').affix({ offset: { top: 30 } });

	/* activate scrollspy menu */
	var $body   = $(document.body);
	var navHeight = $('.navbar').outerHeight(true) + 10;

	$body.scrollspy({
		target: '.leftCol',
		offset: navHeight
	});

	/* smooth scrolling sections */
	$('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				$('html,body').animate({ scrollTop: target.offset().top - 60 }, 1000);
				return false;
			}
		}
	});

	$('[data-toggle="tooltip"]').tooltip();
	$('.initial_eval').show();
});

// Add/Delete rows for medication
function addNewRow(btn) {
	var $template = '<tr><td><input type="text" class="form-control" style="min-width: 250px;"></td><td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><button class="btn btn-danger removeRow" type="button"><i class="fa fa-times"></i></button></td></tr>';
	var $tablebody = $(btn).closest('.table').find('.med_body');
	var count = $tablebody.children().length;
	if ( count < 6) {
		$tablebody.append($template);
	}
	else {
		return false;
	}
	$('.removeRow').click(function() {
		$(this).closest('tr').remove();
	});
}

// Toggle / Hide Section
function showSection(element)  {
	$('.' + element).show();
	$('.section').not('.' + element).hide();
}

// Loading Overlay: Show and Hide
function showLoading() { $('#loadingOverlay').addClass('in'); }
function hideLoading() { $('#loadingOverlay').removeClass('in'); }

// App Message with option of Autoclose
var timer;
var alertbox = $('.alert-box');

function startAutoClose() {
	window.clearTimeout(timer);
	timer = window.setTimeout(
		function(){
			alertbox.removeClass('in');
		} ,5000
	);
}

function showMessage() {
	alertbox.addClass('in');
	if (alertbox.hasClass('alert-autoclose')) {
		startAutoClose();
	}
}

function hideMessage() {
	alertbox.removeClass('in');
	if (alertbox.hasClass('alert-autoclose')) {
		window.clearTimeout(timer);
	}
}

// Edit Data
function editData(elem) {
	var targ = $(elem).parent();
	targ.fadeOut('fast', function() {
		targ.next('.form-data').fadeIn('fast').css('display','inline-block');
	});
}

function undoEditData(elem) {
	var targ = $(elem).parent();
	targ.fadeOut('fast', function() {
		targ.prev('.form-data').fadeIn('fast').css('display','inline-block');
	});
}

