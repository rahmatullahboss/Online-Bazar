'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchResult {
  id: string | number
  name: string
  price: number
  image?: {
    url: string
    alt?: string
  }
  category?: {
    name: string
  }
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Search products...',
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search for suggestions
  const searchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !showSuggestions) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.items || [])
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [showSuggestions],
  )

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      setShowDropdown(true)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        searchSuggestions(value)
      }, 300)
    },
    [searchSuggestions],
  )

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/?search=${encodeURIComponent(query.trim())}`)
        setShowDropdown(false)
      }
    },
    [query, router],
  )

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (item: SearchResult) => {
      router.push(`/item/${item.id}`)
      setShowDropdown(false)
      setQuery('')
    },
    [router],
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div className={cn('relative w-full max-w-md', className)} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setShowDropdown(true)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-11 rounded-full border-stone-200 bg-white/80 backdrop-blur"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
            {query && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-7 px-2 rounded-full text-amber-600 hover:bg-amber-50"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden">
          <ul className="py-2">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
                >
                  {item.image?.url && (
                    <img
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs text-stone-500">
                      Tk {item.price.toFixed(2)}
                      {item.category?.name && ` • ${item.category.name}`}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-stone-100 px-4 py-2">
            <button
              type="button"
              onClick={handleSubmit as () => void}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View all results for &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
