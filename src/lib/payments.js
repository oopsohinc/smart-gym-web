import { api } from "@/lib/api";

export async function createVnpayPayment(payload) {
  const res = await api.post("/payments/vnpay/create", payload);
  const body = res.data || {};
  const data = body.data || {};

  return {
    ...body,
    ...data,
    data,
  };
}

export async function createCashPayment(payload) {
  // Backend should accept cash payments at this endpoint and return created payment/invoice
  const res = await api.post("/payments/cash/create", payload);
  const body = res.data || {};
  const data = body.data || {};

  return {
    ...body,
    ...data,
    data,
  };
}
