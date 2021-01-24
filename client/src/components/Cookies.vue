<template>
    <!-- TODO: Add Focus Trap -->
    <!-- TODO: Add Cookie Handling -->
    <!-- TODO: Add Matomo Tracking -->
    <!-- TODO: Add Style -->
    <article ref="cookieModal" class="modal" :class="isCookieModalOpen ? 'open' : null" aria-label="Cookie Modal content">
        <section class="w-limited flex flex-row justify-between pt4 px4">
            <h2 class="text-m">Cookie Consent</h2>
        </section>
        <section class="w-limited p4">
            <p class="text-xs mb3">This website is using cookies. In addition to technically necessary ones, it is also setting cookies that enable statistical evaluations or personalization of your user experience. You can view, change and withdraw your consent at any time. Find out more about this <router-link to="data-privacy">here.</router-link></p>

            <div class="text-xs mb3">
                <input ref="checkboxCookiesNecessary" id="cookie-category_necessary" class="cookie-category_checkbox" type="checkbox" v-model="cookies.necessary.allow" disabled>
                <label class="mr4" for="cookie-category_necessary" tabindex="-1">Necessary</label>

                <input ref="checkboxCookiesStatistics" id="cookie-category_statistics" class="cookie-category_checkbox" type="checkbox"  v-model="cookies.statistics.allow">
                <label for="cookie-category_statistics" tabindex="0" @keyup.enter="cookies.statistics.allow = !cookies.statistics.allow" @keyup.space="cookies.statistics.allow = !cookies.statistics.allow">Statistics</label>
            </div>

            <button ref="saveCookieSettings" class="btn" type="button" @click="saveCookieSettings">Agree</button>
        </section>
    </article>
</template>

<script>
    import { createFocusTrap } from 'focus-trap';
    import { getCookie, setCookie } from '@/utils/index.js';

    export default {
        data() {
            return {
                STATISTICS_SCRIPT_ID: 'matomo-tracking',
                focusTrap: undefined,
                isCookieModalOpen: false,
                statisticsActive: false,
                cookies: {
                    necessary: {
                        name: 'NECESSARY_COOKIES_ALLOWED',
                        allow: true,
                        value: undefined,
                    },
                    statistics: {
                        name: 'STATISTICAL_COOKIES_ALLOWED',
                        allow: true,
                        value: undefined,
                    },
                },
                icons: {
                    close: require('@/assets/img/icons/close-24px.svg').default,
                },
            };
        },
        methods: {
            openCookieModal() {
                this.isCookieModalOpen = true;
                this.$nextTick(() => {
                    this.focusTrap.activate();
                    this.$refs.saveCookieSettings.focus();
                });
            },
            closeCookieModal() {
                this.isCookieModalOpen = false;
                this.focusTrap.deactivate();
            },
            resetCookies() {
                for (const [key, cookie] of Object.entries(this.cookies)) {
                    // Reset each cookie
                    setCookie(cookie.name, cookie.allow);
                    // And reset each cookies stored value
                    cookie.value = cookie.allow;
                }
            },
            enableStatistics(boolean) {
                if (boolean) {
                    if (!this.statisticsActive) {
                        let _paq = null;
                        if (!window._paq) window._paq = [];
                        _paq = window._paq;
                        _paq.push(['setDocumentTitle', `${document.domain} // ${document.title}`]);
                        _paq.push(['setDomains', ['*.intelligent-song-picker.com']]);
                        _paq.push(["setDoNotTrack", true]);
                        _paq.push(['trackPageView']);
                        _paq.push(['enableLinkTracking']);
                        _paq.push(['enableHeartBeatTimer']);
                        (() => {
                            const u = 'https://matomo.florian-kapaun.de/';
                            _paq.push(['setTrackerUrl', `${u}matomo.php`]);
                            _paq.push(['setSiteId', '2']);
                            const d = document;
                            const g = d.createElement('script');
                            g.id = this.STATISTICS_SCRIPT_ID;
                            const s = d.getElementsByTagName('script')[0];
                            g.type = 'text/javascript';
                            g.async = true;
                            g.defer = true;
                            g.src = `${u}matomo.js`;
                            s.parentNode.insertBefore(g, s);
                        })();
                    }
                    this.statisticsActive = true;
                } else {
                    if (window._paq) delete window._paq;
                    (() => {
                        const d = document;
                        const g = d.getElementById(this.STATISTICS_SCRIPT_ID);
                        if (g) g.remove();
                    })();
                    this.statistics = false;
                }
            },
            saveCookieSettings() {
                this.closeCookieModal();
                this.resetCookies();
                this.enableStatistics(this.cookies.statistics.allow && this.cookies.statistics.value);
            },
        },
        mounted() {
            // Setup focus trap for cookie modal
            this.focusTrap = createFocusTrap(this.$refs.cookieModal, {
                onDeactivate: () => {
                    if (this.isCookieModalOpen) this.closeCookieModal();
                },
            });
            // Check for previously defined cookie settings
            const setValues = [];
            for (const [key, cookie] of Object.entries(this.cookies)) {
                const cookieValue = getCookie(cookie.name);
                if (cookieValue) setValues.push(cookieValue);
                cookie.value = cookieValue && cookieValue !== 'false' ? true : false;
            }
            // Try to enable statistics on mount
            this.enableStatistics(this.cookies.statistics.allow && this.cookies.statistics.value);
            // Only open the cookie modal if there were no values set previously
            if (setValues.length === 0) this.openCookieModal();
        },
    };
</script>

<style lang="css" scoped>
    .modal {
        top: unset;
    }

    .cookie-category_checkbox{
        display: none;
    }

    input[type=checkbox].cookie-category_checkbox + label {
        text-transform: lowercase;
        padding-left: 1.2rem;
        background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBmaWxsPSIjMTgxODE4IiBkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjwvc3ZnPg==);
        background-repeat: no-repeat;
        background-size: auto 0.9rem;
        background-position: 0 0.07rem;
        cursor: pointer;
    }

    input[type=checkbox]:checked.cookie-category_checkbox + label {
        background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBmaWxsPSIjMTgxODE4IiBkPSJNOSAxNi4yTDQuOCAxMmwtMS40IDEuNEw5IDE5IDIxIDdsLTEuNC0xLjRMOSAxNi4yeiIvPjwvc3ZnPg==);
    }
</style>