(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const paymentId = params.get("payment") || "";
  const apiUrl = "api/paymongo.php";
  const details = document.querySelector("#memberPaymentDetails");
  const error = document.querySelector("#paymentError");
  const status = document.querySelector("#paymentStatus");
  const form = document.querySelector("#memberPaymentForm");
  const amountInput = document.querySelector("#paymentAmount");
  const submitButton = form.querySelector("button[type='submit']");
  const balanceFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
  }

  async function request(url, options) {
    const response = await fetch(url, { cache: "no-store", ...options });
    const payload = await response.json();
    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.error || `Payment service responded with ${response.status}.`);
    }
    return payload.data;
  }

  async function loadMember() {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      showError("This payment link is incomplete or invalid. Ask the treasurer for a current link.");
      return false;
    }
    const member = await request(
      `${apiUrl}?action=member&token=${encodeURIComponent(token)}`,
    );
    document.querySelector("#paymentMemberName").textContent = member.name;
    document.querySelector("#paymentBalance").textContent = balanceFormatter.format(
      Number(member.balance),
    );
    amountInput.max = member.balance;
    amountInput.value = member.balance;
    details.classList.remove("hidden");
    const hasBalance = Number(member.balance) > 0;
    amountInput.disabled = !hasBalance;
    submitButton.disabled = !hasBalance;
    if (!hasBalance) {
      status.textContent = "There is no outstanding balance to pay.";
      status.classList.remove("hidden");
    }
    return true;
  }

  async function checkPayment() {
    if (!paymentId) return;
    status.classList.remove("hidden");
    const returnState = params.get("return");
    status.textContent =
      returnState === "cancelled"
        ? "Checkout was closed. Checking whether PayMongo confirmed the payment…"
        : "Checking PayMongo for payment confirmation…";

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const payment = await request(
        `${apiUrl}?id=${encodeURIComponent(paymentId)}&token=${encodeURIComponent(token)}`,
      );
      if (payment.status === "paid" && payment.collection) {
        await loadMember();
        status.textContent = `Payment confirmed. Receipt ${payment.collection.reference}. The treasurer has been notified.`;
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?token=${encodeURIComponent(token)}`,
        );
        return;
      }
      if (payment.status === "failed") {
        status.textContent = "Checkout could not be created. Please contact the treasurer.";
        return;
      }
      status.textContent = "Waiting for PayMongo to confirm the payment…";
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    status.textContent = "Payment is still pending. The treasurer will be notified after PayMongo confirms it.";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.classList.add("hidden");
    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > Number(amountInput.max) + 0.005) {
      showError("Enter a positive amount no greater than your outstanding balance.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Connecting to PayMongo…";
    try {
      const data = await request(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, amount }),
      });
      const checkoutUrl = new URL(data?.checkoutUrl);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.paymongo.com"
      ) {
        throw new Error("PayMongo returned an invalid checkout URL.");
      }
      window.location.assign(checkoutUrl.href);
    } catch (checkoutError) {
      console.error("Could not start member PayMongo checkout.", checkoutError);
      showError(checkoutError.message || "Could not start online checkout.");
      submitButton.disabled = false;
      submitButton.textContent = "Continue to secure checkout";
    }
  });

  loadMember()
    .then((loaded) => {
      if (loaded) return checkPayment();
      return undefined;
    })
    .catch((loadError) => {
      console.error("Could not load member payment details.", loadError);
      showError(loadError.message || "Could not load payment details.");
    });
})();
