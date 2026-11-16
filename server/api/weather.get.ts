export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const location = typeof query.q === 'string' ? query.q.trim() : ''
  const days = Number(query.days ?? 7)

  if (!location || location.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a location to get its weather.',
    })
  }

  if (!config.weatherApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Weather is not configured. Set WEATHER_API_KEY on the server.',
    })
  }

  try {
    return await $fetch('https://api.weatherapi.com/v1/forecast.json', {
      query: {
        key: config.weatherApiKey,
        q: location,
        days: days >= 1 && days <= 7 ? days : 7,
        aqi: 'no',
        alerts: 'no',
      },
    })
  } catch (error) {
    const fetchError = error as { data?: { error?: { message?: string } } }
    const providerMessage = fetchError.data?.error?.message
    if (providerMessage) {
      throw createError({
        statusCode: 502,
        statusMessage: providerMessage,
      })
    }

    throw error
  }
})
