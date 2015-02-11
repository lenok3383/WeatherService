/**
 * Created by andy on 11.02.15.
 */
function nextPage(){
    var current_page = Number($('span.current').attr("currp"));
    var max_page = Number($('span.current').attr("maxp"));
        $.ajax({
            type: 'GET',
            url: '/history/',
            data: {page: (current_page + 1)},
            success: function (data) {
                $("#history_div").html(data)
            }
        });
    }

function prevPage(){
    var current_page = Number($('span.current').attr("currp"));
    var max_page = Number($('span.current').attr("maxp"));
    $.ajax({
        type: 'GET',
        url: '/history/',
        data: {page: (current_page - 1)},
        success: function (data) {
            $("#history_div").html(data)
            }
        });
}


function forecast_by_id(id){
    $.ajax({
        url: "/forecast/" + String(id) + "/",
        success: function (forecast)
        {
             $("#forecast_div").html(forecast);
        }
    });
}
function submit_parameter_form() {
    var frm = $('#param_form');
    frm.submit(function () {
        $.ajax({
            type: frm.attr('method'),
            url: frm.attr('action'),
            data: frm.serialize(),
            success: function (data) {
                var tmp = JSON.parse(data);
                if (tmp.form_valid) {
                    forecast_by_id(tmp.forecast_id);
                    $.get("/history/", function (data) {
                        $("#history_div").html($(data).filter(".history_div"));
                    });
                }

            }
        });
        return false;
    });
}