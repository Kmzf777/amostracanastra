import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Here you would typically make a call to Mercado Pago API
      // to get the payment details, but for now we'll just update
      // the order status based on the notification
      
      // Update order status based on payment status
      // This is a simplified version - in production you'd want to
      // verify the payment status with Mercado Pago API
      
      return NextResponse.json({ 
        message: 'Notification received',
        paymentId 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      message: 'Notification type not handled' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}