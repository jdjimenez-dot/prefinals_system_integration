<template>
  <div class="weather-page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Weather center</p>
        <h1 class="page-title">Plan your day with confidence.</h1>
        <p class="page-description">Local conditions and a simple forecast, all in one place.</p>
      </div>
      <form class="location-search" @submit.prevent="loadWeather">
        <v-text-field
          v-model="locationInput"
          aria-label="Search a city"
          class="location-input"
          hide-details
          placeholder="Search a city"
          prepend-inner-icon="mdi-map-marker-outline"
          variant="solo"
          flat
        />
        <v-btn class="search-button" color="green-darken-2" type="submit" :loading="loading">
          Search
        </v-btn>
      </form>
    </header>

    <div class="city-shortcuts">
      <span>Popular:</span>
      <button
        v-for="city in popularCities"
        :key="city"
        type="button"
        @click="loadCity(city)"
      >
        {{ city }}
      </button>
      <v-btn
        class="refresh-button"
        icon="mdi-refresh"
        aria-label="Refresh weather"
        variant="text"
        :loading="loading"
        @click="loadWeather"
      />
    </div>

    <v-alert v-if="errorMessage" class="mb-5" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <div v-if="loading && !weather" class="loading-state">
      <v-progress-circular color="green" indeterminate />
      <span>Loading local forecast...</span>
    </div>

    <template v-if="weather">
      <section class="weather-grid">
        <v-card class="soft-card current-card">
          <div class="current-topline">
            <div>
              <p class="card-label">CURRENT WEATHER</p>
              <h2>{{ weather.location.name }}</h2>
              <p class="location-country">
                {{ weather.location.region ? `${weather.location.region}, ` : '' }}{{ weather.location.country }}
              </p>
            </div>
            <v-chip color="green" prepend-icon="mdi-clock-outline" variant="tonal">
              {{ localTime }}
            </v-chip>
          </div>
          <div class="current-reading">
            <img :src="iconUrl(weather.current.condition.icon)" :alt="weather.current.condition.text">
            <div class="temperature">{{ Math.round(weather.current.temp_c) }}<span>°C</span></div>
            <div class="condition-copy">
              <strong>{{ weather.current.condition.text }}</strong>
              <span>Feels like {{ Math.round(weather.current.feelslike_c) }}°C</span>
            </div>
          </div>
          <div class="weather-details">
            <div>
              <v-icon icon="mdi-water-percent" />
              <span>Humidity</span>
              <strong>{{ weather.current.humidity }}%</strong>
            </div>
            <div>
              <v-icon icon="mdi-weather-windy" />
              <span>Wind</span>
              <strong>{{ weather.current.wind_kph }} km/h</strong>
            </div>
            <div>
              <v-icon icon="mdi-white-balance-sunny" />
              <span>UV index</span>
              <strong>{{ weather.current.uv }}</strong>
            </div>
          </div>
        </v-card>

        <v-card class="soft-card tip-card">
          <div class="tip-icon"><v-icon icon="mdi-lightbulb-on-outline" /></div>
          <p class="card-label">A LITTLE HEADS-UP</p>
          <h2>{{ weather.current.temp_c >= 30 ? 'Keep cool out there.' : 'Make the most of today.' }}</h2>
          <p>
            {{ weather.current.temp_c >= 30
              ? 'It is warm right now. Bring water and take breaks if you are outdoors.'
              : 'Check the forecast before heading out and enjoy your day.' }}
          </p>
          <div class="updated-label">
            <v-icon icon="mdi-update" size="16" />
            Updated {{ weather.current.last_updated }}
          </div>
        </v-card>
      </section>

      <section class="forecast-section">
        <div class="section-heading">
          <div>
            <p class="page-eyebrow">Coming up</p>
            <h2>7-day forecast</h2>
          </div>
          <span>Daily outlook</span>
        </div>
        <div class="forecast-grid">
          <v-card
            v-for="(day, index) in weather.forecast.forecastday"
            :key="day.date"
            class="soft-card forecast-card"
          >
            <div class="forecast-day">{{ dayLabel(day.date, index) }}</div>
            <img :src="iconUrl(day.day.condition.icon)" :alt="day.day.condition.text">
            <div class="forecast-temperatures">
              <strong>{{ Math.round(day.day.maxtemp_c) }}°</strong>
              <span>{{ Math.round(day.day.mintemp_c) }}°</span>
            </div>
            <div class="forecast-condition">{{ day.day.condition.text }}</div>
            <div class="rain-chance">
              <v-icon icon="mdi-water" size="15" />
              {{ day.day.daily_chance_of_rain }}% rain
            </div>
          </v-card>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  middleware: ['auth'],
})

interface WeatherDay {
  date: string
  day: {
    maxtemp_c: number
    mintemp_c: number
    daily_chance_of_rain: number
    condition: { text: string; icon: string }
  }
}

interface WeatherData {
  location: { name: string; region: string; country: string; localtime: string }
  current: {
    temp_c: number
    feelslike_c: number
    humidity: number
    wind_kph: number
    uv: number
    last_updated: string
    condition: { text: string; icon: string }
  }
  forecast: { forecastday: WeatherDay[] }
}

const locationInput = ref('San Fernando, Philippines')
const weather = ref<WeatherData | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const popularCities = ['Manila', 'Baguio', 'Cebu']
const localTime = computed(() => weather.value?.location.localtime.split(' ')[1] ?? '')

async function loadWeather() {
  const location = locationInput.value.trim()
  if (!location) {
    errorMessage.value = 'Enter a city or location to search.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    weather.value = await $fetch<WeatherData>('/api/weather', {
      query: { q: location, days: 7 },
    })
  } catch (error) {
    const fetchError = error as {
      data?: { error?: { message?: string }; statusMessage?: string }
      statusMessage?: string
    }
    errorMessage.value = fetchError.data?.error?.message
      || fetchError.data?.statusMessage
      || fetchError.statusMessage
      || 'Weather could not be loaded. Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

function loadCity(city: string) {
  locationInput.value = city
  return loadWeather()
}

function iconUrl(icon: string) {
  return icon.startsWith('//') ? `https:${icon}` : icon
}

function dayLabel(date: string, index: number) {
  if (index === 0) return 'Today'
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' })
}

onMounted(loadWeather)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  padding: 25px 27px;
  border: 1px solid #e0ecdc;
  border-radius: 22px;
  background:
    radial-gradient(circle at 88% 10%, rgba(199, 236, 177, .4), transparent 28%),
    linear-gradient(120deg, #fff, #f6fbf2);
  box-shadow: 0 10px 26px rgba(34, 79, 45, .05);
}

.location-search {
  display: flex;
  width: min(390px, 100%);
  gap: 9px;
}

.location-input {
  flex: 1;
}

.location-input :deep(.v-field) {
  min-height: 48px;
  border: 1px solid #e1ece0;
  border-radius: 13px;
  background: #fff;
}

.search-button {
  min-height: 48px;
  border-radius: 12px;
  background: linear-gradient(110deg, #2d7b43, #51a456) !important;
  box-shadow: 0 7px 15px rgba(45, 123, 67, .18);
  text-transform: none;
}

.city-shortcuts {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  color: #819084;
  font-size: 12px;
}

.city-shortcuts button {
  padding: 6px 11px;
  border: 1px solid #e1ece0;
  border-radius: 999px;
  background: #fff;
  color: #477354;
  cursor: pointer;
  font-size: 12px;
}

.city-shortcuts button:hover {
  background: #eaf6e7;
}

.refresh-button {
  margin-left: auto;
  color: #53865e;
}

.weather-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(260px, 1fr);
  gap: 18px;
}

.current-card,
.tip-card {
  min-height: 270px;
  padding: 26px;
}

.current-card {
  position: relative;
  overflow: hidden;
  border: 0 !important;
  background:
    radial-gradient(circle at 93% 8%, rgba(190, 237, 141, .27), transparent 25%),
    linear-gradient(130deg, #194a32, #287747 65%, #418e4e) !important;
  box-shadow: 0 16px 34px rgba(33, 99, 54, .16) !important;
  color: #fff;
}

.current-card::after {
  position: absolute;
  right: -54px;
  bottom: -132px;
  width: 280px;
  height: 280px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 50%;
  box-shadow: 0 0 0 22px rgba(255, 255, 255, .035), 0 0 0 46px rgba(255, 255, 255, .025);
  content: "";
  pointer-events: none;
}

.current-topline {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.card-label {
  margin: 0 0 9px;
  color: #7d9d83;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .13em;
}

.current-topline h2,
.tip-card h2 {
  margin: 0;
  color: #23452e;
  font-size: 20px;
  font-weight: 700;
}

.current-card .card-label {
  color: #c1e0bb;
}

.current-card .current-topline h2 {
  color: #fff;
}

.current-card .location-country {
  color: #c7dfc7;
}

.current-card :deep(.v-chip) {
  background: rgba(231, 249, 224, .14) !important;
  color: #e8f7df !important;
}

.current-card .temperature {
  color: #fff;
}

.current-card .temperature span,
.current-card .condition-copy {
  color: #d3e8cf;
}

.current-card .condition-copy strong {
  color: #fff;
}

.location-country {
  margin: 4px 0 0;
  color: #89978c;
  font-size: 12px;
}

.current-reading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 12px 0 22px;
}

.current-reading img {
  width: 76px;
  height: 76px;
}

.temperature {
  color: #23452e;
  font-size: 56px;
  font-weight: 750;
  letter-spacing: -.07em;
  line-height: 1;
}

.temperature span {
  margin-left: 3px;
  color: #7e9a83;
  font-size: 25px;
  vertical-align: top;
}

.condition-copy {
  display: grid;
  gap: 6px;
  color: #799080;
  font-size: 12px;
}

.condition-copy strong {
  color: #486950;
  font-size: 13px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid rgba(231, 247, 225, .2);
}

.weather-details > div {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  column-gap: 5px;
  color: #c3dbc2;
  font-size: 11px;
}

.weather-details .v-icon {
  grid-row: span 2;
  color: #b8e889;
}

.weather-details strong {
  color: #fff;
  font-size: 12px;
}

.tip-card {
  border-color: #dcebd4 !important;
  background:
    radial-gradient(circle at 92% 10%, rgba(198, 235, 171, .46), transparent 30%),
    linear-gradient(145deg, #e8f6df, #f8fcf5) !important;
}

.tip-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 18px;
  place-items: center;
  border-radius: 14px;
  background: #d9efcf;
  color: #479052;
}

.tip-card > p:not(.card-label) {
  max-width: 290px;
  margin: 9px 0 18px;
  color: #718775;
  font-size: 13px;
  line-height: 1.6;
}

.updated-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8a9b8c;
  font-size: 10px;
}

.forecast-section {
  margin-top: 32px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-heading .page-eyebrow {
  margin-bottom: 5px;
}

.section-heading h2 {
  margin: 0;
  color: #23452e;
  font-size: 20px;
}

.section-heading > span {
  color: #8a998e;
  font-size: 11px;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.forecast-card {
  padding: 18px;
  border-top: 3px solid #a4d48e !important;
  text-align: center;
  transition: transform .18s ease, box-shadow .18s ease;
}

.forecast-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 28px rgba(37, 74, 47, .1) !important;
}

.forecast-day {
  color: #69836f;
  font-size: 12px;
  font-weight: 700;
}

.forecast-card img {
  width: 56px;
  height: 56px;
  margin: 8px 0 2px;
}

.forecast-temperatures {
  display: flex;
  justify-content: center;
  gap: 12px;
  color: #8a9a8d;
  font-size: 14px;
}

.forecast-temperatures strong {
  color: #355a3e;
}

.forecast-condition {
  margin-top: 7px;
  color: #6f8173;
  font-size: 11px;
}

.rain-chance {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 10px;
  color: #6e9a9a;
  font-size: 10px;
}

.loading-state {
  display: grid;
  min-height: 260px;
  place-content: center;
  justify-items: center;
  gap: 14px;
  color: #748879;
  font-size: 13px;
}

@media (max-width: 800px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .page-header {
    padding: 20px;
  }

  .current-card,
  .tip-card {
    padding: 20px;
  }

  .current-topline {
    flex-direction: column;
  }

  .current-reading {
    gap: 6px;
  }

  .temperature {
    font-size: 46px;
  }

  .weather-details {
    gap: 4px;
  }

  .weather-details > div {
    grid-template-columns: 18px 1fr;
    font-size: 9px;
  }

  .weather-details strong {
    font-size: 10px;
  }

  .forecast-grid {
    gap: 8px;
  }

  .forecast-card {
    padding: 12px 6px;
  }

  .city-shortcuts {
    gap: 6px;
  }
}
</style>
