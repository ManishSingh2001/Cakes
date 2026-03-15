import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";

function calculateTotalAmount(items: Array<{ price: number; quantity: number; addons?: Array<{ price: number; quantity: number }> }>) {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const addonsTotal = (item.addons || []).reduce(
      (sum, addon) => sum + addon.price * addon.quantity,
      0
    );
    return total + itemTotal + addonsTotal;
  }, 0);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id })
      .populate("items.cake")
      .populate("items.addons.addon");

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: { items: [], totalAmount: 0 },
      });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { cakeId, priceOption, quantity, cakeMessage, addons } =
      await request.json();

    if (!cakeId || !priceOption || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Cake ID, price option, and quantity are required",
        },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: [],
        totalAmount: 0,
      });
    }

    const newItem: Record<string, unknown> = {
      cake: cakeId,
      priceOption,
      price: priceOption.price,
      quantity,
      cakeMessage: cakeMessage || "",
    };

    if (addons && addons.length > 0) {
      newItem.addons = addons.map(
        (addon: { addonId: string; quantity: number; price?: number }) => ({
          addon: addon.addonId,
          quantity: addon.quantity,
          price: addon.price || 0,
        })
      );
    }

    cart.items.push(newItem);
    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { itemIndex, quantity } = await request.json();

    if (itemIndex === undefined || !quantity) {
      return NextResponse.json(
        { success: false, message: "Item index and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return NextResponse.json(
        { success: false, message: "Invalid item index" },
        { status: 400 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { itemIndex } = await request.json();

    if (itemIndex === undefined) {
      return NextResponse.json(
        { success: false, message: "Item index is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return NextResponse.json(
        { success: false, message: "Invalid item index" },
        { status: 400 }
      );
    }

    cart.items.splice(itemIndex, 1);
    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
