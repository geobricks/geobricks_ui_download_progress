define(['jquery',
        'mustache',
        'text!geobricks_ui_download_progress/html/templates.html',
        'i18n!geobricks_ui_download_progress/nls/translate',
        'sweet-alert',
        'bootstrap'], function ($, Mustache, templates, translate) {

    'use strict';

    function UI_DLWD_PROGRESS() {

        this.CONFIG = {
            lang: 'en',
            placeholder_id: 'placeholder',
            files_to_be_downloaded: null,
            tab_label: null,
            tab_id: null,
            timers_map: {},
            progress_interval: 1000,
            url_progress: 'http://localhost:5555/download/progress/'
        };

    }

    /**
     * This is the entry method to configure the module.
     *
     * @param config Custom configuration in JSON format to extend the default settings.
     */
    UI_DLWD_PROGRESS.prototype.init = function(config) {

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

    UI_DLWD_PROGRESS.prototype.create_progress_bar_tab = function() {

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
            console.debug(this.CONFIG.files_to_be_downloaded[i].file_name);
            render = Mustache.render(template, view);
            $('#' + this.CONFIG.tab_id).append(render);
        }

        /* Show the first tab. */
        $(this.tab_headers.find('a')[1]).tab('show');

    };

    UI_DLWD_PROGRESS.prototype.remove_old_tabs = function() {
        this.tab_headers = $('#tab_headers');
        this.tab_contents = $('#tab_contents');
        var tabs_size = this.tab_headers.find('li').length;
        for (var i = tabs_size ; i >= 2 ; i--)
            this.tab_headers.find('li:nth-child(' + i + ')').remove();
        tabs_size = this.tab_contents.find('.tab-pane').length;
        for (i = tabs_size ; i >= 2 ; i--)
            this.tab_contents.find('.tab-pane:nth-child(' + i + ')').remove();
    };

    UI_DLWD_PROGRESS.prototype.update_progress_bar = function(downloader_id, downloaded_file) {

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
                            var p_bar = $(document.getElementById(downloaded_file));
                            p_bar.css('width', json.progress + '%');
                            p_bar.attr('aria-valuenow', json.progress);
                            var p_report = '(' + parseFloat(json.download_size / 1000000).toFixed(2);
                            p_report += ' / ' + parseFloat(json.total_size / 1000000).toFixed(2) + ') MB';
                            $(document.getElementById('download_report_' + downloaded_file)).html(p_report);
                        }

                        /* Clear the interval when the download is complete. */
                        try {
                            if (json.status == 'COMPLETE') {
                                clearInterval(_this.CONFIG.timers_map[downloaded_file]);
                                _this.CONFIG.timers_map[downloaded_file] = null;
                                _this.on_progress_complete(json.target_dir, Object.keys(_this.CONFIG.timers_map));
                                p_bar.removeClass('progress-bar-warning').addClass('progress-bar-success');
                            }
                        } catch (e) {
                            sweetAlert({
                                title: translate.error,
                                text: e,
                                type: 'error',
                                confirmButtonColor: '#379BCE'
                            });
                        }

                    } catch (e) {
                        /* JSON is null for the first iterations: skip alert. */
                    }

                }

            });

        }, this.CONFIG.progress_interval);

    };

    UI_DLWD_PROGRESS.prototype.on_progress_complete = function(target_dir, filenames) {
        var timers = Object.keys(this.CONFIG.timers_map).length;
        var count = 0;
        for (var key in this.CONFIG.timers_map)
            if (this.CONFIG.timers_map[key] == null)
                count++;
        if (count == timers)
            this.on_progress_complete_action(target_dir, filenames);
    };

    UI_DLWD_PROGRESS.prototype.on_progress_complete_action = function(target_dir, filenames) {
        sweetAlert({
            title: translate.operation_complete,
            text: filenames.join('\n'),
            type: 'info',
            confirmButtonColor: '#379BCE'
        });
    };

    return UI_DLWD_PROGRESS;
    
});
