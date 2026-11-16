<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'System Integration',
  script: [
    {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      defer: true,
    },
  ],
})
</script>

<style>
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f4f8f3;
  color: #193a28;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
  background:
    radial-gradient(ellipse at 86% 0%, rgba(209, 239, 195, .34), transparent 28%),
    #f3f8f1;
}

body {
  color: #203b2b;
}

button,
input {
  font: inherit;
}

.page-eyebrow {
  margin: 0 0 9px;
  color: #4a9b5b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  color: #1d3828;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 750;
  letter-spacing: -.04em;
  line-height: 1.15;
}

.page-description {
  margin: 9px 0 0;
  color: #758579;
  font-size: 14px;
  line-height: 1.6;
}

.soft-card {
  border: 1px solid #e1ecdf !important;
  border-radius: 22px !important;
  background: #fff !important;
  box-shadow: 0 12px 32px rgba(29, 68, 42, .065) !important;
}
</style>