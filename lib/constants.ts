export const EQUIPMENT_LIST = [
  'Excavator', '2x Excavator', 'General Goods', 'Boxed Cargo', 'Cone Crusher',
  'Surface Drill Rig', 'Dump Truck', 'Fork Lift', 'Reach Stacker', 'Earthmover Tyres',
  'Grader', 'Compact Roller', 'Excavator Drill Rig', 'Bulldozer', 'Truck Head',
  'Drilling Rig', 'Bus', 'Wheel Loader', 'Asphalt Paver', 'Backhoe',
  '3 Tonner', '16 Tonner', '32 Tonner'
]

export const AUX_CARGO_TYPES = ['Boxes', 'Pallets', 'Barrel', 'Bundle', 'Units', 'Pieces']

export const MACHINE_TYPES = ['3 Tonner', '16 Tonner', '32 Tonner', 'Reach Stacker']

export const DEVANNING_STATUSES = [
  { value: 'in_stack', label: '📦 In Stack', color: '#94a3b8', progress: 0 },
  { value: 'breaking', label: '🔨 Breaking', color: '#f59e0b', progress: 25 },
  { value: 'positioned', label: '📍 Positioned', color: '#3b82f6', progress: 50 },
  { value: 'unlashing', label: '🔗 Unlashing', color: '#8b5cf6', progress: 75 },
  { value: 'ready_to_drop', label: '📦 Ready to Drop', color: '#10b981', progress: 90 }
]

export const DEVANNING_STEPS = ['in_stack', 'breaking', 'positioned', 'unlashing', 'ready_to_drop']

export const DEFAULT_LOCATIONS = [
  { 
    id: 'loc_1', 
    name: 'Japan', 
    type: 'grid', 
    prefix: 'J', 
    columns: 2, 
    rows: 11, 
    positions: ['L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','R1','R2','R3','R4','R5','R6','R7','R8','R9','R10','R11','M'] 
  },
  { 
    id: 'loc_2', 
    name: 'Ship Yard', 
    type: 'grid', 
    prefix: 'SY', 
    columns: 1, 
    rows: 15, 
    positions: ['SY1','SY2','SY3','SY4','SY5','SY6','SY7','SY8','SY9','SY10','SY11','SY12','SY13','SY14','SY15'] 
  },
  { 
    id: 'loc_3', 
    name: 'Kilimanjaro', 
    type: 'grid', 
    prefix: 'K', 
    columns: 1, 
    rows: 1, 
    positions: ['K'] 
  },
  { 
    id: 'loc_4', 
    name: 'T2', 
    type: 'row', 
    positions: ['T2'] 
  },
  { 
    id: 'loc_5', 
    name: 'Shipside', 
    type: 'row', 
    positions: ['SS'] 
  },
  { 
    id: 'loc_6', 
    name: 'Western Gate', 
    type: 'row', 
    positions: ['WG1','WG2','WG3','WG4','WG5','WG6','WG7','WG8','WG9','WG10','WG11','WG12'] 
  }
]

export const DEFAULT_SHIFT = {
  supervisors: [{name: 'Not Assigned', contact: ''}, {name: 'Not Assigned', contact: ''}],
  operators: [
    { name: 'Not Assigned', contact: '', machine: '3 Tonner' },
    { name: 'Not Assigned', contact: '', machine: '16 Tonner' },
    { name: 'Not Assigned', contact: '', machine: '32 Tonner' },
    { name: 'Not Assigned', contact: '', machine: 'Reach Stacker' }
  ]
}

export const WORKER_ID_REGEX_1 = /^[A-Z]{2}\d{6}$/
export const WORKER_ID_REGEX_2 = /^\d{7}$/
