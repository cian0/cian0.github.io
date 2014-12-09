var vs = {
	init: function(){

		$.when(
		    $.getScript( 'app/tests.js' ),
		    $.Deferred(function( deferred ){
		        $( deferred.resolve );
		    })
		).done(function(){

			if(app.settings.debugMode){
				vs.developer.setPageMenuItems();
				vs.developer.init();
			}


		});
	},
	getURLHash: function(){
		var hash = window.location.hash.replace("#!/",'');
		return  hash;
	},
	sendAppEvent: function(eventName, currentContext, data) {

		if(app.settings.demoMode){
			var testID = $('#' + app.data.lastPageRendered + ' .tests-select').val();
			app.tests[app.data.lastPageRendered].events[eventName]();
		} else {
			var event = new api.client.AppEvent(eventName, currentContext, data);
			connObj.send(event);
		}
	},
	display: function(page, vars){

		$.getScript( 'app/pages/' + page + '.js' )
			.done(function( script, textStatus ) {

				vs.showPage(page,vars);

				app.data.lastPageRendered = page;

				if(app.modules[page]){
					app.modules[page].init(vars);
				}
			})
			.fail(function(){
				vs.showPage(page,vars);

				app.data.lastPageRendered = page;
			});
	},
	defaultTo: function(param, defaultValue){
		param = typeof param !== 'undefined' ? param : defaultValue;
		return param;
	},
	setVars: function(vars){
		
		var id = app.data.lastPageRendered;

		for(var varName in vars){
			vs.setVarByControllerID(id, varName, vars[varName]);
		}
	},
	showPage: function(id, vars){

		var scope = angular.element($('#' + id )).scope();
		var pageBindedVars = vs.developer.getPageBindedVars(id);
		var pageUnbindedVars = vs.developer.getPageUnbindedVars(id, vars);

		if(vars){

			//set data
			for(var varName in vars){
				vs.setVarByControllerID(id, varName, vars[varName]);
			}
	    }

	    //set unbinded server data
	    if(app.settings.debugMode && scope && pageUnbindedVars.length > 0){

			$('#' + id + ' .static-container .error').remove();

			for(var i=0; i < pageUnbindedVars.length; i++){

				var varName = pageUnbindedVars[i];
				//build input element that is binded to this variable
				var str = "";
				str += '<div class="form-group">';
				str += '	<label>' + varName + '</label>';
				str += '	<input type="text" class="form-control" disabled="disabled" value="' + scope[varName] + '" ng-model="' + varName + '">';
				str += '</div>';

				//do binding of input element and variable
				var $formGroup = $(str);
				$formGroup.attr('rel', varName);
				$formGroup.find('input').on({
					keyup: function(){
						var scope = angular.element($('#' + id )).scope();
						var val = $(this).val();
						var varName = $(this).parent().attr('rel');

						scope.$apply(function(){
							scope[varName] = val;
				    	});
					},
					change: function(){
						var scope = angular.element($('#' + id )).scope();
						var val = $(this).val();
						var varName = $(this).parent().attr('rel');

						scope.$apply(function(){
							scope[varName] = val;
				    	});
					}
				});

				//append this form to group
				$('#' + id + ' .static-container').append($formGroup);
			}
	    }

	    //show the page
    	$('.page').addClass('hidden');

    	var $pageElement = $('#' + id);


    	if($pageElement.length == 0){
			window.location.hash= "#!/page_not_found";
    	}

		$pageElement.removeClass('hidden');
		$('html,body').animate({scrollTop: 0}, 1);
	},
	setVar: function(varName, val){
		var id = app.data.lastPageRendered;
		var scope = angular.element($('#' + id )).scope();
		
		if(scope){
			scope.$apply(function(){
				scope[varName] = val;
	    	});

	    	$('#' + id + ' .form-group[rel="' + varName + '"] textarea').html(val);
	    }
	},
	getVar: function(varName){
		var id = app.data.lastPageRendered;
		var scope = angular.element($('#' + id )).scope();
		
		return scope[varName];
	},
	setVarByControllerID: function(id, varName, val){
		var scope = angular.element($('#' + id )).scope();
		
		if(scope){
			scope.$apply(function(){
				scope[varName] = val;
	    	});

	    	$('#' + id + ' .form-group[rel="' + varName + '"] textarea').html(val);
	    }
	},
	extend: {
		_jQueryScrollToMe: function _jQueryScrollToMe(){
			jQuery.fn.extend({
			show: function (){
				$('.page').addClass('hidden');
				$(this).removeClass('hidden');
			}});
		}
	},
	developer: {
		init: function(){
			vs.developer.btnShowVarsHandler();
			vs.developer.buildVars("ThankYou");
		},
		getPageUnbindedVars: function(id, vars){

			var pageBindedVars = vs.developer.getPageBindedVars(id);
			var pageUnbindedVars = [];

			for(var varName in vars){
				vs.setVarByControllerID(id, varName, vars[varName]);

				if(pageBindedVars.indexOf(varName) <= -1){
					pageUnbindedVars.push(varName);
				}
			}

			return pageUnbindedVars;
		},
		btnShowVarsHandler: function(){
			$('#btn-showvars').removeClass('hidden');
			$('#btn-showvars').on({
				click: function(){
					var obj = $(this);
					if( obj.hasClass('open') ){
						obj.removeClass('open');
						obj.html("Show Dev Tools");
						$('.variables-form').addClass('hidden');
					} else {
						obj.addClass('open');
						obj.html("Hide Dev Tools");
						$('.variables-form').removeClass('hidden');
					}
				}
			});
		},
		getPageBindedVars: function(id){

			var scope = angular.element($('#' + id )).scope();

	        var vars = [];

	        for(var varName in scope){
	        	if(varName != 'this' && varName != 'constructor' && varName[0] != '$' ){
	        		vars.push(varName);
	        	}
	        }

	        return vars;
		},
		buildVars: function(id){
			var pages = [];
			$('.page').each(function(){
				var id = $(this).attr('id');
				pages.push(id);
			});


			$('.page').each(function(){

				var id = $(this).attr('id');

				//build variables container
				var str = "";
		        str += '<div class="col-xs-10 col-xs-offset-1 text-xl">';
		        str += '	<form class="variables-form" role="form">';
		        str += '		<div class="form-group">';
				str += '			<label class="heading">DEMO MODE</label>';
		        str += '			<input type="checkbox" class="demo-mode" />';
		        str += '		</div>';
		        str += '		<div class="form-group">';
				str += '			<label class="heading">PAGE ID</label>';
		        str += '			<select class="pages-select"></select>';
		        str += '		</div>';
		        str += '		<div class="form-group">';
				str += '			<label class="heading">TEST DATA</label>';
		        str += '			<select class="tests-select"></select>';
		        str += '		</div>';
		        str += '		<div class="form-group">';
				str += '			<label class="heading">BINDED DATA</label>';
				str += '		</div>';
		        str += '		<div class="form-group variables-container">';
				str += '			<div class="error alert-warning">Empty</div>';
				str += '		</div>';
		        str += '		<div class="form-group">';
				str += '			<label class="heading">UNBINDED DATA</label>';
				str += '		</div>';
		        str += '		<div class="static-container">';
				str += '			<div class="error alert-warning">Empty</div>';
				str += '		</div>';
		        str += '	</form>';
		        str += '</div>';

		        var $variablesFormHTML = $(str);

		        //build demo mode check box
		        $demoBox = $variablesFormHTML.find('.demo-mode');

		        if(app.settings.demoMode){
		        	$demoBox.get(0).checked = true;
		        } else {
		        	$demoBox.get(0).checked = false;
		        }

		        $demoBox.on({
		        	change: function(){
		        		var state = $(this).get(0).checked;

		        		app.settings.demoMode = state;
		        	}
		        })


		        //build pages select box
				var optionsHTML = '';

				for(var i = 0; i < pages.length; i++){
					var selected = '';

					if(pages[i] == id){
						selected = ' selected ';
					}

					optionsHTML += '<option ' + selected + ' >' + pages[i] + '</option>';
				}

				$pageSelect = $variablesFormHTML.find('.pages-select');

				$pageSelect.html(optionsHTML);
				
				$pageSelect.on({
					'change': function(){
						var targetId = $(this).val();

						var selectOptions = $(this).get(0).options;
						for(var i = 0; i< selectOptions.length; i++){
							if(selectOptions[i].value == id){
								$(this).get(0).options[i].selected = true;
							} else {
								$(this).get(0).options[i].selected = false;
							}
						}

						vs.display(targetId);
					}
				});
				

				//build tests select box
				var testsOptionsHTML = '';

				console.log(app.tests);
				console.log(id);

				if(app.tests[id]){
					for(var i in app.tests[id].data){
						testsOptionsHTML += '<option ' + selected + ' >' + i + '</option>';
					}
				}

				$testsSelect = $variablesFormHTML.find('.tests-select');

				$testsSelect.html(testsOptionsHTML);

				$testsSelect.on({
					'change': function(){
						var targetTestId = $(this).val();
						vs.showPage(id, app.tests[id].data[targetTestId]);
					}
				});


				var scope = angular.element($('#' + id )).scope();

		        $('#' + id).append($variablesFormHTML);

		        var vars = [];

		        for(var varName in scope){
		        	if(varName != 'this' && varName != 'constructor' && varName[0] != '$' ){
		        		vars.push(varName);
		        	}
		        }

		        if(vars.length > 0){

					for(var i=0; i < vars.length; i++){

						var varName = vars[i];
						//build input element that is binded to this variable
						var str = "";
						str += '<div class="form-group">';
						str += '	<label>' + varName + '</label>';
						str += '	<textarea class="form-control">' + scope[varName] + '</textarea>';
						str += '</div>';

						//do binding of input element and variable
						var $formGroup = $(str);
						$formGroup.attr('rel', varName);
						$formGroup.find('textarea').on({
							keyup: function(){
								var scope = angular.element($('#' + id )).scope();
								var val = $(this).val();
								var varName = $(this).parent().attr('rel');

								scope.$apply(function(){
									scope[varName] = val;
						    	});
							},
							change: function(){
								var scope = angular.element($('#' + id )).scope();
								var val = $(this).val();
								var varName = $(this).parent().attr('rel');

								scope.$apply(function(){
									scope[varName] = val;
						    	});
							}
						});

		        		$('#' + id + ' .variables-container .error').remove();
						//append this form to group
						$('#' + id + ' .variables-container').append($formGroup);
					}
				}
			});
		},
		setPageMenuItems: function(){
			$('.page').each(function(){
				var title = $(this).attr('title');
				var id = $(this).attr('id');
				var $link = $("<li><a href='#'>" + id + "</a></li>");
				$link.find('> a').on({
					click: function(){
						var target = $(this).html();
						vs.showPage(target);

						$('.navbar-toggle').trigger('click');
					}
				});
				$('#pages-menu > ul').append($link);
			});
		}
	}
};