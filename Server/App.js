const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, I am running');
});

// Checkout API
app.post('/api/create-checkout-session', async (req, res) => {
  const { products } = req.body;
  console.log(products);

  const line_items = products.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.imageURL],
      },
      unit_amount: item.price * 100,
    },
    quantity: item.itemQuantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://ecommerce-frontend-txaz-e4n95i4nn-javeriachs-projects.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ecommerce-frontend-txaz-e4n95i4nn-javeriachs-projects.vercel.app/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/OrdersDetails', async (req, res) => {
  const { session_id } = req.body;

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
    res.json(lineItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
