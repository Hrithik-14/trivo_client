// export const loadAuthFromLocalStorage = () => {
//   try {
//     const token = localStorage.getItem('token')
//     const user = localStorage.getItem('user')
//     if (token && user) {
//       return {
//         token,
//         user: JSON.parse(user),
//       }
//     }
//   } catch (e) {
//     console.error('Failed to load auth from localStorage', e)
//   }
//   return null
// }

// export const saveAuthToLocalStorage = (token: string, user: any) => {
//   localStorage.setItem('token', token)
//   localStorage.setItem('user', JSON.stringify(user))
// }

// export const clearAuthFromLocalStorage = () => {
//   localStorage.removeItem('token')
//   localStorage.removeItem('user')
// }
