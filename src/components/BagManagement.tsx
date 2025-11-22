import React, { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { BagCheckinWithStudent, Student } from '../types'

export const BagManagement = () => {
  const [activeCheckins, setActiveCheckins] = useState<BagCheckinWithStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState<Student[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [totalCheckins, setTotalCheckins] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch active check-ins
  const fetchActiveCheckins = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('bag_checkins')
        .select(`*,student:student_id(id,student_id,full_name,email)`)
        .eq('status', 'checked_in')
        .order('checkin_time', { ascending: false })

      if (fetchError) throw fetchError
      setActiveCheckins(data || [])
      setTotalCheckins(data?.length || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch check-ins')
    } finally {
      setLoading(false)
    }
  }

  // Fetch suggestions based on search input
  const fetchSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('id,student_id,email,full_name,created_at')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5)

      if (fetchError) throw fetchError
      setSuggestions((data as Student[]) || [])
      setShowSuggestions((data?.length || 0) > 0)
      setSelectedSuggestion(-1)
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  useEffect(() => {
    fetchActiveCheckins()
    const subscription = supabase
      .channel('bag_checkins_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bag_checkins' }, () => {
        fetchActiveCheckins()
      })
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestion >= 0) {
          selectSuggestion(suggestions[selectedSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const selectSuggestion = (student: Student) => {
    setSearchInput(student.email || '')
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleCheckOut = async (checkinId: string) => {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('bag_checkins')
        .update({ status: 'checked_out', checkout_time: new Date().toISOString() })
        .eq('id', checkinId)

      if (updateError) throw updateError
      setActiveCheckins(activeCheckins.filter(c => c.id !== checkinId))
      setTotalCheckins(prev => Math.max(0, prev - 1))
      setSearchInput('')
      searchInputRef.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out')
    }
  }

  const getFilteredCheckins = useMemo(() => {
    if (!searchInput.trim()) return activeCheckins
    return activeCheckins.filter(checkin => {
      const student = checkin.student as unknown as Student
      const searchLower = searchInput.toLowerCase()
      return (
        student?.email?.toLowerCase().includes(searchLower) ||
        student?.full_name?.toLowerCase().includes(searchLower) ||
        checkin.qr_code_data?.toLowerCase().includes(searchLower) ||
        checkin.bag_description?.toLowerCase().includes(searchLower)
      )
    })
  }, [activeCheckins, searchInput])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">📦 Bag Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Check out bags and view active check-ins</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-100 rounded-2xl">
            ❌ {error}
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 mb-8">
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-2">
              Search Student or Reference Code
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchInput.length > 0 && setShowSuggestions(true)}
                placeholder="Type email, name, or reference code..."
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/90 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-10 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.map((student, index) => (
                      <button
                        key={student.id}
                        onClick={() => selectSuggestion(student)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 border-slate-100 dark:border-slate-800 transition ${
                          index === selectedSuggestion
                            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">{student.full_name || 'Unknown'}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{student.email}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              💡 Tip: Use arrow keys to navigate, Enter to select
            </p>
          </div>
        </div>

        {/* Active Check-Ins List */}
        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white">
            <h2 className="text-xl font-bold">
              Active Check-Ins ({getFilteredCheckins.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-600 dark:text-slate-300">
              ⏳ Loading check-ins...
            </div>
          ) : getFilteredCheckins.length === 0 ? (
            <div className="p-6 text-center text-slate-600 dark:text-slate-300">
              {activeCheckins.length === 0 ? '✅ No active check-ins' : 'No matches found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Reference Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Bag Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Check-In Time</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCheckins.map((checkin, index) => {
                    const student = checkin.student as unknown as Student
                    const checkinTime = new Date(checkin.checkin_time).toLocaleString()
                    return (
                      <tr
                        key={checkin.id}
                        className={`border-b transition ${
                          index % 2 === 0 ? 'bg-white/60 dark:bg-slate-900/50' : 'bg-slate-50/70 dark:bg-slate-900/30'
                        } hover:bg-indigo-50/70 dark:hover:bg-indigo-500/10`}
                      >
                        <td className="px-6 py-4">
                          <span className="inline-block bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-semibold text-sm">
                            {checkin.tag_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {student?.full_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {student?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {checkin.bag_description || 'No description'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300 text-sm">
                          {checkinTime}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCheckOut(checkin.id)}
                            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 px-4 rounded-2xl transition duration-200 shadow-lg shadow-emerald-500/30"
                          >
                            ✓ Check Out
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <p>Real-time updates enabled</p>
        </div>
      </div>
    </div>
  )
}
