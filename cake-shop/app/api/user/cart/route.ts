import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { Cake } from "@/lib/models/Cake";
import { Addon } from "@/lib/models/Addon";

function calculateTotalAmount(items: Array<{ priceOption: { sellPrice: number }; quantity: number; addons?: Array<{ price: number; quantity: number }> }>) {
  return items.reduce((total, item) => {
    const itemTotal = item.priceOption.sellPrice * item.quantity;
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

    const cart = await Cart.findOne({ userId: session.user.id });

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

    // Look up the cake to get name and image
    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        items: [],
        totalAmount: 0,
      });
    }

    const newItem: Record<string, unknown> = {
      cakeId,
      name: cake.name,
      image: cake.images?.[0]?.url || "",
      priceOption: {
        weight: priceOption.weight,
        sellPrice: priceOption.sellPrice,
      },
      quantity,
      cakeMessage: cakeMessage || "",
    };

    if (addons && addons.length > 0) {
      const addonDocs = await Addon.find({
        _id: { $in: addons.map((a: { addonId: string }) => a.addonId) },
      });
      const addonMap = new Map(addonDocs.map((a) => [a._id.toString(), a]));

      newItem.addons = addons.map(
        (addon: { addonId: string; quantity: number }) => {
          const doc = addonMap.get(addon.addonId);
          return {
            addonId: addon.addonId,
            name: doc?.name || "Addon",
            price: doc?.price || 0,
            quantity: addon.quantity,
          };
        }
      );
    }

    // Check if same cake with same weight and message already exists
    const existingIndex = cart.items.findIndex(
      (item: { cakeId: { toString(): string }; priceOption: { weight: number }; cakeMessage?: string }) =>
        item.cakeId.toString() === cakeId &&
        item.priceOption.weight === priceOption.weight &&
        (item.cakeMessage || "") === (cakeMessage || "")
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push(newItem);
    }

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

    const cart = await Cart.findOne({ userId: session.user.id });

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

    const cart = await Cart.findOne({ userId: session.user.id });

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
