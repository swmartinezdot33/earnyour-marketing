import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe/config";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("usd"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripeClient();
    
    // Fetch active products with prices
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    });

    const formattedProducts = products.data.map((product) => {
      const price = product.default_price as any;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        price: price ? {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        } : null,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const stripe = getStripeClient();

    // Create the product with a price
    const product = await stripe.products.create({
      name: validated.name,
      description: validated.description || undefined,
      active: true,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(validated.price * 100), // Convert to cents
      currency: validated.currency,
    });

    // Update product to set default price
    await stripe.products.update(product.id, {
      default_price: price.id,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        price: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error creating Stripe product:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
