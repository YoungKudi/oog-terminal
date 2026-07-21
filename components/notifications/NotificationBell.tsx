// Update the dropdown positioning
// Replace the dropdown styles section with:

{isOpen && (
  <div
    ref={dropdownRef}
    style={{
      position: 'fixed', // Use fixed positioning
      top: '60px',
      right: '10px',
      width: window.innerWidth < 480 ? 'calc(100% - 20px)' : '380px',
      maxHeight: window.innerHeight < 600 ? '300px' : '400px',
      background: bgColor,
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${borderColor}`,
    }}
  >
    // ... rest of content
  </div>
)}
