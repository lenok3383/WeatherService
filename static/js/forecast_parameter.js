var frm = $('#param_form');
frm.submit(function () {
    $("#parameter_error_msg").css('display', 'none');
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),
        success: function (data) {
            if (data.form_valid){
                $.ajax({
                    type: 'GET',
                    url: "/history/",
                    success: function (data) {
                        $("#history_div").html(history_json_as_table(data['history']));
                    }
                });
                forecast_by_id(data.forecast_id);
            }
            else {
                $("#parameter_error_msg").html(data.error_msg[0]);
                $("#parameter_error_msg").css('display', 'block')
            }
        }
    });
    return false;
});