<template>
    <header class="flex flex-row justify-between p4">
        <router-link to="/player">ARBEITSTITEL</router-link>
        <button type="button" id="open-menu" ref="openMenu" class="btn btn-icon-only p0" aria-label="Open Navigation Menu" :aria-expanded="isNavigationMenuOpen" @click="openMenu">
            <span class="sr-only">Menu </span>
            <span class="icon" v-html="icons.menu"></span>
        </button>
        <nav id="menu" ref="menu" class="modal p4" :class="isNavigationMenuOpen ? 'open' : null" aria-label="Navigation Menu content">
            <button id="close-menu" ref="closeMenu" class="btn btn-icon-only p0 mb8" aria-label="Hide Navigation Menu" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                <span class="sr-only">Close </span>
                <span class="icon" v-html="icons.close"></span>
            </button>
            <ul>
                <li>
                    <router-link accesskey="h" to="/" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        Home
                    </router-link>
                </li>
                <li>
                    <router-link accesskey="a" to="about" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        About
                    </router-link>
                </li>
                <li>
                    <router-link accesskey="l" to="logout" :tabindex="isNavigationMenuOpen ? 0 : -1" @click="closeMenu">
                        Logout
                    </router-link>
                </li>
            </ul>
        </nav>
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