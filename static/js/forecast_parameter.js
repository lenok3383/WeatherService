var frm = $('#param_form');
frm.submit(function() {
    $("#parameter_error_msg").css('display', 'none');
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),
        success: function(data) {
            if (data['form_valid']) {
                $.ajax({
                    type: 'GET',
                    url: "/history/",
                    success: function(data) {
                        cleanAllElementChild('history_table');
                        historyJsonAsTable(data);
                        cleanAllElementChild('pagination');
                        historyPagination(data);
                    }
                });
                forecastById(data['forecast_id']);
            }
            else {
                $("#parameter_error_msg").html(data['error_msg'][0]).css(
                    'display', 'block');
            }
        }
    });
    return false;
});