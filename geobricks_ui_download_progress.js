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
            tab_id: null,
            timers_map: {},
            url_progress: 'http://localhost:5555/download/progress/'
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
            view = {
                progress_id: this.CONFIG.files_to_be_downloaded[i].file_name,
                progress_label: this.CONFIG.files_to_be_downloaded[i].file_name
            };
            render = Mustache.render(template, view);
            $('#' + this.CONFIG.tab_id).append(render);
        }

        /* Show the first tab. */
        $(this.tab_headers.find('a')[1]).tab('show');

    };

    UI_DLWD_PROGRESSS.prototype.update_progress_bar = function(downloader_id, downloaded_file) {

        /* Create progress URL. */
        var url = this.CONFIG.url_progress + downloader_id + '/' + downloaded_file + '/';
        var _this = this;

        /* Set monitor interval. */
        this.CONFIG.timers_map[downloaded_file] = setInterval(function() {

            $.ajax({

                url: url,
                type: 'GET',
                success: function (response) {

                    try {

                        /* Cast the response to JSON, if needed. */
                        var json = response;
                        if (typeof json == 'string')
                            json = $.parseJSON(response);

                        /* Update progress bar. */
                        var p = parseFloat(json.progress);
                        if (!isNaN(p)) {
                            var p_bar = $(document.getElementById(json.file_name));
                            p_bar.css('width', json.progress + '%');
                            p_bar.attr('aria-valuenow', json.progress);
                            var p_report = '(' + parseFloat(json.download_size / 1000000).toFixed(2);
                            p_report += ' / ' + parseFloat(json.total_size / 1000000).toFixed(2) + ') MB';
                            document.getElementById('download_report_' + json.file_name).innerHTML = p_report;
                        }

                        /* Clear the interval when the download is complete. */
                        try {
                            if (json.status == 'COMPLETE' || parseInt(json.progress == 100)) {
                                clearInterval(_this.CONFIG.timers_map[json.file_name]);
                                p_bar.removeClass('progress-bar-warning').addClass('progress-bar-success');
                            }
                        } catch (e) {

                        }

                    } catch (e) {

                    }

                }

            });

        }, 1000);

    };

    return new UI_DLWD_PROGRESSS();
    
});
