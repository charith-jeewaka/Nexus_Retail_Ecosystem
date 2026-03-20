$(document).ready(function () {

    $(document).on('pageLoaded', function (event , pageName) {
        if (pageName === 'customer-dashboard') {

            window.navigateTo('shop')
        }
    })
})