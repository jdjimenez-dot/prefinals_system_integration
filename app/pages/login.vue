<template>
  <main class="login-page">
    <v-card class="login-card soft-card" elevation="0">
      <section class="login-welcome">
        <div class="login-brand">
          <span class="brand-icon"><v-icon icon="mdi-leaf" /></span>
          <strong>System Integration</strong>
        </div>
        <div class="welcome-copy">
          <p>YOUR WORKSPACE, SIMPLIFIED</p>
          <h1>Small tools.<br>Smarter days.</h1>
          <span>One place for the little things that make work easier.</span>
        </div>
        <div class="welcome-art" aria-hidden="true">
          <v-icon icon="mdi-leaf" />
          <span />
          <span />
        </div>
      </section>

      <section class="login-form-panel">
        <div class="form-heading">
          <p class="page-eyebrow">WELCOME BACK</p>
          <h2>Sign in</h2>
          <p>Pick up right where you left off.</p>
        </div>

        <form @submit.prevent="emailLoginMessage">
          <v-text-field
            v-model="email"
            class="login-input"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            hide-details
          />
          <v-text-field
            v-model="password"
            class="login-input"
            label="Password"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            hide-details
          />
          <v-btn block class="email-button" size="large" type="submit">
            Sign in with email
          </v-btn>
        </form>

        <div class="or-divider"><span>OR</span></div>
        <v-btn
          block
          class="google-button"
          :loading="isSigningIn"
          size="large"
          prepend-icon="mdi-google"
          @click="loginWithGoogle"
        >
          Continue with Google
        </v-btn>
        <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>
        <p class="login-footnote"><v-icon icon="mdi-shield-lock-outline" /> Your sign-in is protected by Google.</p>
      </section>
    </v-card>
  </main>
</template>

<script lang="ts" setup>
// @ts-nocheck
definePageMeta({
  layout: false,
  middleware: 'auth',
})
const config = useRuntimeConfig()
const email = ref('')
const password = ref('')
const isSigningIn = ref(false)
const errorMessage = ref('')

declare global {
  interface Window {
    google: any
  }
}

const waitForGoogle = () => new Promise((resolve, reject) => {
  const startedAt = Date.now()
  const check = () => {
    if (window.google?.accounts?.oauth2) return resolve(window.google)
    if (Date.now() - startedAt > 10000) return reject(new Error('Google sign-in could not be loaded.'))
    window.setTimeout(check, 100)
  }
  check()
})

const loginWithGoogle = async () => {
  errorMessage.value = ''
  isSigningIn.value = true

  if (!config.public.googleClientId) {
    errorMessage.value = 'Google sign-in is not configured yet.'
    isSigningIn.value = false
    return
  }

  try {
    await waitForGoogle()
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: config.public.googleClientId,
      scope: 'openid email profile',
      callback: async (response: any) => {
        try {
          const userInfo = await $fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          })

          localStorage.setItem('google_user', JSON.stringify(userInfo))
          localStorage.setItem('google_token', response.access_token)
          await navigateTo('/')
        } catch {
          errorMessage.value = 'Google sign-in could not load your profile.'
          isSigningIn.value = false
        }
      },
      error_callback: () => {
        errorMessage.value = 'Google sign-in was cancelled or could not be completed.'
        isSigningIn.value = false
      },
    })

    client.requestAccessToken()
  } catch (error: any) {
    errorMessage.value = error.message || 'Google sign-in could not be completed.'
    isSigningIn.value = false
  }
}

const emailLoginMessage = () => {
  errorMessage.value = 'Email and password sign-in is not connected yet. Use Google sign-in.'
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 28px;
  place-items: center;
  background:
    radial-gradient(ellipse at 18% 10%, rgba(178, 224, 159, .56), transparent 34%),
    radial-gradient(ellipse at 94% 88%, rgba(218, 241, 203, .55), transparent 30%),
    #f3f8f1;
}

.login-card {
  display: grid;
  width: min(960px, 100%);
  min-height: 580px;
  overflow: hidden;
  grid-template-columns: .9fr 1.1fr;
  border-radius: 26px !important;
  box-shadow: 0 30px 80px rgba(27, 73, 42, .16) !important;
}

.login-welcome {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  padding: 34px;
  background:
    radial-gradient(circle at 80% 75%, rgba(198, 239, 144, .38), transparent 26%),
    linear-gradient(150deg, #17492f, #347d46 58%, #65a955);
  color: #fff;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14px;
}

.brand-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 13px;
  background: rgba(255, 255, 255, .18);
}

.welcome-copy {
  position: relative;
  z-index: 1;
  max-width: 290px;
}

.welcome-copy p {
  margin: 0 0 12px;
  color: #d3ebcf;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15em;
}

.welcome-copy h1 {
  margin: 0 0 13px;
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 750;
  letter-spacing: -.05em;
  line-height: 1.08;
}

.welcome-copy > span {
  color: #e0f0dc;
  font-size: 13px;
  line-height: 1.6;
}

.welcome-art {
  position: absolute;
  right: -42px;
  bottom: -66px;
  display: grid;
  width: 230px;
  height: 230px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 50%;
  color: rgba(255, 255, 255, .55);
  box-shadow: 0 0 0 20px rgba(255, 255, 255, .035), 0 0 0 42px rgba(255, 255, 255, .025);
}

.welcome-art :deep(.v-icon) {
  font-size: 64px;
}

.welcome-art span {
  position: absolute;
  inset: 20px;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 50%;
}

.welcome-art span:last-child {
  inset: 42px;
}

.login-form-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(30px, 6vw, 72px);
}

.form-heading {
  margin-bottom: 28px;
}

.form-heading .page-eyebrow {
  margin-bottom: 7px;
}

.form-heading h2 {
  margin: 0;
  color: #24432e;
  font-size: 31px;
  letter-spacing: -.04em;
}

.form-heading > p:last-child {
  margin: 7px 0 0;
  color: #829084;
  font-size: 13px;
}

.login-form-panel form {
  display: grid;
  gap: 15px;
}

.login-input :deep(.v-field) {
  border-radius: 12px;
  background: #fff;
}

.email-button,
.google-button {
  min-height: 48px;
  border-radius: 12px;
  text-transform: none;
}

.email-button {
  margin-top: 5px;
  background: linear-gradient(100deg, #287542, #3e9650);
  color: white;
  box-shadow: 0 8px 16px rgba(44, 125, 64, .18);
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 21px 0;
  color: #9aa79c;
  font-size: 10px;
}

.or-divider::before,
.or-divider::after {
  height: 1px;
  flex: 1;
  background: #e8eee6;
  content: "";
}

.google-button {
  border: 1px solid #e3ebe1;
  background: #fff;
  color: #42604a;
  box-shadow: 0 5px 14px rgba(31, 70, 42, .04);
}

.login-footnote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 24px 0 0;
  color: #91a094;
  font-size: 10px;
}

@media (max-width: 600px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    grid-template-columns: 1fr;
  }

  .login-welcome {
    min-height: 200px;
    padding: 24px;
  }

  .welcome-copy {
    margin-top: 32px;
  }

  .welcome-copy h1 {
    font-size: 30px;
  }

  .welcome-art {
    right: -68px;
    bottom: -118px;
    width: 200px;
    height: 200px;
  }

  .login-form-panel {
    padding: 30px 24px;
  }
}
</style>