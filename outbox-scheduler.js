// outboxPublisher.js
const { Outbox } = require('./models');
const { sendMessage } = require('./kafka');

async function publishOutboxEvents() {
  const events = await Outbox.findAll({ where: { published: false }, limit: 10 });

  for (const event of events) {
    try {
      await sendMessage(`orders.${event.type}`, event.payload); // topic naming: orders.OrderCreated
      await event.update({ published: true });
      console.log(`Published outbox event id=${event.id}`);
    } catch (err) {
      console.error(`Failed to publish event id=${event.id}`, err.message);
      // leave published=false → will retry next cycle
    }
  }
}

// Run periodically
setInterval(publishOutboxEvents, 5000);