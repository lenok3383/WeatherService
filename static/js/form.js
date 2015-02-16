var frm = $('#param_form');
frm.submit(function () {
    $("#parameter_error_msg").css('display', 'none');
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),
        success: function (data) {
            var tmp = JSON.parse(data);
            if (tmp.form_valid){
                $.ajax({
                    type: 'GET',
                    url: "/history/",
                    success: function (data) {
                        $("#history_div").html(data);
                    }
                });
                forecast_by_id(tmp.forecast_id);
            }
            else {
                $("#parameter_error_msg").html(tmp.error_msg[0]);
                $("#parameter_error_msg").css('display', 'block')
            }

        }
    });
    return false;
});