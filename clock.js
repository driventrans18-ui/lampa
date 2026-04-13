(function () {
    'use strict';

    function startPlugin() {
        window.clock_plugin = true;

        function pad(n) {
            return n < 10 ? '0' + n : '' + n;
        }

        function formatTime(date, withSeconds) {
            var h = pad(date.getHours());
            var m = pad(date.getMinutes());
            if (withSeconds) {
                var s = pad(date.getSeconds());
                return h + ':' + m + ':' + s;
            }
            return h + ':' + m;
        }

        function addPlugin() {
            Lampa.Lang.add({
                clock_plugin_title: {
                    en: 'Clock',
                    ru: 'Часы',
                    uk: 'Годинник',
                    be: 'Гадзіннік',
                    bg: 'Часовник',
                    cs: 'Hodiny',
                    pt: 'Relógio',
                    zh: '时钟'
                },
                clock_plugin_show: {
                    en: 'Show clock',
                    ru: 'Показывать часы',
                    uk: 'Показувати годинник',
                    be: 'Паказваць гадзіннік',
                    bg: 'Показване на часовник',
                    cs: 'Zobrazit hodiny',
                    pt: 'Mostrar relógio',
                    zh: '显示时钟'
                },
                clock_plugin_show_descr: {
                    en: 'Display a clock in the header',
                    ru: 'Отображать часы в шапке приложения',
                    uk: 'Показувати годинник у шапці застосунку',
                    be: 'Паказваць гадзіннік у шапцы праграмы',
                    bg: 'Показване на часовник в заглавието',
                    cs: 'Zobrazit hodiny v záhlaví',
                    pt: 'Exibir um relógio no cabeçalho',
                    zh: '在标题栏显示时钟'
                },
                clock_plugin_seconds: {
                    en: 'Show seconds',
                    ru: 'Показывать секунды',
                    uk: 'Показувати секунди',
                    be: 'Паказваць секунды',
                    bg: 'Показване на секунди',
                    cs: 'Zobrazit sekundy',
                    pt: 'Mostrar segundos',
                    zh: '显示秒钟'
                }
            });

            Lampa.SettingsApi.addComponent({
                component: 'clock_plugin',
                name: Lampa.Lang.translate('clock_plugin_title'),
                icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'clock_plugin',
                param: {
                    name: 'clock_plugin_show',
                    type: 'trigger',
                    'default': true
                },
                field: {
                    name: Lampa.Lang.translate('clock_plugin_show'),
                    description: Lampa.Lang.translate('clock_plugin_show_descr')
                },
                onChange: function () {
                    render();
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'clock_plugin',
                param: {
                    name: 'clock_plugin_seconds',
                    type: 'trigger',
                    'default': false
                },
                field: {
                    name: Lampa.Lang.translate('clock_plugin_seconds')
                },
                onChange: function () {
                    render();
                }
            });

            var css = $('style#clock_plugin_css');
            if (!css.length) {
                css = $('<style type="text/css" id="clock_plugin_css"></style>');
                css.appendTo('head');
            }
            css.html(
                '.clock-plugin{display:inline-flex;align-items:center;justify-content:center;' +
                'padding:0 0.9em;margin-left:0.8em;height:2.2em;border-radius:0.6em;' +
                'background:rgba(255,255,255,0.08);font-size:1.3em;font-weight:600;' +
                'letter-spacing:0.04em;color:#fff;vertical-align:middle;min-width:3.6em;' +
                'font-variant-numeric:tabular-nums;}' +
                '.head .clock-plugin{margin-right:0.4em;}'
            );

            var timer = null;
            var $clock = null;

            function mount() {
                if ($clock && $clock.length && document.body.contains($clock[0])) return;
                var $head = $('.head');
                if (!$head.length) return;
                $clock = $('<div class="clock-plugin"></div>');
                var $actions = $head.find('.head__actions');
                if ($actions.length) $actions.prepend($clock);
                else $head.append($clock);
            }

            function unmount() {
                if ($clock) {
                    $clock.remove();
                    $clock = null;
                }
            }

            function tick() {
                if (!$clock || !$clock.length) return;
                var withSeconds = Lampa.Storage.field('clock_plugin_seconds');
                $clock.text(formatTime(new Date(), withSeconds));
            }

            function schedule() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                var withSeconds = Lampa.Storage.field('clock_plugin_seconds');
                var now = new Date();
                var delay;
                if (withSeconds) {
                    delay = 1000 - now.getMilliseconds();
                } else {
                    delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
                }
                if (delay < 50) delay = 50;
                timer = setTimeout(function () {
                    tick();
                    schedule();
                }, delay);
            }

            function render() {
                var enabled = Lampa.Storage.field('clock_plugin_show');
                if (enabled) {
                    mount();
                    tick();
                    schedule();
                } else {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    unmount();
                }
            }

            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') render();
            });

            // Re-attach clock after activity changes (header may be re-rendered)
            Lampa.Listener.follow('activity', function (e) {
                if (e.type === 'archive' || e.type === 'start' || e.type === 'push') {
                    setTimeout(render, 50);
                }
            });

            render();
        }

        if (window.appready) addPlugin();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') addPlugin();
            });
        }
    }

    if (!window.clock_plugin) startPlugin();
})();
