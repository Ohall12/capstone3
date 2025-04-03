document.addEventListener("DOMContentLoaded", function () {
  // Automatically generate an Order ID
  const orderIdField = document.getElementById("order-id");
  orderIdField.value = "ORD" + Math.floor(100000 + Math.random() * 900000); // Generates ORD + 6-digit number

  // Access the form element
  const form = document.getElementById("payment-form");

  // Add event listener to handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get selected transaction type
    const transactionType = document.getElementById("transaction-type").value;

    // Define API endpoints based on transaction type
    const endpoints = {
      "1": "https://e7642f03-e889-4c5c-8dc2-f1f52461a5ab.mock.pstmn.io/get?authorize=success",
      "2": "https://e7642f03-e889-4c5c-8dc2-f1f52461a5ab.mock.pstmn.io/get?authorize=insufficient",
      "3": "https://e7642f03-e889-4c5c-8dc2-f1f52461a5ab.mock.pstmn.io/get?authorize=carddetails"
    };

    // Select the correct API endpoint
    const apiUrl = endpoints[transactionType] || endpoints["1"]; // Default to success if invalid selection

    // Collect payment data from form fields
    const paymentData = {
      orderId: orderIdField.value,
      customerName: document.getElementById("customer-name").value,
      address: document.getElementById("address").value,
      cardNumber: document.getElementById("cardNumber").value,
      expiryDate: document.getElementById("expiryDate").value,
      cvv: document.getElementById("cvv").value,
      zip: document.getElementById("zip").value
    };

    // Send request to the selected API endpoint
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => handlePaymentResponse(data, paymentData))
      .catch(error => {
        console.error("Error:", error);
        document.getElementById("message").innerText = "Payment failed due to an error.";
      });
  });

  // Function to handle API response
  function handlePaymentResponse(data, paymentData) {
    const messageDiv = document.getElementById("message");

    if (data.Success) {
      messageDiv.innerHTML = `
        <p>Payment Successful!</p>
        <p>Authorization Token: ${data.AuthorizationToken}</p>
        <p>Authorized Amount: $${data.AuthorizedAmount.toFixed(2)}</p>
        <p>Authorization Expiration: ${data.TokenExpirationDate}</p>
      `;
    } else {
      messageDiv.innerHTML = `<p>Payment Failed: ${data.Reason}</p>`;
    }

    // Store transaction details in table
    storeAuthorizationDetails(data);

    // Send transaction data to the mock payment API
    fetch("https://run.mocky.io/v3/b4e53431-c19e-4853-93c9-03d1cdd1e6f3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData)
    })
      .then(response => response.json())
      .then(serverResponse => console.log("Transaction Logged:", serverResponse))
      .catch(error => console.error("Error logging transaction:", error));
  }

  // Function to store transaction details in a table
  function storeAuthorizationDetails(data) {
    const table = document.getElementById("transaction-table");
    const row = table.insertRow();

    const orderIdCell = row.insertCell(0);
    const tokenCell = row.insertCell(1);
    const amountCell = row.insertCell(2);
    const expirationCell = row.insertCell(3);

    // Populate table with response data
    orderIdCell.innerText = data.OrderId || "N/A";
    tokenCell.innerText = data.AuthorizationToken || "N/A";
    amountCell.innerText = data.AuthorizedAmount ? `$${data.AuthorizedAmount.toFixed(2)}` : "N/A";
    expirationCell.innerText = data.TokenExpirationDate || "N/A";
  }
});
