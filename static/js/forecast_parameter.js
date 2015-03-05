var frm = $('#param_form');
frm.submit(function() {
    $("#parameter_error_msg").css('display', 'none');
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),
        success: function(data) {
            if (data['form_valid']) {
                historyPage.loadHistoryPage();
                forecast.forecastById(data['forecast_id']);
                temperatureDynamic(data['city']);
            }
            else {
                $("#parameter_error_msg").html(data['error_msg'][0]).show();
            }
        },
        error: function (data) {
            $("#parameter_error_msg").html("Oops.. " + data.statusText ).show();
        }
    });
    return false;
});