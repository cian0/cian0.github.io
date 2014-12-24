app.modules.initial_evaluation_form = {

	init: function(vars){

		vs.setVarByControllerID('template','title','Initial Evaluation Form');
		
		$('[data-toggle="offcanvas"]').click(function () {
			$('.row-offcanvas').toggleClass('active');
		});

		/* activate sidebar */
		$('.sidebar-scrollspy').affix({ offset: { top: 50 } });

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
					$('html,body').animate({ scrollTop: target.offset().top - 50 }, 1000);
					return false;
				}
			}
		});

		$('#addNewRow').click(function() {
			var $template = '<tr><td><input type="text" class="form-control" style="min-width: 250px;"></td><td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><button class="btn btn-danger removeRow" type="button"><i class="fa fa-times"></i></button></td></tr>';
			var count = $('#med_body').children().length;
			if ( count < 6) {
				$('#med_body').append($template);
			}
			else {
				return false;
			}
			$('.removeRow').click(function() {
				$(this).closest('tr').remove();
			});
		});

		$('#assistive_device_choices').hide();
		
		$('#select_ambulatory').change(function() {
			var val = $(this).val();
			if (val === 'with_assistive_device') {
				$('#assistive_device_choices').show();
			}
			else {
				$('#assistive_device_choices').hide();
			}
			$('#fa_ambulation_ambulatory').prop('checked',true);
		});

		$('#fa_ambulation_non_ambulatory').change(function() {
			$('#assistive_device_choices').hide();
			$('#select_ambulatory').val('withassist');
		});

		$('#select_non_ambulatory').change(function() {
			$('#assistive_device_choices').hide();
			$('#fa_ambulation_non_ambulatory').prop('checked',true);
		});	
	}
}