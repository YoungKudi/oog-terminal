import { useState, useEffect, useCallback } from 'react'

export function useData() {
  const [containers, setContainers] = useState([])
  const [importQueue, setImportQueue] = useState([])
  const [devanningQueue, setDevanningQueue] = useState([])
  const [unstuffedContainers, setUnstuffedContainers] = useState([])
  const [evacuationRecords, setEvacuationRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAllData = useCallback(async () => {
    try {
      const [c, q, d, u, e, l, a] = await Promise.all([
        fetch('/api/containers'), fetch('/api/import-queue'), fetch('/api/devanning'),
        fetch('/api/unstuffed'), fetch('/api/evacuation'), fetch('/api/loadout'), fetch('/api/activity?limit=100')
      ])
      const [cd, qd, dd, ud, ed, ld, ad] = await Promise.all([
        c.json().catch(() => []), q.json().catch(() => []), d.json().catch(() => []),
        u.json().catch(() => []), e.json().catch(() => []), l.json().catch(() => []), a.json().catch(() => [])
      ])
      setContainers(cd)
      setImportQueue(qd)
      setDevanningQueue(dd)
      setUnstuffedContainers(ud)
      setEvacuationRecords(ed)
      setLoadingRecords(ld)
      setActivityLog(ad)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    containers, setContainers,
    importQueue, setImportQueue,
    devanningQueue, setDevanningQueue,
    unstuffedContainers, setUnstuffedContainers,
    evacuationRecords, setEvacuationRecords,
    loadingRecords, setLoadingRecords,
    activityLog, setActivityLog,
    loading,
    fetchAllData
  }
}
