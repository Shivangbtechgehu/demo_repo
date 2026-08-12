import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic hook for list pages with search, filters, sort, and pagination.
 *
 * @param {Function} fetchFn  - async (params) => { items, meta }
 * @param {object}   defaults - default query state
 */
export function useListQuery(fetchFn, defaults = {}) {
  const [items, setItems]   = useState([])
  const [meta, setMeta]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const [params, setParams] = useState({
    search:    '',
    page:      1,
    limit:     10,
    sortBy:    'createdAt',
    sortOrder: 'desc',
    ...defaults,
  })

  // Debounce search to avoid firing on every keystroke
  const searchTimer = useRef(null)

  const load = useCallback(async (queryParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(queryParams)
      setItems(result.items || [])
      setMeta(result.meta  || null)
    } catch (err) {
      setError(err.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    load(params)
  }, [params, load])

  const setSearch = (value) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: value, page: 1 }))
    }, 350)
  }

  const setFilter = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const setPage = (page) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const setSortBy = (sortBy) => {
    setParams((prev) => ({ ...prev, sortBy, page: 1 }))
  }

  const setSortOrder = (sortOrder) => {
    setParams((prev) => ({ ...prev, sortOrder, page: 1 }))
  }

  const refresh = () => load(params)

  return {
    items, meta, loading, error, params,
    setSearch, setFilter, setPage, setSortBy, setSortOrder, refresh,
  }
}
