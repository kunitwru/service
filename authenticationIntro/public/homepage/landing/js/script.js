function showFormLogin() {
    $('#VawayIDModalLogin').show();
}
function processSignin() {
    let passWord = $('#log-password').val();
    let email = $('#log-username').val();
    $.ajax({
        type: 'POST',
        url: "/login",
        data: {
            logemail: email,
            logpassword: passWord
        },
        dataType: 'json',
        success: function (data, xhr) {
            console.log(data, xhr);
        },
        error: function (xhr, error) {
            console.log(error, xhr);
        }
    })
}