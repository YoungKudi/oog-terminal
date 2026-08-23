import { query } from '@/lib/db'

export const devanningService = {
  async getAll() {
    const result = await query('SELECT * FROM "DevanningQueue" ORDER BY "movedToDevanAt" DESC')
    return result.rows
  },

  async create(data: any) {
    const { 
      containerNumber, containerId, position, size, type, equipment, 
      auxCargo, auxCargoType, auxCargoQuantity, vessel, arrivalDate, 
      devanningType, agency, remarks, userId 
    } = data
    const today = new Date().toISOString().split('T')[0]
    const cleanVessel = vessel && vessel.trim() !== '' ? vessel.trim() : null
    const cleanArrivalDate = arrivalDate && arrivalDate.trim() !== '' ? arrivalDate.trim() : null
    
    const result = await query(
      `INSERT INTO "DevanningQueue" (
        "containerNumber", size, type, position, equipment, "auxCargo", 
        "auxCargoType", "auxCargoQuantity", vessel, "arrivalDate", 
        "devanningType", agency, remarks, "userId", "devanningStatus", "bookedDate"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *`,
      [
        containerNumber.toUpperCase().trim(), size, type, position, equipment, 
        auxCargo || '', auxCargoType || 'units', auxCargoQuantity || 0, 
        cleanVessel, cleanArrivalDate, devanningType || 'unstuffing', 
        agency || '', remarks || '', userId, 'in_stack', today
      ]
    )
    if (containerId) {
      await query('DELETE FROM "Container" WHERE id = $1', [containerId])
    }
    return result.rows[0]
  },

  async updateStep(id: string, step: string, userId: string, flags: any) {
    const { fuelNeeded, electricalFault, mechanicalFault, damageRemarks } = flags
    const stepColumn = `step_${step}`
    const stepAtColumn = `step_${step}_at`
    const stepLabel = step === 'ready_to_drop' ? 'Ready to Drop' : step.charAt(0).toUpperCase() + step.slice(1)
    
    await query(
      `UPDATE "DevanningQueue" SET 
        ${stepColumn} = TRUE, 
        ${stepAtColumn} = CURRENT_TIMESTAMP, 
        "devanningStatus" = $1, 
        "statusUpdatedAt" = CURRENT_TIMESTAMP, 
        "statusUpdatedBy" = $2, 
        "fuelNeeded" = $3, 
        "electricalFault" = $4, 
        "mechanicalFault" = $5, 
        "damageRemarks" = $6 
      WHERE id = $7`,
      [step, userId, fuelNeeded || false, electricalFault || false, mechanicalFault || false, damageRemarks || '', id]
    )
    await query(
      `INSERT INTO "DevanningStepHistory" ("devanningId", "stepName", "completed", "completedBy") 
       VALUES ($1, $2, $3, $4)`,
      [id, stepLabel, true, userId]
    )
    return { success: true, step }
  },

  async resolveFlag(id: string, flagType: string, userId: string) {
    const validFlags = ['fuel', 'electrical', 'mechanical']
    if (!validFlags.includes(flagType)) {
      throw new Error('Invalid flag type')
    }
    
    const column = `${flagType}_resolved`
    const atColumn = `${flagType}_resolved_at`
    const byColumn = `${flagType}_resolved_by`
    
    await query(
      `UPDATE "DevanningQueue" SET 
        ${column} = TRUE, 
        ${atColumn} = CURRENT_TIMESTAMP, 
        ${byColumn} = $1 
      WHERE id = $2`,
      [userId, id]
    )
    return { success: true }
  },

  async unstuff(id: string, userId: string) {
    const item = await query('SELECT * FROM "DevanningQueue" WHERE id = $1', [id])
    if (!item.rows.length) throw new Error('Not found')
    const d = item.rows[0]
    
    const cleanVessel = d.vessel && d.vessel.trim() !== '' ? d.vessel.trim() : null
    const cleanArrivalDate = d.arrivalDate && d.arrivalDate.trim() !== '' ? d.arrivalDate.trim() : null
    
    await query(
      `INSERT INTO "UnstuffedContainer" (
        "containerNumber", size, type, position, equipment, "auxCargo",
        "auxCargoType", "auxCargoQuantity", vessel, "arrivalDate", 
        agency, "devanningType", remarks, "userId"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        d.containerNumber, d.size, d.type, d.position, d.equipment, 
        d.auxCargo || '', d.auxCargoType || 'units', d.auxCargoQuantity || 0, 
        cleanVessel, cleanArrivalDate, 
        d.agency || '', d.devanningType || 'unstuffing', d.remarks || '', userId
      ]
    )
    await query('DELETE FROM "DevanningQueue" WHERE id = $1', [id])
    return { success: true }
  },

  async checkExpired() {
    const now = new Date()
    const today6am = new Date(now)
    today6am.setHours(6, 0, 0, 0)
    if (now < today6am) {
      today6am.setDate(today6am.getDate() - 1)
    }
    
    const result = await query(
      `SELECT * FROM "DevanningQueue" 
       WHERE "bookedDate" < $1 
       AND expired = FALSE 
       AND "devanningStatus" != 'ready_to_drop'`,
      [today6am.toISOString().split('T')[0]]
    )
    
    for (const item of result.rows) {
      await query(
        `INSERT INTO "Container" (
          "containerNumber", position, size, type, equipment, "auxCargo",
          "auxCargoType", "auxCargoQuantity", vessel, "arrivalDate", remarks, "receivedDate"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          item.containerNumber, item.position, item.size, item.type, 
          item.equipment, item.auxCargo || '', item.auxCargoType || 'units', 
          item.auxCargoQuantity || 0, item.vessel || '', item.arrivalDate || '',
          item.remarks || '', new Date().toISOString().split('T')[0]
        ]
      )
      await query('UPDATE "DevanningQueue" SET expired = TRUE, expiredAt = CURRENT_TIMESTAMP WHERE id = $1', [item.id])
    }
    return result.rows
  }
}
