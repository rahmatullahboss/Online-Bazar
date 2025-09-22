'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react'

import { useCartAbandonmentTracking } from './cart-abandonment'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: {
    url: string
    alt?: string
  }
  quantity: number
  category: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeItemId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return null
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!isRecord(value)) return null

  const normalizedId = normalizeItemId(value.id)
  if (!normalizedId || !isNonEmptyString(value.name)) {
    return null
  }

  const quantityRaw = Number(value.quantity)
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1

  const priceRaw = Number(value.price)
  const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0

  const categoryValue = value.category
  const category = isNonEmptyString(categoryValue)
    ? categoryValue
    : isRecord(categoryValue) && isNonEmptyString(categoryValue.name)
      ? categoryValue.name
      : ''

  const imageValue = value.image
  const image =
    isRecord(imageValue) && typeof imageValue.url === 'string'
      ? {
          url: imageValue.url,
          alt: isNonEmptyString(imageValue.alt) ? imageValue.alt : undefined,
        }
      : undefined

  return {
    id: normalizedId,
    name: value.name,
    price,
    quantity,
    category,
    ...(image ? { image } : {}),
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Normalize the item ID for comparison
      const normalizedId = normalizeItemId(action.payload.id)

      if (!normalizedId) {
        console.warn('Invalid item ID provided to ADD_ITEM:', action.payload.id)
        return state
      }

      // Find existing item using normalized ID
      const existingItem = state.items.find((item) => {
        const itemNormalizedId = normalizeItemId(item.id)
        return itemNormalizedId === normalizedId
      })

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) => {
            const itemNormalizedId = normalizeItemId(item.id)
            if (itemNormalizedId === normalizedId) {
              return { ...item, quantity: item.quantity + 1 }
            }
            return item
          }),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      }
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      }
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      }
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      }
    default:
      return state
  }
}

type CartItemInput = Omit<CartItem, 'quantity'> & { id: string | number }

interface CartContextType {
  state: CartState
  addItem: (item: CartItemInput) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  sessionId: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  })
  const [hasLoadedLocalCart, setHasLoadedLocalCart] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const hasSyncedServerCartRef = useRef(false)
  const serverSnapshotRef = useRef<Map<string, number>>(new Map())
  const skipNextPersistRef = useRef(false)
  const isAuthenticatedRef = useRef(true)
  const sessionIdRef = useRef<string | null>(null)
  const shouldForcePersistRef = useRef(false)
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const clientIdRef = useRef<string | null>(null)

  // Add a ref to track if we're currently syncing from server
  const isSyncingFromServerRef = useRef(false)

  const updateSessionId = useCallback((value: string | null) => {
    sessionIdRef.current = value
    setSessionToken(value)
  }, [])

  const updateAuthState = useCallback((value: boolean) => {
    const previous = isAuthenticatedRef.current
    isAuthenticatedRef.current = value
    setIsAuthenticated(value)
    if (value && !previous) {
      shouldForcePersistRef.current = true
    }
  }, [])

  const ensureClientId = useCallback(() => {
    if (clientIdRef.current) return clientIdRef.current
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dyad-cart-client-id')
        if (stored && stored.trim().length > 0) {
          clientIdRef.current = stored.trim()
          return clientIdRef.current
        }
        const generated =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
        clientIdRef.current = generated
        localStorage.setItem('dyad-cart-client-id', generated)
        return generated
      } catch {
        const fallback = Math.random().toString(36).slice(2)
        clientIdRef.current = fallback
        return fallback
      }
    }
    const fallback = Math.random().toString(36).slice(2)
    clientIdRef.current = fallback
    return fallback
  }, [])

  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (typeof window !== 'undefined' && reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    ensureClientId()
    try {
      const savedCart = localStorage.getItem('dyad-cart')
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as unknown
        if (isRecord(parsed) && Array.isArray(parsed.items)) {
          const sanitizedItems = parsed.items
            .map((item) => normalizeCartItem(item))
            .filter((item): item is CartItem => item !== null)
          dispatch({ type: 'SET_ITEMS', payload: sanitizedItems })
          const snapshotCandidate = (parsed as Record<string, unknown>)['serverSnapshot']
          const snapshotRaw = isRecord(snapshotCandidate) ? snapshotCandidate : null
          if (snapshotRaw) {
            const entries: [string, number][] = []
            for (const [id, value] of Object.entries(snapshotRaw)) {
              if (!isNonEmptyString(id)) continue
              const quantity = Number(value)
              if (Number.isFinite(quantity) && quantity >= 0) {
                entries.push([id, quantity])
              }
            }
            serverSnapshotRef.current = new Map(entries)
          } else {
            serverSnapshotRef.current = new Map()
          }
          const savedSessionId = (parsed as Record<string, unknown>)['sessionId']
          updateSessionId(isNonEmptyString(savedSessionId) ? savedSessionId : null)
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    } finally {
      setHasLoadedLocalCart(true)
    }
  }, [updateSessionId, ensureClientId])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedLocalCart || typeof window === 'undefined') return
    try {
      if (skipNextPersistRef.current) {
        skipNextPersistRef.current = false
        return
      }
      const serverSnapshot = Object.fromEntries(serverSnapshotRef.current.entries())
      const payload = {
        items: state.items,
        serverSnapshot,
        sessionId: sessionIdRef.current,
      }
      localStorage.setItem('dyad-cart', JSON.stringify(payload))
    } catch (error) {
      console.error('Failed to persist cart to localStorage:', error)
    }
  }, [state.items, hasLoadedLocalCart])

  const syncCartFromServer = useCallback(async () => {
    if (!hasLoadedLocalCart || typeof window === 'undefined') return
    if (hasSyncedServerCartRef.current) return
    hasSyncedServerCartRef.current = true

    // Mark that we're syncing from server to avoid persistence loop
    isSyncingFromServerRef.current = true

    try {
      const sessionQuery = sessionIdRef.current
        ? `?sessionId=${encodeURIComponent(sessionIdRef.current)}`
        : ''
      const response = await fetch(`/api/cart${sessionQuery}`, { credentials: 'include' })
      if (response.status === 401) {
        updateAuthState(false)
        hasSyncedServerCartRef.current = false
        updateSessionId(null)
        isSyncingFromServerRef.current = false
        return
      }
      if (!response.ok) {
        // Allow retry on future attempts
        hasSyncedServerCartRef.current = false
        isSyncingFromServerRef.current = false
        return
      }
      updateAuthState(true)
      const data = (await response.json().catch(() => null)) as unknown
      if (!isRecord(data)) {
        updateSessionId(null)
        serverSnapshotRef.current = new Map()
        isSyncingFromServerRef.current = false
        return
      }
      const dataRecord = data as Record<string, unknown>
      const sessionIdValue = isNonEmptyString(dataRecord.sessionId) ? dataRecord.sessionId : null
      updateSessionId(sessionIdValue)
      const snapshotCandidate = dataRecord['snapshot']
      const snapshotRaw = isRecord(snapshotCandidate) ? snapshotCandidate : null
      const snapshotEntries: [string, number][] = []
      if (snapshotRaw) {
        for (const [id, value] of Object.entries(snapshotRaw)) {
          if (!isNonEmptyString(id)) continue
          const quantity = Number(value)
          if (Number.isFinite(quantity) && quantity >= 0) {
            snapshotEntries.push([id, Math.floor(quantity)])
          }
        }
      }
      const itemsCandidate = dataRecord['items']
      if (!Array.isArray(itemsCandidate)) {
        serverSnapshotRef.current = new Map(snapshotEntries)
        isSyncingFromServerRef.current = false
        return
      }
      const incomingItems: CartItem[] = itemsCandidate
        .map((item) => normalizeCartItem(item))
        .filter((item): item is CartItem => item !== null)
      if (incomingItems.length === 0) {
        serverSnapshotRef.current = new Map(snapshotEntries)
        isSyncingFromServerRef.current = false
        return
      }

      // Replace local cart with server cart to avoid duplication
      // The server cart is the source of truth
      serverSnapshotRef.current = new Map(incomingItems.map((item) => [item.id, item.quantity]))

      // Set skipNextPersistRef to true to prevent persistence of server-synced items
      skipNextPersistRef.current = true
      dispatch({ type: 'SET_ITEMS', payload: incomingItems })
    } catch (error) {
      console.error('Failed to sync cart from server:', error)
      hasSyncedServerCartRef.current = false
    } finally {
      isSyncingFromServerRef.current = false
    }
  }, [hasLoadedLocalCart, state.items, updateSessionId, updateAuthState])

  useEffect(() => {
    if (!hasLoadedLocalCart) return
    syncCartFromServer()
  }, [hasLoadedLocalCart, syncCartFromServer])

  // Real-time cart synchronization via Server-Sent Events
  useEffect(() => {
    // Removed due to timeout issues on serverless platforms
    // This functionality was causing Vercel Runtime Timeout Error: Task timed out after 300s
    return () => {}
  }, [sessionToken, isAuthenticated, syncCartFromServer, closeEventSource, ensureClientId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleAuthChange = () => {
      hasSyncedServerCartRef.current = false
      updateAuthState(false)
      updateSessionId(null)
      closeEventSource()
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current)
        persistTimeoutRef.current = null
      }
      syncCartFromServer()
    }
    window.addEventListener('dyad-auth-changed', handleAuthChange)
    return () => window.removeEventListener('dyad-auth-changed', handleAuthChange)
  }, [syncCartFromServer, updateAuthState, updateSessionId, closeEventSource])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleMergeSuccess = () => {
      skipNextPersistRef.current = true
      serverSnapshotRef.current = new Map()
      updateSessionId(null)
      closeEventSource()
      try {
        localStorage.removeItem('dyad-cart')
      } catch {}
      hasSyncedServerCartRef.current = false
    }
    window.addEventListener('dyad-cart-merge-success', handleMergeSuccess)
    return () => window.removeEventListener('dyad-cart-merge-success', handleMergeSuccess)
  }, [updateSessionId, closeEventSource])

  const persistCartToServer = useCallback(
    async (items: CartItem[]) => {
      if (!hasLoadedLocalCart || typeof window === 'undefined') return

      // Create a map of current items for comparison
      const currentItemMap = new Map<string, number>()
      for (const item of items) {
        if (!item?.id) continue
        const quantity = Math.max(0, Math.floor(item.quantity))
        if (quantity <= 0) continue
        currentItemMap.set(item.id, quantity)
      }

      const previousSnapshot = serverSnapshotRef.current
      let isDifferent = currentItemMap.size !== previousSnapshot.size
      if (!isDifferent) {
        for (const [id, quantity] of currentItemMap.entries()) {
          if ((previousSnapshot.get(id) ?? 0) !== quantity) {
            isDifferent = true
            break
          }
        }
      }

      if (!isDifferent && !shouldForcePersistRef.current) {
        return
      }

      try {
        const clientId = ensureClientId()

        // Convert cart items to the format expected by the backend
        const cartItems = items
          .filter((item) => item.id && item.quantity > 0)
          .map((item) => {
            // Try to convert string ID to number
            const numericId = Number(item.id)
            return {
              item: Number.isFinite(numericId) ? numericId : item.id,
              quantity: item.quantity,
            }
          })

        const response = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            sessionId: sessionIdRef.current ?? undefined,
            clientId,
          }),
        })

        if (response.status === 401) {
          updateAuthState(false)
          updateSessionId(null)
          shouldForcePersistRef.current = false
          return
        }

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        updateAuthState(true)
        shouldForcePersistRef.current = false

        const data = (await response.json().catch(() => null)) as unknown
        const snapshotRaw = isRecord(data) ? (data as Record<string, unknown>).snapshot : null
        if (isRecord(snapshotRaw)) {
          const nextEntries: [string, number][] = []
          for (const [id, value] of Object.entries(snapshotRaw)) {
            if (typeof id !== 'string') continue
            const quantity = Number(value)
            if (Number.isFinite(quantity) && quantity >= 0) {
              nextEntries.push([id, Math.floor(quantity)])
            }
          }
          serverSnapshotRef.current = new Map(nextEntries)
        } else {
          // Update snapshot with current items
          serverSnapshotRef.current = new Map(
            items
              .filter((item) => item.id && item.quantity > 0)
              .map((item) => [item.id, item.quantity]),
          )
        }
        const nextSessionId =
          isRecord(data) && isNonEmptyString(data.sessionId) ? data.sessionId : null
        updateSessionId(nextSessionId)
      } catch (error) {
        console.error('Failed to persist cart to server:', error)
      } finally {
        shouldForcePersistRef.current = false
      }
    },
    [hasLoadedLocalCart, updateSessionId, updateAuthState, ensureClientId],
  )

  // Immediate persistence when cart items change
  useEffect(() => {
    if (!hasLoadedLocalCart) return
    // Don't persist if we're currently syncing from server
    if (isSyncingFromServerRef.current) return
    // Don't persist if we just loaded from server
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }
    // Immediately persist cart changes to server
    void persistCartToServer(state.items)
  }, [state.items, hasLoadedLocalCart, persistCartToServer])

  // Send lightweight cart activity to server (for abandoned cart tracking)
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Debounce to avoid spamming on rapid changes
    const handle = setTimeout(() => {
      try {
        const total = state.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
        // Try to include any known guest details
        let customerEmail: string | undefined
        let customerNumber: string | undefined
        let customerName: string | undefined
        try {
          customerEmail = localStorage.getItem('dyad-guest-email') || undefined
          customerNumber = localStorage.getItem('dyad-guest-number') || undefined
          const n = localStorage.getItem('dyad-guest-name') || undefined
          customerName = n && n.trim().length > 0 ? n : undefined
        } catch {}

        fetch('/api/cart-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: state.items.map((i) => ({ id: i.id, quantity: i.quantity })),
            total,
            customerEmail,
            customerNumber,
            customerName,
          }),
          keepalive: true,
        }).catch(() => {})
      } catch {}
    }, 800)
    return () => clearTimeout(handle)
  }, [state.items])

  const addItem = useCallback((item: CartItemInput) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
    // Mark that we should force persistence on next sync
    shouldForcePersistRef.current = true
  }, [])

  const removeItem = useCallback((id: string | number) => {
    const normalizedId = normalizeItemId(id)
    if (!normalizedId) return
    dispatch({ type: 'REMOVE_ITEM', payload: normalizedId })
    // Mark that we should force persistence on next sync
    shouldForcePersistRef.current = true
  }, [])

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    const normalizedId = normalizeItemId(id)
    if (!normalizedId) return
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: normalizedId, quantity } })
    // Mark that we should force persistence on next sync
    shouldForcePersistRef.current = true
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    // Mark that we should force persistence on next sync
    shouldForcePersistRef.current = true
  }, [])

  // Add a useEffect to ensure component re-renders when cart changes
  useEffect(() => {
    // This effect will trigger re-renders when state.items changes
    // which should help with the quantity update issue
  }, [state.items])

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Use the abandonment tracking hook with session ID
  const totalPrice = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [state.items])

  useCartAbandonmentTracking(state.items, totalPrice, sessionIdRef.current)

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalItems,
        getTotalPrice,
        sessionId: sessionIdRef.current,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
