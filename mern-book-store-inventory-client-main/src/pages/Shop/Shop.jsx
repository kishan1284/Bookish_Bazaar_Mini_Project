import React, { useContext, useEffect, useState } from 'react'
import { Card, Spinner } from 'flowbite-react';
import { AuthContext } from '../../contexts/AuthProvider';
import StripeCheckout from 'react-stripe-checkout';
export default function Shop() {
  const {loading } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
// fetching data
  useEffect(() =>{
    fetch('http://localhost:5000/all-books')
    .then(res => res.json())
    .then(data => setBooks(data))
  }, [loading]);

    // loader
    if (loading) {
      return <div className="text-center mt-28">
          <Spinner aria-label="Center-aligned spinner example" />
      </div>
  }
  const makePayment = (token, book) => {
    const body = {
        token,
        book
    };
    const headers = {
        'Content-Type': 'application/json'
    };
    return fetch(`http://localhost:5000/payment`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to process payment');
        }
        return res.json();
    })
    .then(data => {
        console.log("Payment successful", data);
        // Handle successful payment if needed
    })
    .catch(err => {
        console.error("Payment error:", err);
        // Handle payment error
    });
};

  return (
    <div className='my-28 px-4 lg:px-24'>
      <h2 className='text-3xl font-bold text-center mb-16 z-40'>All Books are Available Here</h2>
        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8'>
          {
            books.map(book => <Card>
              <img src={book.imageURL} alt="" className='h-96' />
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                <p>
                  {book.bookTitle}
                </p>
              </h5>

                <span>₹250</span>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <p>
                  It is completely dedicated to learn c++
                </p>
              </p>

              <StripeCheckout
    stripeKey='pk_test_51PCegjSBS6VjnK9nN6mB3DXRP33MaO7N9juXYkz6eAQRa7khsEFWDIVopqEYG6IUdgcBSTqTnBUidwj8K85G7E0V004Kf15dOU'
    token={(token) => makePayment(token, book)} // Pass book as argument to makePayment
    name='Buy Book'
    amount={book.price * 100} // Convert price to cents
>
    <button className='px-4 py-2 bg-blue-600 text-white rounded'>Buy Now</button>
</StripeCheckout>

            </Card>)
          }
        </div>
    </div>
  )
}
