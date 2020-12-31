<template>
    <header class="flex flex-row justify-between p4">
        <router-link to="/player">ARBEITSTITEL</router-link>
        <button type="button" id="open-menu" ref="openMenu" class="btn btn-icon-only p0" aria-label="Open Navigation Menu" :aria-expanded="isNavigationMenuOpen" @click="openMenu">
            <span class="sr-only">Menu </span>
            <span class="icon" v-html="icons.menu"></span>
        </button>
        <article id="menu" ref="menu" class="flex flex-col justify-between modal p4" :class="isNavigationMenuOpen ? 'open' : null" aria-label="Navigation Menu content">
            <section>
                <button id="close-menu" ref="closeMenu" class="btn btn-icon-only p0 mb8" aria-label="Hide Navigation Menu" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                    <span class="sr-only">Close </span>
                    <span class="icon" v-html="icons.close"></span>
                </button>
                <nav class="flex flex-col align-center text-xl text-center">
                    <router-link accesskey="h" to="/" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        Home
                    </router-link>
                    <router-link accesskey="a" to="about" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        About
                    </router-link>
                    <router-link accesskey="l" to="logout" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        Logout
                    </router-link>
                </nav>
            </section>
            <section class="flex flex-row flex-wrap justify-between align-center text-xs">
                <router-link class="pr2" accesskey="i" to="imprint" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                    Imprint
                </router-link>
                <p class="pr2">
                    © 2020 <a href="https://florian-kapaun.de" target="_blank" accesskey="f" :tabindex="isNavigationMenuOpen ? 0 : -1">Florian Kapaun</a>
                </p>
                <router-link accesskey="d" to="data-privacy" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                    Data privacy
                </router-link>
            </section>
        </article>
    </header>
</template>

<script>
import { createFocusTrap } from 'focus-trap';

export default {
    data() {
        return {
            focusTrap: undefined,
            isNavigationMenuOpen: false,
            icons: {
                menu: require('@/assets/img/icons/menu-24px.svg').default,
                close: require('@/assets/img/icons/close-24px.svg').default,
            }
        };
    },
    methods: {
        openMenu() {
            this.isNavigationMenuOpen = true;
            this.$nextTick(() => {
                this.focusTrap.activate();
                this.$refs.closeMenu.focus();
            });
        },
        closeMenu() {
            this.isNavigationMenuOpen = false;
            this.focusTrap.deactivate();
            this.$refs.openMenu.focus();
        },
    },
    mounted() {
        this.focusTrap = createFocusTrap(this.$refs.menu, {
            onDeactivate: () => {
                if (this.isNavigationMenuOpen) this.closeMenu();
            },
        });
    },
};
</script>