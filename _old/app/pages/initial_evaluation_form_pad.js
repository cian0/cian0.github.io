app.modules.initial_evaluation_form_pad = {

    init: function(vars){

        // row indices under details array.
        var MEDICATION = 0;
        var CLAUDICATION_PAIN_SCALE = 1;
        var response = api.get('fetchEvaluationFormDetails', {
            "patient_info_id" : "1"
        });
        var formDetails = {};
        var claudicationPainScaleValues = ['No Pain', 'Onset of Pain', 'Mild Pain', 'Moderate Pain', 'Sever Pain'];

        var removeMedication = function (medication) {
            console.log('removing ' + medication.medicine);

            var initial_evaluation_form = response.initial_evaluation_form;

            var medications = initial_evaluation_form.medicationsList;

            var index = medications.indexOf(medication);
            medications.splice(index, 1);
        };

        var addMedication = function () {

            var initial_evaluation_form = response.initial_evaluation_form;

            var medications = initial_evaluation_form.medicationsList;
            medications.push({
                "medicine" : "",
                "dosage" : "",
                "frequency" : ""
            });
        };

        var removeEmptyMedications = function () {
            var initial_evaluation_form = response.initial_evaluation_form;

            var medications = initial_evaluation_form.medicationsList;

            var newMedications = [];

            for (var i = 0; i < medications.length; i++) {
                var medication = medications[i];
                if (medication.medicine.trim().length > 0) {
                    newMedications.push(medication);
                }
            }
            initial_evaluation_form.medicationsList = newMedications;
        };

        if(response){
            switch(response.response.code){
                case '00':

                    response.initial_evaluation_form    = processFormData(response.initial_evaluation_form);
                    response.final_evaluation_form      = processFormData(response.final_evaluation_form);

                    vs.setVars({
                        clinical_diagnosis: response.clinical_diagnosis,
                        patient_info: response.patient_info,
                        initial_evaluation_form: response.initial_evaluation_form,
                        final_evaluation_form: response.final_evaluation_form,
                        removeMedication: removeMedication,
                        addMedication: addMedication,
                        removeEmptyMedications: removeEmptyMedications,
                        formDetails: formDetails
                    });

                break;
                case '99':
                case '01':
                case '02':
                case '201':
                    app.commons.showDialog({
                        body: response.response.message
                    })
                break;
            }                       
        }
    
        vs.setVarsByControllerID('template', {
            title: "The PAD Kit: Supervised Therapeutic Exercise Program",
            main_css_path: 'app/pages/initial_evaluation_form_pad.css'
        });

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

        /* Julius' code */

        $('#sidebar-scrollspy li:nth-of-type(1) ul').css('display','block');
        $('.initial_eval').css('display','block');


        function processFormData(formData){

            for(var i = 0; i < formData.details.length; i++){

                var values = formData.details[i].values;
                var id = formData.details[i].id;
                var title = formData.details[i].title;
                var type = formData.details[i].type;
                
                
                var detail = {};

                detail.type = type;
                detail.title = title;
                
                switch (type) {
                 case 'free_text' : 
                     if (values.length > 0) {
                         detail.value = values[0];
                     } else {
                         detail.value = null;
                     }
                 break;

                 case 'radio_selection' :
                     if (values.length > 0) {
                         detail.value = values[0];
                     } else {
                         detail.value = null;
                     }
                 break;

                 case 'dynamic_list' :
                        
                 break;

                 case 'static_list':

                 break;

                 default:
                 console.log('type ' + type + ' not handled.')

                }

                formDetails[id] = detail;



                switch (id) {
                    case 'medications':
                        var medications = [];
                        for (var j = 0; j < values.length; j++) {
                            var splitted = values[j].split('|'); //split by pipe
                            if (j > 0) { // 0 index is always reserved for header of values
                                var medication = {
                                    "medicine" : splitted[0],
                                    "dosage" : splitted[1],
                                    "frequency" : splitted[2]
                                };

                                medications.push(medication);
                            }
                        }

                        console.log(medications);

                        formData.medicationsList = medications;
                    break;
                    case 'claudication_pain_scale':

                        var value = "";
                        var indexVal = -1; 
                        if (values.length > 0) {
                            value = values[0];
                            var claudicationPainScaleValue;
                            formData.details[i].valuesObject;

                            indexVal = claudicationPainScaleValues.indexOf(value);
                            console.log('selected: ' + indexVal);
                        }


                        console.log(medications);

                        formData.selectedClaudicationPainScale = indexVal ;//value;
                    break;
                    case 'predicted_distance_walk':



                        // formData.predictedDistanceWalk = {
                        //     pred_dist_walk_ft : {
                        //         value: 0,
                        //         unit_of_measurement: 'feet'
                        //     },

                        // };
                    break;
                    //switch for another id here
                }
            }

            return formData;
        }
    }
}

// Add/Delete rows for medication
function addNewRow(btn) {
    var medication = {
        "medicine" : "",
        "dosage" : "",
        "frequency" : ""
    };
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