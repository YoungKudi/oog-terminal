import { supabase } from '@/lib/db'

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Resend API key is available
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) {
      console.warn('⚠️ No email API key found. Email will be logged only.')
      // Log the email for debugging
      console.log('📧 Email would be sent to:', emailData.to)
      console.log('📧 Subject:', emailData.subject)
      console.log('📧 HTML length:', emailData.html.length)
      
      // Store in email logs table
      try {
        await supabase
          .from('ActivityLog')
          .insert({
            action: 'EMAIL_SIMULATED',
            details: JSON.stringify({
              to: emailData.to,
              subject: emailData.subject,
              timestamp: new Date().toISOString()
            })
          })
      } catch (logError) {
        console.error('Failed to log email:', logError)
      }
      
      return { success: true }
    }

    // Send using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'OOG Terminal <noreply@oog-terminal.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return { success: false, error }
    }

    // Log successful email
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

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

export async function getEmailTemplate(templateName: string): Promise<any> {
  try {
    // First try to get from database
    const { data, error } = await supabase
      .from('EmailTemplate')
      .select('*')
      .eq('name', templateName)
      .single()
    
    if (!error && data) {
      return data
    }
    
    // Fallback templates if database table doesn't exist or is empty
    const fallbackTemplates: Record<string, any> = {
      'welcome': {
        subject: 'Welcome to OOG Terminal',
        html: `
          <h1>Welcome to OOG Terminal!</h1>
          <p>Hello {{name}},</p>
          <p>Your account has been created successfully!</p>
          <p>Your Worker ID: <strong>{{userId}}</strong></p>
          <p>You will receive a confirmation email once an administrator approves your account.</p>
          <p>You will be able to access the dashboard after approval.</p>
        `
      },
      'pending_approval': {
        subject: 'Account Pending Approval - OOG Terminal',
        html: `
          <h1>Account Pending Approval</h1>
          <p>Hello {{name}},</p>
          <p>Your account registration has been received and is pending approval.</p>
          <p>An administrator will review your account shortly.</p>
          <p>Worker ID: <strong>{{userId}}</strong></p>
          <p>Email: <strong>{{email}}</strong></p>
        `
      },
      'approved': {
        subject: 'Account Approved - OOG Terminal',
        html: `
          <h1>Account Approved!</h1>
          <p>Hello {{name}},</p>
          <p>Your account has been approved by an administrator!</p>
          <p>You can now log in to the OOG Terminal dashboard.</p>
          <p><a href="{{loginUrl}}">Login to Dashboard</a></p>
          <p>Your Worker ID: <strong>{{userId}}</strong></p>
        `
      },
      'denied': {
        subject: 'Account Request Denied - OOG Terminal',
        html: `
          <h1>Account Request Denied</h1>
          <p>Hello {{name}},</p>
          <p>We regret to inform you that your account request has been denied.</p>
          <p><strong>Reason:</strong> {{reason}}</p>
          <p>If you believe this is an error, please contact support.</p>
        `
      },
      'password_reset': {
        subject: 'Password Reset Request - OOG Terminal',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hello {{name}},</p>
          <p>We received a request to reset your password.</p>
          <p><a href="{{resetUrl}}">Click here to reset your password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `
      }
    }
    
    return fallbackTemplates[templateName] || null
  } catch (error) {
    console.error('Error fetching email template:', error)
    return null
  }
}

export function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return rendered
}
