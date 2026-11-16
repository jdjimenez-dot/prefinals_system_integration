<template>
  <div class="scanner-page">
    <header class="scanner-header">
      <p class="page-eyebrow">QUICK TOOL</p>
      <h1 class="page-title">QR Scanner</h1>
      <p class="page-description">Point your camera at a QR code to read and copy its contents.</p>
    </header>

    <v-card class="scanner-card soft-card">
      <div class="camera-frame" :class="{ 'is-scanning': isScanning }">
        <video ref="videoRef" class="qr-video" playsinline muted></video>
        <div v-if="!isScanning" class="camera-placeholder">
          <div class="camera-icon"><v-icon icon="mdi-qrcode-scan" /></div>
          <strong>Camera preview</strong>
          <span>Start the scanner to begin.</span>
        </div>
        <div v-if="isScanning" class="scan-frame" aria-hidden="true">
          <span class="corner top-left" />
          <span class="corner top-right" />
          <span class="corner bottom-left" />
          <span class="corner bottom-right" />
          <span class="scan-line" />
        </div>
      </div>

      <div class="scanner-controls">
        <div class="scanner-status">
          <span :class="{ active: isScanning }" />
          {{ isScanning ? 'Camera is active' : 'Camera is off' }}
        </div>
        <div class="button-row">
          <v-btn
            v-if="!isScanning"
            class="start-button"
            color="green-darken-2"
            prepend-icon="mdi-camera"
            @click="startScanner"
          >
            Start camera
          </v-btn>
          <v-btn
            v-else
            class="stop-button"
            prepend-icon="mdi-stop"
            variant="outlined"
            @click="stopScanner"
          >
            Stop camera
          </v-btn>
          <v-btn
            v-if="result"
            prepend-icon="mdi-content-copy"
            variant="text"
            @click="copyResult"
          >
            Copy result
          </v-btn>
        </div>
      </div>

      <v-alert v-if="errorMessage" class="scanner-alert" type="error" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <div v-if="result" class="result-panel">
        <div>
          <p class="page-eyebrow">SCAN RESULT</p>
          <p class="result-text">{{ result }}</p>
        </div>
        <v-btn
          aria-label="Clear scan result"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="result = ''"
        />
      </div>
    </v-card>

    <div class="privacy-note">
      <v-icon icon="mdi-lock-outline" />
      <span>Your camera is only used while the scanner is running.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import QrScanner from 'qr-scanner'

definePageMeta({
  middleware: ['auth'],
})

const result = ref('')
const errorMessage = ref('')
const isScanning = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
let scanner: QrScanner | null = null

async function startScanner() {
  if (!videoRef.value) return

  errorMessage.value = ''
  try {
    if (!scanner) {
      scanner = new QrScanner(
        videoRef.value,
        (scanResult) => {
          result.value = scanResult.data
          isScanning.value = false
          void scanner?.stop()
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      )
    }

    await scanner.start()
    isScanning.value = true
  } catch {
    isScanning.value = false
    errorMessage.value = 'Could not start the camera. Check browser permissions and try again.'
  }
}

function stopScanner() {
  scanner?.stop()
  isScanning.value = false
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value)
  } catch {
    errorMessage.value = 'Could not copy the result. Check clipboard permissions and try again.'
  }
}

onBeforeUnmount(() => {
  scanner?.destroy()
  scanner = null
})
</script>

<style scoped>
.scanner-page {
  max-width: 860px;
  margin: 0 auto;
}

.scanner-header {
  margin-bottom: 22px;
}

.scanner-card {
  padding: clamp(16px, 3vw, 26px);
}

.camera-frame {
  position: relative;
  display: grid;
  min-height: 330px;
  overflow: hidden;
  place-items: center;
  border: 1px solid #d8e8d4;
  border-radius: 19px;
  background:
    radial-gradient(ellipse at center, rgba(182, 226, 157, .27), transparent 55%),
    linear-gradient(145deg, #e9f4e5, #f7fbf4);
}

.qr-video {
  display: none;
  width: 100%;
  height: 100%;
  max-height: 460px;
  object-fit: cover;
}

.is-scanning .qr-video {
  display: block;
}

.camera-placeholder {
  display: grid;
  justify-items: center;
  gap: 8px;
  color: #76917b;
  font-size: 12px;
}

.camera-placeholder strong {
  color: #43664b;
  font-size: 14px;
}

.camera-icon {
  display: grid;
  width: 62px;
  height: 62px;
  margin-bottom: 5px;
  place-items: center;
  border-radius: 20px;
  background: linear-gradient(145deg, #d4efc7, #ebf8e5);
  color: #2d8047;
  font-size: 28px;
  box-shadow: 0 8px 20px rgba(65, 138, 72, .12);
}

.scan-frame {
  position: absolute;
  width: min(58vw, 220px);
  height: min(58vw, 220px);
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: #b6eb99;
  border-style: solid;
}

.top-left {
  top: 0;
  left: 0;
  border-width: 3px 0 0 3px;
  border-radius: 10px 0 0;
}

.top-right {
  top: 0;
  right: 0;
  border-width: 3px 3px 0 0;
  border-radius: 0 10px 0 0;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 10px;
}

.bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 10px;
}

.scan-line {
  position: absolute;
  top: 50%;
  right: 10px;
  left: 10px;
  height: 2px;
  background: #b6eb99;
  box-shadow: 0 0 12px rgba(182, 235, 153, .8);
  animation: scan 2.4s ease-in-out infinite alternate;
}

.scanner-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 2px 6px;
}

.scanner-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8f81;
  font-size: 12px;
}

.scanner-status > span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c4cec5;
}

.scanner-status > span.active {
  background: #54b86a;
  box-shadow: 0 0 0 4px #e6f5e4;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-row :deep(.v-btn) {
  border-radius: 11px;
  text-transform: none;
}

.stop-button {
  border-color: #dce8da;
  color: #56715c;
}

.scanner-alert {
  margin: 12px 0;
}

.result-panel {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #d9e9d5;
  border-radius: 14px;
  background: linear-gradient(120deg, #f1f9ed, #fbfdf8);
}

.result-panel .page-eyebrow {
  margin-bottom: 6px;
  font-size: 9px;
}

.result-text {
  overflow-wrap: anywhere;
  margin: 0;
  color: #355640;
  font-size: 13px;
  line-height: 1.5;
}

.privacy-note {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  color: #859589;
  font-size: 11px;
}

@keyframes scan {
  from {
    transform: translateY(-72px);
  }

  to {
    transform: translateY(72px);
  }
}

@media (max-width: 560px) {
  .camera-frame {
    min-height: 260px;
  }

  .scanner-controls {
    align-items: start;
    flex-direction: column;
  }

  .button-row {
    flex-wrap: wrap;
  }
}
</style>
