<template>
  <v-app class="site-app">
    <v-navigation-drawer
      v-model="drawer"
      class="site-drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      width="260"
    >
      <NuxtLink class="brand-lockup" to="/">
        <span class="brand-icon"><v-icon icon="mdi-leaf" /></span>
        <span>
          <strong>System Integration</strong>
          <small>SMART TOOLS, SIMPLIFIED</small>
        </span>
      </NuxtLink>

      <div class="drawer-label">WORKSPACE</div>
      <v-list class="nav-list" nav>
        <v-list-item prepend-icon="mdi-view-dashboard-outline" title="Dashboard" to="/" />
        <v-list-item prepend-icon="mdi-qrcode-scan" title="QR Scanner" to="/qr-scanner" />
        <v-list-item prepend-icon="mdi-weather-partly-cloudy" title="Weather" to="/weather" />
      </v-list>

      <template #append>
        <div class="drawer-note">
          <v-icon icon="mdi-shield-check-outline" />
          <span>Tools made for everyday work.</span>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar class="site-bar" flat>
      <v-app-bar-nav-icon
        class="menu-button"
        aria-label="Toggle navigation"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>System Integration</v-toolbar-title>
      <v-spacer />
      <div class="bar-status"><span /> All systems ready</div>
    </v-app-bar>

    <v-main class="site-main">
      <v-container class="page-container" fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const drawer = ref(true)
const { mdAndUp } = useDisplay()
</script>

<style scoped>
.site-app {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 88% 0%, rgba(196, 230, 182, .3), transparent 28%),
    #f3f8f1;
}

.site-drawer {
  background: #fff;
  border-right: 1px solid #e0ebde;
  box-shadow: 5px 0 24px rgba(31, 72, 43, .035);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 92px;
  padding: 18px 22px;
  color: #173a28;
  text-decoration: none;
}

.brand-lockup > span:last-child {
  display: grid;
  gap: 4px;
}

.brand-lockup strong {
  font-size: 15px;
  letter-spacing: -.02em;
}

.brand-lockup small {
  color: #829589;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.brand-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(145deg, #dff4d7, #c8e9ba);
  color: #267744;
  box-shadow: inset 0 0 0 1px rgba(52, 126, 67, .08);
}

.drawer-label {
  padding: 16px 24px 8px;
  color: #94a398;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
}

.nav-list {
  padding: 4px 12px;
}

.nav-list :deep(.v-list-item) {
  min-height: 48px;
  margin: 4px 0;
  border-radius: 12px;
  color: #66786b;
  font-size: 14px;
}

.nav-list :deep(.v-list-item--active) {
  background: linear-gradient(100deg, #e4f4df, #f1f8ed);
  color: #236d3c;
  font-weight: 700;
}

.nav-list :deep(.v-list-item--active .v-icon) {
  color: #368b4f;
}

.drawer-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px;
  padding: 14px;
  border-radius: 14px;
  background: #f1f8ef;
  color: #66806c;
  font-size: 11px;
}

.drawer-note :deep(.v-icon) {
  color: #4a9b5b;
}

.site-bar {
  border-bottom: 1px solid rgba(220, 234, 217, .8);
  background: rgba(255, 255, 255, .86);
  color: #244331;
  backdrop-filter: blur(14px);
  box-shadow: 0 5px 24px rgba(28, 69, 40, .035);
}

.site-bar :deep(.v-toolbar-title) {
  font-size: 15px;
  font-weight: 700;
}

.menu-button {
  color: #3e8050;
}

.bar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 22px;
  color: #718477;
  font-size: 12px;
}

.bar-status span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4eb95e;
  box-shadow: 0 0 0 4px #e3f4dc;
}

.page-container {
  max-width: 1440px;
  padding: 36px clamp(18px, 4vw, 52px) 64px;
}

@media (max-width: 600px) {
  .bar-status {
    display: none;
  }

  .page-container {
    padding-top: 22px;
  }
}
</style>
