import './App.css';
import './Styles.css'
import Header from './Components/Header';
import Footer from './Components/Footer';
import OrderForm from './Components/OrderForm';
import OrderHistory from './Components/OrderHistory';
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom"; 

function App() {
  return (
    <div className="App">
      <div className="container">
      <Header/>
      <Router>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="orderhistory">Order History</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<OrderForm/>}></Route>
          <Route path="/orderhistory" element={<OrderHistory/>}></Route>
        </Routes>
      </Router>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default App;
