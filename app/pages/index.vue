<template>
  <div class="dashboard-page">
    <header class="welcome-row">
      <div>
        <p class="page-eyebrow">YOUR WORKSPACE</p>
        <h1 class="page-title">Good to see you<span v-if="user?.name">, {{ firstName }}</span>.</h1>
        <p class="page-description">Your everyday tools, ready when you are.</p>
      </div>
      <v-btn class="logout-button" prepend-icon="mdi-logout" variant="outlined" @click="logout">
        Sign out
      </v-btn>
    </header>

    <section class="dashboard-hero">
      <div class="hero-copy">
        <p>YOUR DAY, A LITTLE SIMPLER</p>
        <h2>Everything you need,<br>right at your fingertips.</h2>
        <span>Check the forecast or scan a code in just a tap.</span>
        <NuxtLink class="hero-cta" to="/weather">
          Check local weather
          <v-icon icon="mdi-arrow-right" size="17" />
        </NuxtLink>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-sun"><v-icon icon="mdi-white-balance-sunny" /></div>
        <div class="hero-leaf"><v-icon icon="mdi-leaf" /></div>
        <span class="hero-orbit orbit-one" />
        <span class="hero-orbit orbit-two" />
      </div>
    </section>

    <v-card class="profile-card soft-card">
      <div class="profile-avatar">
        <img v-if="user?.picture && !imageFailed" :src="user.picture" alt="Profile photo" @error="imageFailed = true">
        <span v-else>{{ initials }}</span>
      </div>
      <div class="profile-copy">
        <p class="profile-label">SIGNED IN AS</p>
        <h2>{{ user?.name || 'Welcome back' }}</h2>
        <p>{{ user?.email || 'Your account is ready.' }}</p>
      </div>
      <div class="secure-badge">
        <v-icon icon="mdi-check-decagram" />
        <span>Account connected</span>
      </div>
    </v-card>

    <div class="section-title">
      <div>
        <p class="page-eyebrow">QUICK ACCESS</p>
        <h2>Make something happen.</h2>
      </div>
      <span>Choose a tool to get started</span>
    </div>

    <div class="tools-grid">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="tool-link"
      >
        <v-card class="tool-card soft-card">
          <div class="tool-icon" :class="tool.colorClass">
            <v-icon :icon="tool.icon" />
          </div>
          <div class="tool-copy">
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <v-icon class="tool-arrow" icon="mdi-arrow-up-right" />
        </v-card>
      </NuxtLink>
    </div>

    <v-card class="help-strip">
      <div class="help-mark"><v-icon icon="mdi-sparkles" /></div>
      <div>
        <strong>Everything in one place.</strong>
        <p>Scan a QR code or check the forecast without leaving your workspace.</p>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface GoogleUser {
  name?: string
  email?: string
  picture?: string
}

const user = ref<GoogleUser | null>(null)
const imageFailed = ref(false)
const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] ?? '')
const initials = computed(() => (user.value?.name || 'SI')
  .split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase())

const tools = [
  {
    to: '/qr-scanner',
    title: 'QR Scanner',
    description: 'Scan a code with your camera and copy its contents.',
    icon: 'mdi-qrcode-scan',
    colorClass: 'scanner-icon',
  },
  {
    to: '/weather',
    title: 'Weather',
    description: 'Check current conditions and a 7-day local forecast.',
    icon: 'mdi-weather-partly-cloudy',
    colorClass: 'weather-icon',
  },
]

onMounted(() => {
  const savedUser = localStorage.getItem('google_user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser) as GoogleUser
    } catch {
      user.value = null
    }
  }
})

async function logout() {
  localStorage.removeItem('google_user')
  localStorage.removeItem('google_token')
  await navigateTo('/login')
}
</script>

<style scoped>
.welcome-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.logout-button {
  border-color: #dce8da;
  border-radius: 12px;
  color: #63806a;
  text-transform: none;
}

.dashboard-hero {
  position: relative;
  display: flex;
  min-height: 250px;
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 32px clamp(24px, 5vw, 48px);
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 26px;
  background:
    radial-gradient(circle at 83% 24%, rgba(209, 245, 163, .32), transparent 19%),
    linear-gradient(112deg, #17492f 0%, #267744 49%, #5ca653 100%);
  box-shadow: 0 18px 36px rgba(32, 99, 50, .17);
  color: #fff;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-copy > p {
  margin: 0 0 10px;
  color: #d6f1c8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15em;
}

.hero-copy h2 {
  margin: 0;
  font-size: clamp(27px, 3.6vw, 38px);
  font-weight: 750;
  letter-spacing: -.04em;
  line-height: 1.16;
}

.hero-copy > span {
  display: block;
  margin-top: 10px;
  color: #e0f0dc;
  font-size: 12px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #eff9e9;
  color: #347347;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background .15s ease, transform .15s ease;
}

.hero-cta:hover {
  transform: translateY(-1px);
  background: #fff;
}

.hero-art {
  position: absolute;
  top: 50%;
  right: 7%;
  width: 260px;
  height: 260px;
  transform: translateY(-50%);
}

.hero-sun,
.hero-leaf {
  position: absolute;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .33);
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(230, 255, 207, .27), rgba(255, 255, 255, .08));
  color: rgba(242, 255, 224, .92);
  box-shadow: 0 10px 24px rgba(23, 73, 47, .12);
  backdrop-filter: blur(5px);
}

.hero-sun {
  top: 38px;
  right: 44px;
  width: 126px;
  height: 126px;
  font-size: 40px;
}

.hero-leaf {
  right: 130px;
  bottom: 33px;
  width: 88px;
  height: 88px;
  font-size: 30px;
}

.hero-orbit {
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 50%;
}

.orbit-two {
  inset: 0;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 22px 24px;
  border-left: 4px solid #80c96b !important;
}

.profile-avatar {
  display: grid;
  width: 62px;
  height: 62px;
  flex: 0 0 62px;
  overflow: hidden;
  place-items: center;
  border: 3px solid #e6f4e3;
  border-radius: 50%;
  background: #dff1d9;
  color: #438d50;
  font-size: 19px;
  font-weight: 750;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-copy {
  min-width: 0;
}

.profile-label {
  margin: 0 0 4px;
  color: #7e9683;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .13em;
}

.profile-copy h2 {
  overflow: hidden;
  margin: 0;
  color: #294733;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-copy > p:last-child {
  margin: 4px 0 0;
  color: #859287;
  font-size: 12px;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  padding: 9px 12px;
  border-radius: 999px;
  background: linear-gradient(120deg, #e3f5dc, #f0f8e9);
  color: #39834b;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.section-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin: 38px 0 16px;
}

.section-title .page-eyebrow {
  margin-bottom: 6px;
}

.section-title h2 {
  margin: 0;
  color: #274631;
  font-size: 21px;
  letter-spacing: -.025em;
}

.section-title > span {
  color: #8a998e;
  font-size: 11px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.tool-link {
  color: inherit;
  text-decoration: none;
}

.tool-card {
  display: flex;
  min-height: 132px;
  align-items: center;
  gap: 16px;
  padding: 22px;
  border-color: #e0ebdd !important;
  background: linear-gradient(145deg, #fff, #fbfef9) !important;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.tool-link:hover .tool-card {
  transform: translateY(-3px);
  border-color: #b6d8ad !important;
  box-shadow: 0 17px 34px rgba(37, 90, 48, .13) !important;
}

.tool-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  place-items: center;
  border-radius: 16px;
  font-size: 22px;
  box-shadow: inset 0 0 0 1px rgba(45, 114, 55, .08);
}

.scanner-icon {
  background: linear-gradient(145deg, #d8f0cd, #edf8e8);
  color: #327b46;
}

.weather-icon {
  background: linear-gradient(145deg, #d5f0e2, #ebf8e9);
  color: #2d8a69;
}

.tool-copy {
  min-width: 0;
}

.tool-copy h3 {
  margin: 0 0 5px;
  color: #2b4934;
  font-size: 16px;
}

.tool-copy p {
  margin: 0;
  color: #7e8e82;
  font-size: 12px;
  line-height: 1.55;
}

.tool-arrow {
  margin-left: auto;
  color: #9baa9d;
}

.help-strip {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding: 17px 20px;
  border: 1px solid #d5e9cf;
  border-radius: 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(203, 235, 183, .44), transparent 34%),
    #edf7e8;
  color: #3d6145;
}

.help-mark {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 12px;
  background: #dcefd6;
  color: #55925e;
}

.help-strip strong {
  font-size: 13px;
}

.help-strip p {
  margin: 3px 0 0;
  color: #78907b;
  font-size: 11px;
}

@media (max-width: 650px) {
  .welcome-row {
    align-items: start;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .secure-badge {
    display: none;
  }

  .dashboard-hero {
    min-height: 238px;
    padding: 24px;
  }

  .hero-art {
    right: -138px;
    opacity: .7;
  }

  .section-title > span {
    display: none;
  }
}
</style>
