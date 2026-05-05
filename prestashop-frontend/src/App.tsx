import { useEffect, useState } from 'react';
import './App.css'
import { API_QUERY, fetchFromPrestashopApi } from './utils/url';

const LANGUAGE_ID = 0;

interface Product {
  id: number;
  name: {
    language: [
      {
        "#text": string;
      }
    ]
  };
  associations: {
    images: {
      image: [
        {
          "@_xlink:href": string;
        }
      ]
    }
  }
  price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const query = new URLSearchParams({
      display: 'full',
      limit: '10'
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchFromPrestashopApi<any>('/products?' + query.toString(), {
      method: 'GET'
    })
      .then(data => {
        setProducts(data.products.product as Product[]);
        console.log('Fetched products:', data.products.product);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <>
      <h1>Prestashop</h1>

      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h2>{product.name.language[LANGUAGE_ID]['#text']}</h2>
            <p>Price: ${product.price.toFixed(2)}</p>
            {product.associations.images.image.length > 0 && (product.associations.images.image.map(image => (
              <img
                key={image['@_xlink:href']}
                src={`${image['@_xlink:href']}?${API_QUERY}`}
                alt={product.name.language[LANGUAGE_ID]['#text']}
              />
            )))}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
