window.onload=function() {
    $.ajax({
        type: "GET",
        url: "/history/",
        success: function (data) {
            historyJsonAsTable(data);
            historyPagination(data);
        }
    });
    $.ajax({
        type: 'GET',
        url: "/weather/",
        success: function (data) {
            $("#parameter_div").html(data)
        }
    });
};