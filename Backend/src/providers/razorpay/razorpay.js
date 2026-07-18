const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) return null;

  return { keyId, keySecret };
};

const createRazorpayOrder = async ({ amount, currency, receipt, notes }) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    const error = new Error("Razorpay credentials are missing.");
    error.code = "RAZORPAY_CONFIG_MISSING";
    throw error;
  }

  const auth = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`,
  ).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.description || "Razorpay order creation failed.");
    error.code = "RAZORPAY_ORDER_FAILED";
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

const getRazorpayPayment = async (paymentId) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    const error = new Error("Razorpay credentials are missing.");
    error.code = "RAZORPAY_CONFIG_MISSING";
    throw error;
  }

  const auth = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`,
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.description || "Razorpay payment lookup failed.");
    error.code = "RAZORPAY_PAYMENT_LOOKUP_FAILED";
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

export {
  createRazorpayOrder,
  getRazorpayCredentials,
  getRazorpayPayment,
};
