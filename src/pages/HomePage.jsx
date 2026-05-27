import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const products = [
  { id: 1, name: 'Sharbati Atta', price: { '500g': 65, '1kg': 120, '5kg': 545 }, category: 'atta', image: '/images/product_1.png', description: 'Premium stone-ground wheat flour' },
  { id: 2, name: 'Traditional Wheat', price: { '500g': 135, '1kg': 245 }, category: 'atta', image: '/images/product_2.png', description: 'Nutrient-rich wheat flour' },
  { id: 3, name: 'Missi Atta', price: { '1kg': 95, '5kg': 425 }, category: 'multigrain', image: '/images/product_3.png', description: 'Blend of nutritious grains' },
  { id: 4, name: 'Chana ka Besan', price: { '1kg': 180 }, category: 'multigrain', image: '/images/product_4.png', description: 'Premium chickpea flour' },
  { id: 5, name: 'Bajar ka Atta', price: { '1kg': 160 }, category: 'multigrain', image: '/images/product_5.png', description: 'Traditional millet flour' },
  { id: 6, name: 'Jwaar ka Atta', price: { '1kg': 110, '5kg': 480 }, category: 'glutenfree', image: '/images/product_6.png', description: 'Certified organic wheat' },
  { id: 7, name: 'Chana Satu', price: {'500g': 280, '1kg': 520 }, category: 'glutenfree', image: '/images/product_7.png', description: 'Certified gluten-free blend' },
  { id: 8, name: 'Rajgri Ka Atta', price:{ '1kg': 110, '5kg': 480 }, category: 'glutenfree', image: '/images/product_8.png', description: 'Pure corn flour' },
  { id: 9, name: 'Ragi Ka Atta', price: { '1kg': 110 }, category: 'glutenfree', image: '/images/product_9.png', description: 'Pure corn flour' },
  { id: 10, name: 'Soyabean Flour', price: { '500g': 145 }, category: 'glutenfree', image: '/images/product_10.png', description: 'High-protein soy flour' },
  { id: 11, name: 'Makki ka Atta', price: { '500g': 150, '1kg': 280 }, category: 'glutenfree', image: '/images/product_11.png', description: 'Heart-healthy oat flour' },
  { id: 12, name: 'Oats ka Atta', price: { '500g': 185, '1kg': 349 }, category: 'glutenfree', image: '/images/product_12.png', description: 'Protein-rich amaranth flour' },
]

const ProductCard = ({ product, onAddToCart }) => {
  const weights = Object.keys(product.price)
  const [selectedWeight, setSelectedWeight] = useState(weights[0])
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="bg-amber-50 rounded-xl aspect-[320/250] flex items-center justify-center overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/320x250/e8e8e3/803d0a?text=' + product.name.split(' ')[0] }}
        />
      </div>
      <h3 className="font-bold text-sm mt-2 line-clamp-2">{product.name}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {weights.map(weight => (
          <button key={weight} onClick={() => setSelectedWeight(weight)}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
              selectedWeight === weight ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {weight}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-bold">-</button>
          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold">+</button>
        </div>
        <span className="text-primary font-extrabold text-lg">₹{product.price[selectedWeight]}</span>
      </div>
      <button onClick={() => onAddToCart(product, selectedWeight, product.price[selectedWeight], quantity)}
        className="w-full mt-3 bg-primary text-white py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
        ADD TO CART ({quantity})
      </button>
    </div>
  )
}

const HomePage = ({ showToast }) => {
  const [activeCategory, setActiveCategory] = useState('all')
  const navigate = useNavigate()

  const addToCart = (product, weight, price, quantity) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingIndex = cart.findIndex(item => item.productId === product.id && item.weight === weight)
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: price,
        weight: weight,
        quantity: quantity,
        image: product.image,
        addedAt: Date.now()
      })
    }
    
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cartUpdated"))
    if (showToast) showToast(`${quantity} x ${product.name} (${weight}) added!`, "success")
  }

  const getFilteredProducts = () => {
    if (activeCategory === 'atta') return products.filter(p => p.category === 'atta')
    if (activeCategory === 'multigrain') return products.filter(p => p.category === 'multigrain')
    if (activeCategory === 'glutenfree') return products.filter(p => p.category === 'glutenfree')
    return products
  }

  const categories = [
    { id: 'all', name: 'All', count: products.length },
    { id: 'atta', name: 'Atta', count: products.filter(p => p.category === 'atta').length },
    { id: 'multigrain', name: 'MultiGrain', count: products.filter(p => p.category === 'multigrain').length },
    { id: 'glutenfree', name: 'Gluten Free', count: products.filter(p => p.category === 'glutenfree').length },
  ]

  return (
    <div className="pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 mx-4 mt-4 p-6 shadow-lg">
        <div className="absolute -right-8 -top-8 opacity-10">
          <span className="material-symbols-outlined text-9xl">local_shipping</span>
        </div>
        <div className="absolute -left-8 -bottom-8 opacity-5">
          <span className="material-symbols-outlined text-8xl">redeem</span>
        </div>
        <div>
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Special Offer</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 leading-tight">
            More you Shop <br/>Less you pay <span className="material-symbols-outlined text-base">local_offer</span>
          </h2>
          <p className="text-sm text-white/90 mt-2 flex items-center gap-1 flex-wrap">
            <span className="font-bold mx-1">FREE DELIVERY</span> on any orders of <span className="font-bold mx-1">₹500 & above</span>
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="material-symbols-outlined text-sm text-white">shopping_cart</span>
              <span className="text-xs text-white">Shop now</span>
            </div>    
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 mt-6 pb-2">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'
            }`}>
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {getFilteredProducts().length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <span className="material-symbols-outlined text-5xl">search</span>
          <p className="mt-2">No products found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4">
          {getFilteredProducts().map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
