app.modules.wait_in_queue = {

	init: function(vars){

		buttonWait();
		buttonCallBack();
		
		function buttonWait(){
			$('#wait_in_queue_button_wait').on({
				click: function(){
					alert("No Action Yet");
				}
			});
		}

		function buttonCallBack(){
			$('#wait_in_queue_button_call_back').on({
				click: function(){
					vs.display('schedule_call_back',{
						scheduledDate: "October 22, 2014",
						scheduledTime: "9:00 AM"
					});

					//sendAppEvent("app.numberofcats.next_touch", "NumberOfCats", null);
				}
			});
		}
	}
}