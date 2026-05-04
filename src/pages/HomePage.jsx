import React, { useState, useEffect } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Traditional Sharbati Atta', price: { '500g': 65, '1kg': 120, '5kg': 545 }, category: 'atta', description: 'Premium stone-ground wheat flour', image: '/images/product_1.png' },
  { id: 2, name: 'Stone-Milled Sprouted Ragi', price: { '500g': 135, '1kg': 245 }, category: 'multigrain', description: 'Nutrient-rich ragi flour', image: '/images/product_2.png' },
  { id: 3, name: '9-Grain Multigrain', price: { '1kg': 95, '5kg': 425 }, category: 'multigrain', description: 'Blend of 9 nutritious grains', image: '/images/product_3.png' },
  { id: 4, name: 'Pure Chana Besan', price: { '1kg': 180 }, category: 'atta', description: 'Premium chickpea flour', image: '/images/product_4.png' },
  { id: 5, name: 'Millet Flour', price: { '1kg': 160 }, category: 'multigrain', description: 'Traditional millet flour', image: '/images/product_5.png' },
  { id: 6, name: 'Organic Whole Wheat', price: { '1kg': 110, '5kg': 480 }, category: 'atta', description: 'Certified organic wheat', image: '/images/product_6.png' },
  { id: 7, name: 'Premium Gluten-Free', price: { '500g': 280, '1kg': 520 }, category: 'glutenfree', description: 'Certified gluten-free blend', image: '/images/product_7.png' },
  { id: 8, name: 'Rice Flour', price: { '1kg': 95, '5kg': 425 }, category: 'glutenfree', description: 'Fine rice flour for cooking', image: '/images/product_8.png' },
  { id: 9, name: 'Makki Ka Atta', price: { '1kg': 110 }, category: 'atta', description: 'Pure corn flour', image: '/images/product_9.png' },
  { id: 10, name: 'Soyabean Flour', price: { '500g': 145 }, category: 'atta', description: 'High-protein soy flour', image: '/images/product_10.png' },
  { id: 11, name: 'Oat Atta', price: { '500g': 150, '1kg': 280 }, category: 'glutenfree', description: 'Heart-healthy oat flour', image: '/images/product_11.png' },
  { id: 12, name: 'Ancient Amaranth', price: { '500g': 185, '1kg': 349 }, category: 'glutenfree', description: 'Protein-rich amaranth flour', image: '/images/product_12.png' },
]

const ProductCard = ({ product, onAddToCart }) => {
  const weights = Object.keys(product.price)
  const [selectedWeight, setSelectedWeight] = useState(weights[0])

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="bg-amber-50 rounded-xl aspect-[320/250] flex items-center justify-center overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://placehold.co/320x250/e8e8e3/803d0a?text=' + product.name.split(' ')[0]
          }}
        />
      </div>
      <h3 className="font-bold text-sm mt-2 line-clamp-2">{product.name}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {weights.map(weight => (
          <button
            key={weight}
            onClick={() => setSelectedWeight(weight)}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
              selectedWeight === weight 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {weight}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-primary font-extrabold text-lg">₹{product.price[selectedWeight]}</span>
        <button
          onClick={() => onAddToCart(product, selectedWeight, product.price[selectedWeight])}
          className="bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
          ADD
        </button>
      </div>
    </div>
  )
}

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    loadCartCount()
  }, [])

  const loadCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    setCartCount(totalItems)
  }

  const addToCart = (product, weight, price) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: price,
      weight: weight,
      quantity: 1,
      image: product.image,
      addedAt: Date.now()
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex(i => i.productId === product.id && i.weight === weight)
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push(cartItem)
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Trigger cart update event for header
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('storage'))
    
    loadCartCount()
    alert(`✓ ${product.name} (${weight}) added to cart!`)
  }

  const getFilteredProducts = () => {
    if (activeCategory === 'atta') {
      return PRODUCTS.filter(p => p.category === 'atta')
    }
    if (activeCategory === 'multigrain') {
      return PRODUCTS.filter(p => p.category === 'multigrain')
    }
    if (activeCategory === 'glutenfree') {
      return PRODUCTS.filter(p => p.category === 'glutenfree')
    }
    return PRODUCTS
  }

  const filteredProducts = getFilteredProducts()

  const categories = [
    { id: 'all', name: 'All', icon: 'grid_view', count: PRODUCTS.length },
    { id: 'atta', name: 'Atta', icon: 'grass', count: PRODUCTS.filter(p => p.category === 'atta').length },
    { id: 'multigrain', name: 'MultiGrain', icon: 'grain', count: PRODUCTS.filter(p => p.category === 'multigrain').length },
    { id: 'glutenfree', name: 'Gluten Free', icon: 'health_and_safety', count: PRODUCTS.filter(p => p.category === 'glutenfree').length },
  ]

  return (
    <div className="pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 mx-4 mt-4 p-6">
        <div className="absolute -right-8 -top-8 opacity-10">
          <span className="material-symbols-outlined text-9xl">eco</span>
        </div>
        <div>
          <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">Harvest Festival Offer</span>
          <h2 className="text-3xl font-extrabold text-primary mt-1">Free Delivery </h2>
          <p className="text-sm text-on-surface-variant mt-1"> on 500 & above order. Freshly stone-milled grains delivered to your doorstep.</p>
          <button className="mt-4 bg-white text-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-all">
            Shop Now
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-6 pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">{cat.icon}</span>
            {cat.name}
            <span className="text-xs ml-1">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <span className="material-symbols-outlined text-5xl">search</span>
          <p className="mt-2">No products found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
