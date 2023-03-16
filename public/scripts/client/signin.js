define([], function () {
    const signIn = {};

    signIn.initialize = function () {

        $('.password-show-toggle').on('click', function () {
            $(this).find('i').toggleClass('fa-eye-slash');

            $('#password-input').attr('type', function(index, attr){
                return attr == 'password' ? null : 'password';
            });
        });
    }

    return signIn;
});