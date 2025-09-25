'use client'

export const logout = async () => {
  try {
    // Call the logout API
    const response = await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      // Redirect to home page or login page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } else {
      console.error('Logout failed')
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}