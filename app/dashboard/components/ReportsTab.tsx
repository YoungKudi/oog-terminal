
import React from 'react'
import { getColor } from '@/lib/utils'

interface ReportsTabProps {
  loadingRecords: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
}

export default function ReportsTab({
  loadingRecords,
  isDarkMode,
  showToast
}: ReportsTabProps) {
  const [reportData, setReportData] = React.useState<any>(null)
  const [reportType, setReportType] = React.useState<string>('')

  const generateReport = (type: string) => {
    setReportType(type)
    let title = '', headers: string[] = [], data: any[][] = []
    const records = loadingRecords
    
    switch(type) {
      case 'excavator':
        title = '🚜 Loaded Excavators Report'
        headers = ['Container Number','Size','Vessel Name','Arrival Date','Received Date','Unstuffed Date','Content','Delivery Date','Location']
        data = records.filter((r: any) => r.equipment === 'Excavator' || r.equipment === '2x Excavator')
          .map((r: any) => [r.containerNumber, r.size, r.vessel || '-', r.arrivalDate || '-', r.clearedAt || '-', r.unstuffedDate || '-', r.equipment, r.deliveryDate || '-', r.location || '-'])
        break
      case 'others':
        title = '📦 Loaded Others Report'
        headers = ['Container Number','Size','Received Date','Delivery Date','Content','Remarks']
        data = records.filter((r: any) => r.equipment !== 'Excavator' && r.equipment !== '2x Excavator' && r.devanningType !== 'house_house' && r.devanningType !== 'back_to_port')
          .map((r: any) => [r.containerNumber, r.size, r.clearedAt || '-', r.deliveryDate || '-', r.equipment, r.remarks || '-'])
        break
      case 'house_house':
        title = '🏠 House-to-House Report'
        headers = ['Container Number','Size','Received Date','Delivery Date','Content','Remarks']
        data = records.filter((r: any) => r.devanningType === 'house_house')
          .map((r: any) => [r.containerNumber, r.size, r.clearedAt || '-', r.deliveryDate || '-', r.equipment, r.remarks || '-'])
        break
      case 'back_to_port':
        title = '🚢 Back To Port Report'
        headers = ['Container Number','Size','Received Date','Delivery Date','Content','Remarks']
        data = records.filter((r: any) => r.devanningType === 'back_to_port')
          .map((r: any) => [r.containerNumber, r.size, r.clearedAt || '-', r.deliveryDate || '-', r.equipment, r.remarks || '-'])
        break
      case 'freezone':
        title = '🏢 Freezone Report'
        headers = ['Container Number','Size','Received Date','Delivery Date','Content','Remarks']
        data = records.filter((r: any) => r.devanningType === 'freezone')
          .map((r: any) => [r.containerNumber, r.size, r.clearedAt || '-', r.deliveryDate || '-', r.equipment, r.remarks || '-'])
        break
      case 're_export':
        title = '🔄 Re-Export Report'
        headers = ['Container Number','Size','Received Date','Delivery Date','Content','Remarks']
        data = records.filter((r: any) => r.devanningType === 're_export')
          .map((r: any) => [r.containerNumber, r.size, r.clearedAt || '-', r.deliveryDate || '-', r.equipment, r.remarks || '-'])
        break
      default: showToast('❌ Unknown report type'); return
    }
    
    if (!data.length) {
      setReportData({ title, headers, data: [] })
      return
    }
    
    setReportData({ title, headers, data })
  }

  const exportReportCSV = () => {
    if (!reportData || !reportData.data.length) { showToast('❌ No data to export'); return }
    const csv = [reportData.headers.join(','), ...reportData.data.map((row: any[]) => row.map(v => '"' + v + '"').join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = reportType + '_report_' + new Date().toISOString().slice(0,10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('📊 Report exported')
  }

  const reportTypes = [
    { id: 'excavator', label: '🚜 Loaded Excavators Report', color: '#1e6f3f' },
    { id: 'others', label: '📦 Loaded Others Report', color: '#2563eb' },
    { id: 'house_house', label: '🏠 House-to-House Report', color: '#f59e0b' },
    { id: 'back_to_port', label: '🚢 Back To Port Report', color: '#dc2626' },
    { id: 'freezone', label: '🏢 Freezone Report', color: '#8b5cf6' },
    { id: 're_export', label: '🔄 Re-Export Report', color: '#06b6d4' }
  ]

  return (
    <div className="card" style={{background: getColor(isDarkMode, 'white', '#111827'), borderRadius:'16px', marginBottom:'14px', border: getColor(isDarkMode, '1px solid #eef2f6', '1px solid #1f2937')}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: getColor(isDarkMode, '2px solid #eab308', '2px solid #8b5cf6'), display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>📊 Reports</span>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {reportTypes.map(rt => (
            <button 
              key={rt.id} 
              className="btn-primary btn-sm" 
              onClick={() => generateReport(rt.id)} 
              style={{background: rt.color, color:'white', border:'none', borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer'}}
            >
              {rt.label}
            </button>
          ))}
        </div>
        <div style={{marginTop:'12px',maxHeight:'400px',overflowY:'auto'}}>
          {reportData && (
            <>
              {reportData.data.length === 0 ? (
                <div style={{padding:'16px',textAlign:'center',color:'#64748b',fontSize:'0.75rem'}}>No data available for this report</div>
              ) : (
                <>
                  <div style={{fontWeight:'700',fontSize:'0.9rem',marginBottom:'8px',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>
                    {reportData.title}
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.7rem'}}>
                      <thead>
                        <tr>
                          {reportData.headers.map((h: string) => (
                            <th key={h} style={{padding:'4px 8px',border:`1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}`,background: getColor(isDarkMode, '#f1f5f9', '#0f172a'),textAlign:'left',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.map((row: any[], idx: number) => (
                          <tr key={idx}>
                            {row.map((cell, i) => (
                              <td key={i} style={{padding:'4px 8px',border:`1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}`,color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{marginTop:'8px',fontSize:'0.65rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>
                    Total: {reportData.data.length} records
                  </div>
                  <button className="btn-primary btn-sm" onClick={exportReportCSV} style={{marginTop:'8px',background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>
                    📤 Export CSV
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


