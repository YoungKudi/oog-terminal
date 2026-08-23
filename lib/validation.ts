import { z } from 'zod'

export const containerSchema = z.object({
  containerNumber: z.string()
    .regex(/^[A-Z]{4}\d{7}$/, 'Invalid container number format'),
  position: z.string().min(1, 'Position is required'),
  size: z.enum(['20', '40']),
  type: z.enum(['FR', 'OT']),
  equipment: z.string().min(1, 'Equipment is required'),
  auxCargo: z.string().optional(),
  auxCargoType: z.string().optional(),
  auxCargoQuantity: z.number().min(0).optional(),
  remarks: z.string().optional(),
})

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  workerId: z.string()
    .regex(/^(?:\d{7}|[A-Z]{2}\d{6})$/, 'Invalid Worker ID format'),
  phone: z.string().min(10, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const devanningSchema = z.object({
  containerNumber: z.string().min(1, 'Container number is required'),
  devanningType: z.enum(['unstuffing', 'house_house', 'transit', 'freezone', 're_export', 'back_to_port']),
  vessel: z.string().optional(),
  arrivalDate: z.string().optional(),
  agency: z.string().optional(),
  remarks: z.string().optional(),
})
