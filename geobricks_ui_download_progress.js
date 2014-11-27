var root = '../modules/';

define(['jquery',
        'mustache',
        'text!' + root + 'geobricks_ui_download_progress/html/templates.html',
        'i18n!' + root + 'geobricks_ui_download_progress/nls/translate',
        'bootstrap'], function ($, Mustache, templates, translate) {

    'use strict';

    function UI_MODIS() {

        this.CONFIG = {
            lang: 'en',
            placeholder_id: 'placeholder'
        };

    }

    /**
     * This is the entry method to configure the module.
     *
     * @param config Custom configuration in JSON format to extend the default settings.
     */
    UI_MODIS.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'en';
        
    }
    
});
