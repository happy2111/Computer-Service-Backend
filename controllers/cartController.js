const Cart = require("../models/Cart");

// Получить корзину пользователя
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(200).json({ items: [], total_amount: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ msg: "Ошибка при получении корзины", error });
  }
};

// Добавить товар в корзину / Обновить количество
exports.addToCart = async (req, res) => {
  try {
    const { product_id, name, image, price, quantity, measure, category_id, organization_ids } = req.body;

    // Проверка обязательных полей
    if (!product_id) {
      return res.status(400).json({ msg: "product_id обязателен" });
    }

    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      cart = new Cart({ user_id: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product_id === product_id);

    if (existingItem) {
      // ЕСЛИ товар УЖЕ ЕСТЬ в корзине
      if (quantity !== undefined) {
        // Если передано количество — устанавливаем его (для инкремента/декремента)
        existingItem.quantity = quantity;
      } else {
        // Если количество не передано — увеличиваем на 1 (для первого добавления)
        existingItem.quantity += 1;
      }

      // Обновляем данные (если переданы)
      if (name) existingItem.name = name;
      if (image) existingItem.image = image;
      if (price !== undefined) existingItem.price = price;
    } else {
      // ЕСЛИ товара НЕТ в корзине — добавляем новый
      cart.items.push({
        product_id,
        name: name || "",
        image: image || "",
        price: price || 0,
        quantity: quantity || 1,
        measure: measure || null,
        category_id: category_id || null,
        organization_ids: organization_ids || [],
      });
    }

    // Пересчитать общую сумму
    cart.total_amount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Ошибка в addToCart:", error);
    res.status(500).json({ msg: "Ошибка при добавлении товара", error: error.message });
  }
};

// Удалить товар из корзины
exports.removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ msg: "Корзина не найдена" });

    cart.items = cart.items.filter((item) => item.product_id !== product_id);

    cart.total_amount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ msg: "Ошибка при удалении товара", error });
  }
};

// Очистить корзину
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ msg: "Корзина не найдена" });

    cart.items = [];
    cart.total_amount = 0;
    await cart.save();

    res.status(200).json({ msg: "Корзина очищена", cart });
  } catch (error) {
    res.status(500).json({ msg: "Ошибка при очистке корзины", error });
  }
};