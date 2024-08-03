const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(
  'sk_test_51PSwntA6aVtMiEAWB6S6Op1aFFDiD881N5M3IBVTmFgEKtAb9PsGbdnnejZigsLZikTajPPc6v6rXS6uSI9gVUz100mUQ1utxi'
);

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, I am running');
});

//checkout api
app.post('/api/create-checkout-session', async (req, res) => {
  const { products } = req.body;
  console.log(products);

  // ()=>({}) it will directly return the objcet not need to write the return keyword
  const line_items = products.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        // id: item.id,
        // description: item.user_id,
        name: item.name,
        images: [item.imageURL],
      },
      unit_amount: item.price * 100,
    },
    quantity: item.itemQuantity,
  }));

  //  success_url:

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url:
      'https://ecommerce-frontend-cd9r.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:
      'https://ecommerce-frontend-cd9r.vercel.app/cancel',
  });

  res.json({ id: session.id });
});

app.post(`/OrdersDetails`, async (req, res) => {
  let { session_id } = req.body;
  const stripe = require('stripe')(
    'sk_test_51PSwntA6aVtMiEAWB6S6Op1aFFDiD881N5M3IBVTmFgEKtAb9PsGbdnnejZigsLZikTajPPc6v6rXS6uSI9gVUz100mUQ1utxi'
  ); //passing the public key to
  //to retrieve the data from the orders details api

  const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
  res.json(lineItems);
});

app.listen(7000, () => {
  console.log('server-start');
});
