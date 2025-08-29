
'use client';

import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/app/store';
import { loadUserFromStorage } from '@/app/store/userSlice'

function Loader() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  return null
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <Loader/>
            {children}
        </Provider>
    )
}
