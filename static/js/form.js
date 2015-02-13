var frm = $('#param_form');
frm.submit(function () {
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
                $("#parameter_div").html(data);
            }

        }
    });
    return false;
});