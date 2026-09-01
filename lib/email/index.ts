import { supabase } from '@/lib/db'

// Simple email sending using Supabase Edge Functions or external service
// For now, we'll log emails and return success
// In production, integrate with SendGrid, Resend, or Supabase Edge Functions

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Log the email for debugging
    console.log('📧 Sending email to:', emailData.to)
    console.log('📧 Subject:', emailData.subject)
    console.log('📧 HTML length:', emailData.html.length)
    
    // Store in email logs table (optional)
    try {
      await supabase
        .from('ActivityLog')
        .insert({
          action: 'EMAIL_SENT',
          details: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            timestamp: new Date().toISOString()
          })
        })
    } catch (logError) {
      console.error('Failed to log email:', logError)
    }

    // In production, replace with actual email sending
    // Example: await resend.emails.send({ ... })
    
    // For now, we'll simulate success
    return { success: true }
    
  } catch (error: any) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

export async function getEmailTemplate(templateName: string): Promise<any> {
  const { data, error } = await supabase
    .from('EmailTemplate')
    .select('*')
    .eq('name', templateName)
    .single()
  
  if (error) {
    console.error('Error fetching email template:', error)
    return null
  }
  
  return data
}

export function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return rendered
}
