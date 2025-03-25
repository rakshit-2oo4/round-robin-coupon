import './app.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [coupon, setCoupon] = useState(null);

  const getCoupon = async () => {
    try {
      const response = await axios.get('http://localhost:5000/coupon');
      setCoupon(response.data.coupon);
    } catch (error) {
      console.error(error);
      setCoupon('Failed to get coupon');
    }
  };

  return (
    <div className="app">
      <h1>Coupon Distribution</h1>
      <button onClick={getCoupon}>Get Coupon</button>
      {coupon && <p>Your coupon: {coupon}</p>}
      <div className="message success">Coupon claimed successfully!</div>
      <div className="message error">Coupon already claimed.</div>

      {/* Example Admin Panel Structure */}
      <div className="admin-panel">
        <table className="coupon-list">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Claimed By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>COUPON123</td>
              <td>Active</td>
              <td>user123</td>
            </tr>
          </tbody>
        </table>
        <div className="form-group">
          <label htmlFor="couponCode">Coupon Code:</label>
          <input type="text" id="couponCode" />
          <button>Add Coupon</button>
        </div>
      </div>
    </div>
  );
}

export default App;