// Loads Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js) once.
const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<any> | null = null;

export const loadRazorpay = (): Promise<any> => {
  const w = window as any;
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.onload = () => resolve(w.Razorpay);
      s.onerror = () => {
        loading = null;
        reject(new Error("Could not load Razorpay. Check your connection and try again."));
      };
      document.body.appendChild(s);
    });
  }
  return loading;
};

export const inrText = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
