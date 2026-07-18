import Razorpay from "razorpay";

let razorpayClient;

const getRazorpayClient = () => {
  if (razorpayClient) return razorpayClient;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpayClient;
};

export default getRazorpayClient;
