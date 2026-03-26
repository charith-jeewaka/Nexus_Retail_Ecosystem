// 1. THE DICTIONARY
const translations = {
    "en": {
        "nav_overview": "Dashboard",
        "welcome": "Welcome Back!",
        "btn_add_cart": "Add to Cart"
    },
    "si": {
        "nav_overview": "වෙළඳසැල",
        "btn_add_cart": "කරත්තයට එක් කරන්න"
    }
};

$(document).ready(function() {

    // 2. Check Local Storage for saved language (Default to English)
    let currentLang = localStorage.getItem("nexus_lang") || "en";
    applyLanguage(currentLang);

    // 3. The Toggle Button Click Event
    $(document).on('click', '#btn-toggle-lang', function() {
        // Swap the language
        currentLang = (currentLang === "en") ? "si" : "en";

        // Save it so it remembers their choice tomorrow!
        localStorage.setItem("nexus_lang", currentLang);

        // Update the screen
        applyLanguage(currentLang);
    });

    // 4. The magic function that changes the text
    function applyLanguage(lang) {
        let dict = translations[lang];

        // Update the button text so they know what they are switching TO
        $('#btn-toggle-lang').text(lang === "en" ? "SN" : "EN");

        // Find every element with a data-i18n attribute and swap its text
        $('[data-i18n]').each(function() {
            let key = $(this).data('i18n');
            if (dict[key]) {
                $(this).text(dict[key]);
            }
        });

        // Find every element with a data-i18n-placeholder attribute
        $('[data-i18n-placeholder]').each(function() {
            let key = $(this).data('i18n-placeholder');
            if (dict[key]) {
                $(this).attr("placeholder", dict[key]);
            }
        });
    }
});