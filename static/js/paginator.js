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
