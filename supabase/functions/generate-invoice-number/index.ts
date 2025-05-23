import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and Key are required")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateInvoiceNumber() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1)
  
    if (error) {
      throw new Error(error.message)
    }
  
    let nextInvoiceNumber = 1
    if (data && data.length > 0 && data[0].invoice_number) {
      const lastInvoiceNumber = data[0].invoice_number as string
      const lastNumber = parseInt(lastInvoiceNumber.replace('SRPT', ''), 10)
      nextInvoiceNumber = lastNumber + 1
    }  
    const formattedInvoiceNumber = `SRPT${nextInvoiceNumber.toString().padStart(3, '0')}`
    return { invoice_number: formattedInvoiceNumber }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to generate invoice number' }
  }
}

generateInvoiceNumber().then(res => console.log(res))
