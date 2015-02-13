var frm = $('#param_form');
frm.submit(function () {
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),
        success: function (data) {
            console.log(data);
            var tmp = JSON.parse(data);
            console.log("form_valid:",tmp.form_valid);
            if (tmp.form_valid){
                console.log('valid run');
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