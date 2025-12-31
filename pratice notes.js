router.post("/checkout", auth, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalBill = 0;

    // 1️⃣ Build order items
    for (const item of cart.items) {
      orderItems.push({
        product: item.product._id,
        qty: item.qty,
        priceAtPurchase: item.product.price
      });

      totalBill += item.product.price * item.qty;
    }

    // 2️⃣ Atomically decrement stock (CRITICAL FIX)
    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );

      if (result.matchedCount === 0) {
        return res.status(400).json({
          message: "Insufficient stock for one or more items"
        });
      }
    }

    // 3️⃣ Create order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      total: totalBill,
      address,
      payment: { method: "cod", status: "pending" }
    });

    // 4️⃣ Clear cart
    await Cart.deleteOne({ user: req.userId });

    res.json({
      message: "Order placed successfully",
      orderId: order._id
    });

  } catch (err) {
    console.error("checkout error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
