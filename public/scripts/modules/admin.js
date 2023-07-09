$(document).ready(function () {
   attachEvents();
});

function attachEvents() {
    // Custom redirection for sidebar
    $('[data-href]').on('click', function() {
        const {href} = $(this).data();
        location.href = href;
    })
}