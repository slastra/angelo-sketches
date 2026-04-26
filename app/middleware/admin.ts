export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return
  const { authed } = await $fetch<{ authed: boolean }>('/api/auth/me', {
    headers: useRequestHeaders(['cookie']),
  })
  if (!authed) return navigateTo('/login')
})
