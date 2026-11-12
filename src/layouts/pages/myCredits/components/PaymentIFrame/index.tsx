import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";

const PaymentIframe: React.FC<{ src: string; onClose: any }> = ({ src, onClose }) => {
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === "your_payment_provider_domain") {
        // Check the URL to determine payment status
        const paymentUrl = new URL(event.data);
        if (paymentUrl.pathname === "/success") {
          setPaymentStatus("success");
        } else if (paymentUrl.pathname === "/failed") {
          setPaymentStatus("failed");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Dialog fullScreen open onClose={onClose}>
      {/* {paymentStatus === 'success' && <SuccessfulDialog />}
      {paymentStatus === 'failed' && <FailedDialog />} */}
      <iframe
        src={src}
        title="Payment"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      />
    </Dialog>
  );
};

export default PaymentIframe;
