var root = '../modules/';

define(['jquery',
        'mustache',
        'text!' + root + 'geobricks_ui_download_progress/html/templates.html',
        'i18n!' + root + 'geobricks_ui_download_progress/nls/translate',
        'bootstrap'], function ($, Mustache, templates, translate) {

    'use strict';

    function UI_DLWD_PROGRESSS() {

        this.CONFIG = {
            lang: 'en',
            placeholder_id: 'placeholder',
            files_to_be_downloaded: null,
            tab_label: null,
            tab_id: null
        };

    }

    /**
     * This is the entry method to configure the module.
     *
     * @param config Custom configuration in JSON format to extend the default settings.
     */
    UI_DLWD_PROGRESSS.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'en';

        /* Store selectors. */
        this.tab_headers = $('#tab_headers');
        this.tab_contents = $('#tab_contents');

        /* Create progress bar. */
        console.debug(this.CONFIG.files_to_be_downloaded);
        this.create_progress_bar_tab();
        
    };

    UI_DLWD_PROGRESSS.prototype.create_progress_bar_tab = function() {

        /* Render the tab header. */
        var template = $(templates).filter('#tab_header').html();
        var view = {
            href: this.CONFIG.tab_id,
            tab_label: this.CONFIG.tab_label
        };
        var render = Mustache.render(template, view);
        this.tab_headers.append(render);

        /* Render the tab content. */
        template = $(templates).filter('#progress_tab_content').html();
        view = {
            id: this.CONFIG.tab_id
        };
        render = Mustache.render(template, view);
        this.tab_contents.append(render);

        /* Create a progress bar for each file to be downloaded. */
        for (var i = 0 ; i < this.CONFIG.files_to_be_downloaded.length ; i++) {
            template = $(templates).filter('#progress').html();
            view = {};
            render = Mustache.render(template, view);
            $('#' + this.CONFIG.tab_id).append(render);
        }

        /* Show the first tab. */
        this.tab_headers.find('a:nth-child(1)').tab('show');

    };

    return new UI_DLWD_PROGRESSS();
    
});
