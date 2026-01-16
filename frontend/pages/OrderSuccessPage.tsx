import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f3f6',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#4caf50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '2.5rem'
        }}>
          ✓
        </div>

        <h1 style={{
          color: '#212121',
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Order Placed Successfully!
        </h1>

        <p style={{
          color: '#666',
          marginBottom: '2rem',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Thank you for shopping with us. Your order has been confirmed and will be delivered soon.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#ff9f00',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e68a00'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff9f00'}
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate('/track-order')}
            style={{
              backgroundColor: 'white',
              color: '#ff9f00',
              border: '2px solid #ff9f00',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ff9f00';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#ff9f00';
            }}
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
