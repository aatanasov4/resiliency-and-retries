// index.js
const { sequelize, Order, Outbox } = require('./models');
const { initProducer, sendMessage } = require('./kafka');

async function createAndPublishOrder(customerName, totalAmount) {
  // 1️⃣ Start transaction
  const t = await sequelize.transaction();

  try {
    // 2️⃣ Insert Order
    const order = await Order.create({ customerName, totalAmount }, { transaction: t });

    // 3️⃣ Insert Outbox event
    const outboxEvent = await Outbox.create({
      aggregateType: 'Order',
      aggregateId: order.id,
      type: 'OrderCreated',
      payload: { id: order.id, customerName, totalAmount },
    }, { transaction: t });

    // 4️⃣ Commit transaction
    await t.commit();

    console.log('Order and outbox event saved to DB');

    // 5️⃣ Publish to Kafka
    await sendMessage(`orders.${outboxEvent.type}`, outboxEvent.payload);

    // 6️⃣ Mark outbox as published
    await outboxEvent.update({ published: true });

    console.log('OrderCreated event published to Kafka');
  } catch (err) {
    console.error('Failed to create order or publish event', err.message);
  }
}

async function main() {
  await sequelize.sync({ force: true }); // create tables (demo only)
  await initProducer();

  await createAndPublishOrder('Alice', 99.99);
  await createAndPublishOrder('Bob', 149.50);

  process.exit(0);
}

main();