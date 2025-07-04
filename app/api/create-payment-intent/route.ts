import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "usd" } = await request.json()
    console.log("Received payment request:", { amount, currency })

    // Validate amount (amount is in dollars, minimum $0.50)
    if (!amount || amount < 0.5) { 
      return NextResponse.json(
        { error: "Invalid amount. Minimum charge is $0.50" },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
} 