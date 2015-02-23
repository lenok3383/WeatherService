window.onload=function() {
    $.ajax({
        type: "GET",
        url: "/history/",
        success: function (data) {
            historyJsonAsTable(data);
            historyPagination(data);
        },
        error: function () {
            showErrorMsg("Something wrong. Please reload page.");
        }
    });
    $.ajax({
        type: 'GET',
        url: "/weather/",
        success: function (data) {
            $("#parameter_div").html(data)
        },
        error: function () {
            showErrorMsg("Something wrong. Please reload page.");
        }
    });
};