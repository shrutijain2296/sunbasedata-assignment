let bearerToken = '';
let currentCustomerId = '';

function authenticate() {
    const loginId = document.getElementById('login_id').value;
    const password = document.getElementById('password').value;
  
    axios.post('https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp', {
      login_id: loginId,
      password: password
    })
    .then(response => {
      bearerToken = response.data.token;
      showCustomerListScreen();
    })
    .catch(error => {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Check the console for details.');
    });
  }
  

function showCustomerListScreen() {
  axios.get('https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list', {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  })
  .then(response => {
    const customerTable = document.getElementById('customerTable');
    // Clear existing rows
    customerTable.innerHTML = '<tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Actions</th></tr>';

    // Populate table with customer data
    response.data.forEach(customer => {
      const row = customerTable.insertRow(-1);
      row.insertCell(0).textContent = customer.first_name;
      row.insertCell(1).textContent = customer.last_name;
      row.insertCell(2).textContent = customer.email;

      const actionsCell = row.insertCell(3);
      actionsCell.innerHTML = `
        <button onclick="showCreateUpdateScreen('update', '${customer.uuid}')">Edit</button>
        <button onclick="deleteCustomer('${customer.uuid}')">Delete</button>
      `;
    });

    // Show the customer list screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('customerListScreen').style.display = 'block';
    document.getElementById('createUpdateScreen').style.display = 'none';
  })
  .catch(error => {
    alert('Error fetching customer list: ' + error.message);
  });
}

function showCreateUpdateScreen(command, customerId = '') {
  currentCustomerId = customerId;

  // Set the form title
  document.getElementById('formTitle').textContent = `${command === 'create' ? 'Create' : 'Update'} Customer`;

  // Show the create/update screen
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('customerListScreen').style.display = 'none';
  document.getElementById('createUpdateScreen').style.display = 'block';

  if (command === 'update') {
    // Fetch customer details for update
    axios.get(`https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer&uuid=${customerId}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    })
    .then(response => {
      const customer = response.data;
      // Populate the form fields for update
      document.getElementById('first_name').value = customer.first_name;
      document.getElementById('last_name').value = customer.last_name;
      document.getElementById('street').value = customer.street;
      document.getElementById('address').value = customer.address;
      document.getElementById('city').value = customer.city;
      document.getElementById('state').value = customer.state;
      document.getElementById('email').value = customer.email;
      document.getElementById('phone').value = customer.phone;
    })
    .catch(error => {
      alert('Error fetching customer details: ' + error.message);
      showCustomerListScreen();
    });
  } else {
    // Clear form fields for create
    document.getElementById('first_name').value = '';
    document.getElementById('last_name').value = '';
    document.getElementById('street').value = '';
    document.getElementById('address').value = '"';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
  }
}

function saveCustomer() {
  const command = currentCustomerId ? 'update' : 'create';
  const url = `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=${command}`;

  const customerData = {
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    street: document.getElementById('street').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value
  };

  if (command === 'update') {
    customerData.uuid = currentCustomerId;
  }

  axios.post(url, customerData, {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  })
  .then(response => {
    alert('Customer saved successfully!');
    showCustomerListScreen();
  })
  .catch(error => {
    alert('Error saving customer: ' + error.message);
  });
}

function deleteCustomer(customerId) {
  const confirmed = confirm('Are you sure you want to delete this customer?');
  if (confirmed) {
    axios.post(`https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete&uuid=${customerId}`, null, {
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    })
    .then(response => {
      alert('Customer deleted successfully!');
      showCustomerListScreen();
    })
    .catch(error => {
      alert('Error deleting customer: ' + error.message);
    });
  }
}

function logout() {
  // Clear the token and show the login screen
  bearerToken = '';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('customerListScreen').style.display = 'none';
  document.getElementById('createUpdateScreen').style.display = 'none';
}

// Additional utility function to cancel and go back to the customer list screen
function cancel() {
  showCustomerListScreen();
}

// Initial load: Show the login screen
document.getElementById('loginScreen').style.display = 'block';
document.getElementById('customerListScreen').style.display = 'none';
document.getElementById('createUpdateScreen').style.display = 'none';
