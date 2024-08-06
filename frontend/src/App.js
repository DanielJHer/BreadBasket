import './App.css';
import './Styles.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import OrderForm from './Components/OrderForm';
import OrderHistory from './Components/OrderHistory';
import Login from './Components/LogIn';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (user === null) {
    return <Login />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <Header />
        <Router>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="orderhistory">Order History</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<OrderForm />} />
            <Route path="/orderhistory" element={<OrderHistory />} />
          </Routes>
        </Router>
      </div>
      <Footer />
    </div>
  );
}

export default App;
