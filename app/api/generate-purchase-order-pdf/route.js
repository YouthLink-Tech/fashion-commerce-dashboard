// app/api/generate-purchase-order-pdf/route.js
import { pdf } from '@react-pdf/renderer';
import PurchaseOrderPDF from '@/app/components/product/pdf/PurchaseOrderPDF';

export async function POST(req) {
  try {
    // Parse incoming JSON
    const data = await req.json();

    // Basic validation
    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate PDF
    const pdfBuffer = await pdf(<PurchaseOrderPDF data={data} />).toBuffer();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=purchase-order.pdf',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error.stack); // Log full stack trace
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}