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
