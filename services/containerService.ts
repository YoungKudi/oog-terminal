import { query } from '@/lib/db'

export const containerService = {
  async getAll() {
    const result = await query('SELECT * FROM "Container" ORDER BY "receivedDate" DESC')
    return result.rows
  },

  async create(data: any) {
    const { containerNumber, position, size, type, equipment, auxCargo, auxCargoType, auxCargoQuantity, remarks, userId } = data
    const result = await query(
      `INSERT INTO "Container" ("containerNumber", position, size, type, equipment, "auxCargo", "auxCargoType", "auxCargoQuantity", remarks, "userId") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [containerNumber, position, size, type, equipment, auxCargo, auxCargoType, auxCargoQuantity, remarks, userId]
    )
    return result.rows[0]
  },

  async update(id: string, data: any) {
    const { position, size, type, equipment, auxCargo, remarks } = data
    const result = await query(
      `UPDATE "Container" SET position = $1, size = $2, type = $3, equipment = $4, "auxCargo" = $5, remarks = $6 WHERE id = $7 RETURNING *`,
      [position, size, type, equipment, auxCargo, remarks, id]
    )
    return result.rows[0]
  },

  async delete(id: string) {
    await query('DELETE FROM "Container" WHERE id = $1', [id])
    return { success: true }
  }
}
