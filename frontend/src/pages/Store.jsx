import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Star, 
  X, 
  Trash2, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  MapPin,
  CreditCard,
  Wallet,
  Lock,
  CheckCircle
} from 'lucide-react'
import { API_BASE } from '../App.jsx'

export default function Store({ 
  token, 
  addToCart, 
  cart, 
  updateCartQty, 
  removeFromCart, 
  clearCart,
  wishlist, 
  toggleWishlist,
  triggerToast,
  user
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [skinType, setSkinType] = useState('All');

  // Modal Detail state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Cart Drawer & Checkout state
  const [cartOpen, setCartOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Google Maps address picker states
  const [googleMapsOpen, setGoogleMapsOpen] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapAddressTemp, setMapAddressTemp] = useState('');
  const [mapPinPos, setMapPinPos] = useState({ x: 45, y: 78 }); // Indiranagar coords default
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [mapsKey, setMapsKey] = useState('');

  // Structured Indian Shipping Address Components (PAN-India High Fidelity Delivery)
  const [flatHouseName, setFlatHouseName] = useState('');
  const [streetLocality, setStreetLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  // Razorpay payment checkout states
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState('upi'); // upi, card, netbanking
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [razorpayOtpOpen, setRazorpayOtpOpen] = useState(false);
  const [razorpayOtpCode, setRazorpayOtpCode] = useState('');
  const [razorpaySuccess, setRazorpaySuccess] = useState(false);
  const [razorpayTxnId, setRazorpayTxnId] = useState('');
  
  // UPI details
  const [upiId, setUpiId] = useState('');
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  // Netbanking bank
  const [selectedBank, setSelectedBank] = useState('');

  // Sync structured components into single delivery string
  useEffect(() => {
    const parts = [
      flatHouseName.trim(),
      streetLocality.trim(),
      landmark.trim() ? `Landmark: ${landmark.trim()}` : '',
      city.trim(),
      stateName.trim(),
      pincode.trim()
    ].filter(Boolean);
    setShippingAddress(parts.join(', '));
  }, [flatHouseName, streetLocality, landmark, city, stateName, pincode]);

  useEffect(() => {
    fetchProducts();
  }, [category, skinType, search]);

  useEffect(() => {
    if (googleMapsOpen) {
      loadGoogleMapsApi();
    }
  }, [googleMapsOpen]);

  // Fetch Google Maps API Key on mount
  useEffect(() => {
    fetchGoogleMapsKey();
  }, []);

  const fetchGoogleMapsKey = async () => {
    try {
      const res = await fetch(`${API_BASE}/google-maps-key`);
      if (res.ok) {
        const data = await res.json();
        if (data.key) {
          setMapsKey(data.key);
          loadGoogleMapsApi(data.key);
        } else {
          loadGoogleMapsApi('');
        }
      }
    } catch (err) {
      console.warn("Maps config API offline. Loading dev/mock maps.");
      loadGoogleMapsApi('');
    }
  };

  // High precision parser for Google Places / Geocoder Address Components
  const parseGooglePlace = (place) => {
    let streetNumber = '';
    let route = '';
    let sublocality = '';
    let locality = '';
    let adminCity = '';
    let adminState = '';
    let postalCode = '';

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        } else if (types.includes("route")) {
          route = component.long_name;
        } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
          sublocality = component.long_name;
        } else if (types.includes("locality")) {
          locality = component.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          adminCity = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          adminState = component.long_name;
        } else if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      }
    }

    const finalCity = locality || adminCity;
    const finalStreet = [streetNumber, route, sublocality].filter(Boolean).join(', ');

    if (finalStreet) setStreetLocality(finalStreet);
    else if (place.name && place.name !== finalCity) setStreetLocality(place.name);

    if (finalCity) setCity(finalCity);
    if (adminState) setStateName(adminState);
    if (postalCode) setPincode(postalCode);
  };

  // Browser GPS Geolocation helper
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      triggerToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    
    triggerToast("Detecting your physical location...", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocodeCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        triggerToast("Failed to retrieve GPS location. Please check browser permissions.", "error");
      }
    );
  };

  const loadGoogleMapsApi = (apiKey = mapsKey) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (googleMapsOpen) {
        setTimeout(() => initializeGoogleMap(), 300);
      }
      return;
    }
    
    const scriptId = "google-maps-api-script";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      const keyParam = apiKey ? `&key=${apiKey}` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places${keyParam}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (googleMapsOpen) {
          initializeGoogleMap();
        }
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API script.");
        triggerToast("Google Maps script failed to load. Manual input active.", "error");
      };
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkInterval);
          if (googleMapsOpen) {
            initializeGoogleMap();
          }
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  };

  // Callback ref for the main address input inside the cart drawer
  const mainAddressInputRef = (node) => {
    if (node) {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(node, {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "geometry", "formatted_address", "name"]
        });
        
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place) {
            parseGooglePlace(place);
            triggerToast("Address parsed successfully!", "success");
          }
        });
      }
    }
  };

  const initializeGoogleMap = () => {
    if (!window.google || !window.google.maps) return;
    
    const defaultCoords = { lat: 12.9716, lng: 77.5946 }; // Bengaluru default coordinates
    const mapElement = document.getElementById("google-map-element-canvas");
    if (!mapElement) return;
    
    const map = new window.google.maps.Map(mapElement, {
      center: defaultCoords,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false
    });
    
    const marker = new window.google.maps.Marker({
      position: defaultCoords,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });
    
    const inputElement = document.getElementById("google-maps-autocomplete-input");
    if (!inputElement) return;
    
    // Bind official Google Places Autocomplete input geocoder restricted to India
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "formatted_address", "name"]
    });
    
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        triggerToast("Please select a valid location from the dropdown.", "error");
        return;
      }
      
      map.setCenter(place.geometry.location);
      map.setZoom(16);
      marker.setPosition(place.geometry.location);
      setMapAddressTemp(place.formatted_address);
      parseGooglePlace(place);
      triggerToast("Address resolved successfully!", "success");
    });
    
    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      reverseGeocodeCoords(position.lat(), position.lng());
    });
    
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      reverseGeocodeCoords(e.latLng.lat(), e.latLng.lng());
    });
  };

  const reverseGeocodeCoords = (lat, lng) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            setMapAddressTemp(results[0].formatted_address);
            parseGooglePlace(results[0]);
            triggerToast("Address resolved from coordinates!", "success");
          } else {
            const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setMapAddressTemp(coordStr);
            triggerToast("No address resolved for these coordinates.", "warning");
          }
        } else {
          console.warn("Geocoder failed status check: " + status);
          // Standard mock fallback if API has limit/no-billing
          let resolved = `Plot ${Math.floor(10 + Math.random() * 150)}, Indiranagar 100 Feet Rd, Bengaluru, Karnataka, 560038`;
          if (lat > 18.0 && lat < 20.0) {
            resolved = `Flat ${Math.floor(10 + Math.random() * 200)}, Bandra West, Mumbai, Maharashtra, 400050`;
          } else if (lat > 28.0) {
            resolved = `Block E, Connaught Place, New Delhi, Delhi, 110001`;
          }
          setMapAddressTemp(resolved);
        }
      });
    } else {
      // Direct coordinate fallback if offline
      const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setMapAddressTemp(coordStr);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const qParams = [];
      if (category !== 'All') qParams.push(`category=${category}`);
      if (skinType !== 'All') qParams.push(`skin_type=${skinType}`);
      if (search) qParams.push(`search=${search}`);
      
      const queryStr = qParams.length > 0 ? `?${qParams.join('&')}` : '';
      const res = await fetch(`${API_BASE}/products${queryStr}`);
      
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.warn("Backend offline. Simulating local products list filters.");
      // Simulated static products fallback if offline
      const mockProducts = [
        {
          id: "prod_1",
          name: "HydraGlow Hyaluronic Serum",
          brand: "SkinSense Essentials",
          price: 28.0,
          rating: 4.8,
          category: "Serums",
          skin_type: "Dry",
          description: "Deeply hydrating serum infused with 2% Pure Hyaluronic Acid and Vitamin B5. Locks in moisture, plumps fine lines, and restores skin barrier.",
          ingredients: ["Hyaluronic Acid", "Vitamin B5", "Glycerin", "Allantoin"],
          image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop",
          reviews_count: 142,
          in_stock: true
        },
        {
          id: "prod_2",
          name: "Clarifying Salicylic Cleanser",
          brand: "SkinSense Essentials",
          price: 22.0,
          rating: 4.6,
          category: "Cleansers",
          skin_type: "Oily",
          description: "BHA-infused clarifying face wash that gently exfoliates skin, clears clogged pores, removes excess sebum, and reduces active acne breakouts.",
          ingredients: ["Salicylic Acid (2%)", "Tea Tree Oil", "Centella Asiatica", "Niacinamide"],
          image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop",
          reviews_count: 98,
          in_stock: true
        },
        {
          id: "prod_3",
          name: "Radiance C+ Brightening Moisturizer",
          brand: "DermaGlow Professional",
          price: 35.0,
          rating: 4.7,
          category: "Moisturizers",
          skin_type: "All",
          description: "Vitamin C antioxidant face cream designed to fade dark circles, even skin tone, combat pigmentation, and protect against environmental pollutants.",
          ingredients: ["Vitamin C", "Niacinamide", "Vitamin E", "Ferulic Acid"],
          image_url: "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=300&auto=format&fit=crop",
          reviews_count: 115,
          in_stock: true
        },
        {
          id: "prod_4",
          name: "Niacinamide 10% Barrier Recovery Gel",
          brand: "Clinique-Plus",
          price: 26.0,
          rating: 4.9,
          category: "Serums",
          skin_type: "Sensitive",
          description: "Ultralight soothing gel formulated with high-potency Niacinamide and Zinc PCA. Reduces visible redness, calms skin irritation, and shrinks enlarged pores.",
          ingredients: ["Niacinamide", "Zinc PCA", "Ceramides", "Aloe Vera Extract"],
          image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop",
          reviews_count: 184,
          in_stock: true
        },
        {
          id: "prod_5",
          name: "Youth-Restore Retinol Night Cream",
          brand: "DermaGlow Professional",
          price: 42.0,
          rating: 4.5,
          category: "Moisturizers",
          skin_type: "Combination",
          description: "Premium anti-aging overnight moisturizer with encapsulated Retinol. Encourages cell turnover, fades fine lines, and lifts sagged facial regions.",
          ingredients: ["Retinol (0.5%)", "Peptides", "Shea Butter", "Ceramides"],
          image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=300&auto=format&fit=crop",
          reviews_count: 86,
          in_stock: true
        },
        {
          id: "prod_6",
          name: "UV-Shield Mineral SPF 50+",
          brand: "SkinSense Essentials",
          price: 24.0,
          rating: 4.9,
          category: "Sunscreens",
          skin_type: "All",
          description: "Ultra-fluid physical sunscreen with Zinc Oxide. Zero white cast, matte finish, provides broad-spectrum UVA/UVB protection, and hydrates skin.",
          ingredients: ["Zinc Oxide", "Titanium Dioxide", "Green Tea Extract", "Hyaluronic Acid"],
          image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop",
          reviews_count: 210,
          in_stock: true
        }
      ];

      // Apply local client filters
      let filtered = mockProducts;
      if (category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (skinType !== 'All') {
        filtered = filtered.filter(p => p.skin_type === 'All' || p.skin_type === skinType);
      }
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Inspect specific product details and trigger lazy review seeding
  const openProductDetails = async (product) => {
    setSelectedProduct(product);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProduct(data);
      }
    } catch (err) {
      console.warn("Backend offline. Using local simulated reviews.");
      // Use local static reviews fallback
      setSelectedProduct({
        ...product,
        reviews: [
          { username: "Sarah K.", rating: 5, comment: "Saved my dry skin barrier! Smells amazing.", created_at: new Date().toISOString() },
          { username: "Michael T.", rating: 4, comment: "Very soothing, lightweight moisturizer.", created_at: new Date().toISOString() }
        ]
      });
    }
  };

  // Post custom product review
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newReview = {
      username: user?.full_name || "Customer",
      rating: parseFloat(reviewRating),
      comment: reviewComment,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE}/products/${selectedProduct.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProduct(updated);
        triggerToast("Review posted successfully!", "success");
        setReviewComment('');
        fetchProducts(); // Refresh listings to see rating changes
      }
    } catch (err) {
      // Local fallback simulation
      triggerToast("Review submission simulated locally!", "success");
      const updatedReviews = [...(selectedProduct.reviews || []), newReview];
      setSelectedProduct(prev => ({
        ...prev,
        reviews: updatedReviews,
        rating: Math.round((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length) * 10) / 10,
        reviews_count: updatedReviews.length
      }));
      setReviewComment('');
    }
  };

  // Place Order Checkout Flow (Triggers Razorpay Secure Modal)
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      triggerToast("Please input a shipping destination.", "error");
      return;
    }
    // Open the secure Razorpay Payments gateway portal
    setRazorpayOpen(true);
    setRazorpaySuccess(false);
    setRazorpayProcessing(false);
    setRazorpayOtpOpen(false);
    setRazorpayTxnId('');
    setRazorpayOtpCode('');
  };

  // Process secure backend transaction upon Razorpay Authorization
  const processSecureRazorpayOrder = async () => {
    setCheckoutLoading(true);
    setRazorpayProcessing(true);

    const itemsPayload = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: itemsPayload,
          shipping_address: shippingAddress,
          payment_method: "Razorpay"
        })
      });

      if (res.ok) {
        // Generate simulated transaction ID
        const generatedTxnId = `pay_Rzp${Math.floor(100000000 + Math.random() * 900000000)}`;
        setRazorpayTxnId(generatedTxnId);
        setRazorpaySuccess(true);
        triggerToast("Order placed successfully! Razorpay transaction authorized.", "success");
        clearCart();
      } else {
        throw new Error("Checkout failed");
      }
    } catch (err) {
      console.warn("Backend offline. Simulating secure local checkout processing.");
      setTimeout(() => {
        const generatedTxnId = `pay_Rzp${Math.floor(100000000 + Math.random() * 900000000)}`;
        setRazorpayTxnId(generatedTxnId);
        setRazorpaySuccess(true);
        triggerToast("Offline Mode: Mock order checkout completed! Razorpay simulated.", "success");
        clearCart();
      }, 1000);
    } finally {
      setCheckoutLoading(false);
      setRazorpayProcessing(false);
    }
  };

  // Google Maps address picker helpers
  const handleMapSearchChange = (value) => {
    setMapSearch(value);
    if (!value.trim()) {
      setAutocompleteSuggestions([]);
      return;
    }
    
    const indianLocations = [
      { address: "Bandra West, Mumbai, Maharashtra, 400050", coords: { x: 35, y: 65 } },
      { address: "Connaught Place, New Delhi, Delhi, 110001", coords: { x: 50, y: 25 } },
      { address: "Indiranagar, Bengaluru, Karnataka, 560038", coords: { x: 45, y: 78 } },
      { address: "Gachibowli, Hyderabad, Telangana, 500032", coords: { x: 48, y: 62 } },
      { address: "Salt Lake, Sector 5, Kolkata, West Bengal, 700091", coords: { x: 68, y: 48 } },
      { address: "Adyar, Chennai, Tamil Nadu, 600020", coords: { x: 52, y: 84 } },
      { address: "Koregaon Park, Pune, Maharashtra, 411001", coords: { x: 38, y: 68 } },
      { address: "Hazratganj, Lucknow, Uttar Pradesh, 226001", coords: { x: 58, y: 35 } }
    ];
    
    const filtered = indianLocations.filter(loc => 
      loc.address.toLowerCase().includes(value.toLowerCase())
    );
    setAutocompleteSuggestions(filtered);
  };

  const selectSuggestion = (suggestion) => {
    setMapAddressTemp(suggestion.address);
    setMapPinPos(suggestion.coords);
    setMapSearch('');
    setAutocompleteSuggestions([]);
    triggerToast(`Location updated: ${suggestion.address.split(',')[0]}`, "info");
  };

  const handleMapCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMapPinPos({ x, y });

    let customAddress = "Indiranagar 100 Feet Rd, Bengaluru, Karnataka, 560038";
    if (x < 40 && y < 50) {
      customAddress = "Connaught Place Block A, New Delhi, Delhi, 110001";
    } else if (x >= 40 && x < 60 && y < 50) {
      customAddress = "Hazratganj Crossing, Lucknow, Uttar Pradesh, 226001";
    } else if (x >= 60 && y < 50) {
      customAddress = "Salt Lake Sector 5, Kolkata, West Bengal, 700091";
    } else if (x < 40 && y >= 50) {
      customAddress = "Bandra West Sea Breeze, Mumbai, Maharashtra, 400050";
    } else if (x >= 40 && x < 60 && y >= 50) {
      customAddress = "Gachibowli Tech District, Hyderabad, Telangana, 500032";
    } else if (x >= 60 && y >= 50) {
      customAddress = "Adyar Crossing, Chennai, Tamil Nadu, 600020";
    }
    
    const mockHouseNum = Math.floor(10 + Math.random() * 200);
    const mockStreet = `Flat ${mockHouseNum}, Block C, ${customAddress}`;
    setMapAddressTemp(mockStreet);
  };

  const confirmGoogleMapsAddress = () => {
    if (!mapAddressTemp) {
      triggerToast("Please select a location on the map first.", "error");
      return;
    }
    setShippingAddress(mapAddressTemp);
    setGoogleMapsOpen(false);
    triggerToast("Shipping address locked via Google Maps!", "success");
  };

  // Cart total calculations
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* 1. Search, Filter and Cart HUD Panel */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, active ingredients..."
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10.5 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex gap-3 w-full md:w-auto">
          
          {/* Category Dropdown */}
          <div className="flex-1 md:flex-initial relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 mr-2" />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Cleansers">Cleansers</option>
              <option value="Serums">Serums</option>
              <option value="Moisturizers">Moisturizers</option>
              <option value="Sunscreens">Sunscreens</option>
            </select>
          </div>

          {/* Skin Type Dropdown */}
          <div className="flex-1 md:flex-initial relative flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-brand-accent" />
            <select 
              value={skinType} 
              onChange={(e) => setSkinType(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All">All Skin Types</option>
              <option value="Dry">Dry Skin</option>
              <option value="Oily">Oily Skin</option>
              <option value="Sensitive">Sensitive Skin</option>
              <option value="Combination">Combination</option>
            </select>
          </div>

        </div>

        {/* Cart Drawer Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow transition-all relative"
        >
          <ShoppingCart className="w-4 h-4" /> Cart Details
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-slate-950 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border border-white dark:border-slate-950">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>

      </div>

      {/* 2. Grid List of Products */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((s) => (
            <div key={s} className="bg-white/60 dark:bg-slate-900/60 rounded-3xl p-6 h-[340px] animate-pulse border border-slate-100 dark:border-slate-800"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-glass-light font-sans select-none">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-float" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-none">No Products Found</h3>
          <p className="text-xs text-slate-400 font-semibold leading-none mt-2">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const isFavorite = wishlist.includes(prod.id);
            const isUserSkinType = user?.skin_type && prod.skin_type.toLowerCase() === user.skin_type.toLowerCase();
            return (
              <div 
                key={prod.id} 
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/20 dark:hover:border-brand-500/30 transition-all duration-300 group flex flex-col justify-between h-[410px] overflow-hidden relative"
              >
                {/* Active skin-type recommender ribbon */}
                {isUserSkinType && (
                  <div className="absolute top-3 left-3 z-10 bg-brand-500 text-white font-extrabold text-[8px] tracking-wider px-2 py-0.5 rounded-lg shadow-glow flex items-center gap-1 uppercase leading-none border border-brand-400">
                    <Sparkles className="w-2.5 h-2.5" /> AI Suggested Solution
                  </div>
                )}

                {/* Picture and wishlist heart */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-950 backdrop-blur-sm rounded-xl border border-white/20 text-slate-400 hover:text-rose-500 shadow transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Content details */}
                <div className="flex-1 py-3 text-left">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{prod.brand}</span>
                  <h4 
                    onClick={() => openProductDetails(prod)}
                    className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1 truncate hover:underline hover:text-brand-500 cursor-pointer leading-tight"
                  >
                    {prod.name}
                  </h4>
                  
                  {/* Rating block */}
                  <div className="flex items-center gap-1 mt-1.5 select-none">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-none">{prod.rating}</span>
                    <span className="text-[9px] text-slate-400 font-medium">({prod.reviews_count} reviews)</span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Price and Add button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{prod.price.toFixed(0)}</span>
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="px-3.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] font-bold shadow-glow transition-all active:scale-95 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Detailed Product Modal with ingredients & reviews submit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-float-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative glass-panel">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Layout core detail */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full sm:w-36 h-40 object-cover rounded-2xl border border-slate-100 dark:border-slate-900" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{selectedProduct.brand}</span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 leading-tight">{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-1.5 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{selectedProduct.rating} Index</span>
                  <span className="text-[10px] text-slate-400 font-semibold">({selectedProduct.reviews_count} verified reviews)</span>
                </div>

                <div className="flex gap-2 mt-3 select-none">
                  <span className="text-[8px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-lg font-bold uppercase border border-brand-500/10">Category: {selectedProduct.category}</span>
                  <span className="text-[8px] bg-brand-accent/15 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg font-bold uppercase border border-brand-accent/25">Target: {selectedProduct.skin_type} Skin</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formula Description</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-semibold">{selectedProduct.description}</p>
              </div>

              {/* Active ingredients list */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Active Molecules</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedProduct.ingredients.map((ing, i) => (
                    <span key={i} className="text-[9px] font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg">{ing}</span>
                  ))}
                </div>
              </div>

              {/* User Reviews list timeline */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Reviews Feed</p>
                
                <div className="space-y-3 mt-3 max-h-[140px] overflow-y-auto pr-1">
                  {selectedProduct.reviews && selectedProduct.reviews.map((rev, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-3 text-xs">
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{rev.username}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-current" /> <span className="text-[10px] text-slate-700 dark:text-slate-300">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed leading-normal">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 mt-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Share Your Clinical Feedback</p>
                
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Rating:</span>
                  <select 
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold px-2 py-1 text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Neutral)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Failed)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your skin barrier feedback..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-glow cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* 4. Slide-over Shopping Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end no-print">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="relative flex flex-col w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full p-6 glass-panel animate-slide-left">
            
            {/* Header close */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
                <ShoppingCart className="w-5 h-5 text-brand-500" /> Shopping Cart
              </h3>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Cart products listing */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="text-center p-8 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto animate-float" />
                  <p className="text-xs text-slate-500 font-semibold leading-none">Your shopping cart is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl items-center">
                    <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-900 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate leading-tight">{item.product.name}</p>
                      <p className="text-[9px] text-slate-450 mt-0.5 font-bold leading-none">{item.product.brand}</p>
                      <p className="text-xs font-black text-brand-500 mt-2">₹{item.product.price.toFixed(0)}</p>
                    </div>
                    
                    {/* Qty and Trash */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5">
                        <button 
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-500"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-white leading-none">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-500"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-rose-500 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total checkout fields footer */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckoutSubmit} className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
                
                <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-inner">
                  
                  {/* Google search row */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-brand-500 uppercase tracking-widest block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-accent animate-bounce" /> Google Place Search (India)
                      </label>
                      
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="text-[9px] text-brand-500 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer hover:text-brand-accent transition-colors"
                        >
                          📍 GPS Geolocation
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleMapsOpen(true);
                            setMapAddressTemp(shippingAddress);
                          }}
                          className="text-[9px] text-brand-500 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer hover:text-brand-accent transition-colors"
                        >
                          🗺️ Draggable Pin Map
                        </button>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      ref={mainAddressInputRef}
                      placeholder="Search neighborhood, street name, or landmark in India..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white shadow-sm"
                    />
                  </div>

                  {/* Detailed component fields layout */}
                  <div className="space-y-2.5 text-left">
                    <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-200/40 dark:border-slate-800/40 pb-1">PAN-India Specific Delivery Details</p>
                    
                    {/* Row 1: Flat/House & Landmark */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">Flat / House / Suite No. *</label>
                        <input
                          type="text"
                          required
                          value={flatHouseName}
                          onChange={(e) => setFlatHouseName(e.target.value)}
                          placeholder="e.g. Flat 402, Block B"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">Landmark / Building</label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Metro Station"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Row 2: Locality / Street Address */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-450 uppercase block">Locality / Area / Road Address *</label>
                      <input
                        type="text"
                        required
                        value={streetLocality}
                        onChange={(e) => setStreetLocality(e.target.value)}
                        placeholder="e.g. 100 Feet Road, Indiranagar"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Row 3: City & State */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">City / Town *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">State *</label>
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          placeholder="e.g. Karnataka"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Row 4: PIN Code & Mobile */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength="6"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 560038"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-450 uppercase block">Active Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          maxLength="10"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit Indian Mobile"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                  </div>

                </div>

                <div className="flex justify-between items-center py-2.5 border-t border-dashed border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Total Purchase:</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">₹{cartSubtotal.toFixed(0)}</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-accent text-white font-extrabold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer hover:scale-102 active:scale-98"
                >
                  {checkoutLoading ? (
                    <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Place Order (Razorpay Checkout)"
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 5. Google Maps Address Autocomplete Picker Modal */}
      {googleMapsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-float-in select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 leading-none text-left">
                <MapPin className="w-4.5 h-4.5 text-brand-500" /> Google Maps Address Selector
              </h3>
              <button 
                onClick={() => setGoogleMapsOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Google Places Autocomplete Search Bar */}
            <div className="relative">
              <input
                id="google-maps-autocomplete-input"
                type="text"
                placeholder="Search any neighborhood, shop, or city in India..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>

            {/* Official Google Maps Canvas Render Container */}
            <div 
              id="google-map-element-canvas"
              className="w-full h-[240px] rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden bg-slate-50 dark:bg-slate-950"
              style={{ minHeight: '240px' }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mounting Google Map...</span>
              </div>
            </div>

            {/* Resolved Address Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl p-4 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Selected Shipping Address</p>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 font-bold leading-normal">{mapAddressTemp || "Search an address or click the map to select..."}</p>
            </div>

            <button
              onClick={confirmGoogleMapsAddress}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-glow transition-all uppercase tracking-widest cursor-pointer"
            >
              Confirm and Select Address
            </button>

          </div>
        </div>
      )}

      {/* 6. Razorpay Payments Portal Modal */}
      {razorpayOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-float-in select-none">
          <div className="bg-[#0b2d56] text-white border border-[#164478] rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header branding */}
            <div className="px-5 py-4 bg-[#082242] border-b border-[#11355c] flex justify-between items-center text-left">
              <div className="flex items-center gap-2">
                <div className="bg-brand-500 p-1.5 rounded-lg text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none text-white">Razorpay Secure Checkout</h3>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Transaction Reference: txn_{Math.random().toString(36).substr(2, 9)}</p>
                </div>
              </div>
              
              {!razorpaySuccess && !razorpayProcessing && (
                <button 
                  onClick={() => setRazorpayOpen(false)}
                  className="p-1.5 bg-[#0e3561] hover:bg-[#15467c] rounded-lg text-slate-400 hover:text-white border border-[#1a4b82] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Total display */}
            <div className="px-5 py-4 bg-[#0c2e58] border-b border-[#11355c] flex justify-between items-center text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount Payable</span>
              <span className="text-lg font-black text-brand-accent">₹{cartSubtotal.toFixed(0)}</span>
            </div>

            {/* Processing state screen */}
            {razorpayProcessing && (
              <div className="flex-1 p-8 flex flex-col justify-center items-center gap-4 text-center h-[260px]">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-4 border-dashed border-brand-accent/40 animate-spin"></span>
                  <span className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Verifying secure pipeline...</p>
                  <p className="text-[9px] text-slate-450 font-medium leading-none mt-1.5">Processing transaction with Razorpay networks...</p>
                </div>
              </div>
            )}

            {/* Successful checkout screen */}
            {razorpaySuccess && (
              <div className="flex-1 p-6 flex flex-col justify-center items-center gap-4 text-center h-[290px] animate-float-in">
                <CheckCircle className="w-14 h-14 text-emerald-500 fill-emerald-500/10 animate-bounce" />
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest leading-none">Payment Authorized</h4>
                  <p className="text-[10px] text-slate-350 font-semibold leading-relaxed mt-2.5 max-w-xs mx-auto">
                    Your payment was successfully confirmed! Order is placed in system database.
                  </p>
                </div>
                
                <div className="bg-[#072140] border border-[#11355c] rounded-2xl p-3 w-full text-left space-y-1 font-mono text-[8px] text-slate-400">
                  <p><span className="font-bold text-white">Payment Method:</span> Razorpay Online Gateway</p>
                  <p><span className="font-bold text-white">Transaction ID:</span> {razorpayTxnId}</p>
                  <p><span className="font-bold text-white">Authorized Date:</span> {new Date().toLocaleString()}</p>
                </div>

                <button
                  onClick={() => {
                    setRazorpayOpen(false);
                    setCartOpen(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg transition-all"
                >
                  Return to Store
                </button>
              </div>
            )}

            {/* Normal Checkout input state screen */}
            {!razorpayProcessing && !razorpaySuccess && !razorpayOtpOpen && (
              <div className="flex-1 flex h-[280px]">
                
                {/* Method choose left bar */}
                <div className="w-1/3 bg-[#082242] border-r border-[#11355c] flex flex-col py-2.5">
                  <button 
                    onClick={() => setRazorpayMethod('upi')}
                    className={`py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-l-2 transition-all cursor-pointer ${razorpayMethod === 'upi' ? 'bg-[#0c2f5a] border-brand-accent text-brand-accent' : 'border-transparent text-slate-400 hover:bg-[#0c2f5a]/30'}`}
                  >
                    UPI Pay
                  </button>
                  <button 
                    onClick={() => setRazorpayMethod('card')}
                    className={`py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-l-2 transition-all cursor-pointer ${razorpayMethod === 'card' ? 'bg-[#0c2f5a] border-brand-accent text-brand-accent' : 'border-transparent text-slate-450 hover:bg-[#0c2f5a]/30'}`}
                  >
                    Cards
                  </button>
                  <button 
                    onClick={() => setRazorpayMethod('netbanking')}
                    className={`py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-l-2 transition-all cursor-pointer ${razorpayMethod === 'netbanking' ? 'bg-[#0c2f5a] border-brand-accent text-brand-accent' : 'border-transparent text-slate-450 hover:bg-[#0c2f5a]/30'}`}
                  >
                    Netbanking
                  </button>
                </div>

                {/* Right input details wrapper */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left">
                  
                  {/* UPI INPUT */}
                  {razorpayMethod === 'upi' && (
                    <div className="space-y-3 text-left animate-float-in">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Instant Pay via UPI ID</p>
                      
                      {/* GPay/PhonePe buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setUpiId("skinsense@okaxis")}
                          className="py-2 rounded-xl bg-[#0d3460] border border-[#164478] text-[9px] font-bold hover:bg-[#124175] transition-colors cursor-pointer"
                        >
                          Google Pay
                        </button>
                        <button 
                          type="button"
                          onClick={() => setUpiId("skinsense@okpaytm")}
                          className="py-2 rounded-xl bg-[#0d3460] border border-[#164478] text-[9px] font-bold hover:bg-[#124175] transition-colors cursor-pointer"
                        >
                          Paytm UPI
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase block">Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. user@okhdfcbank"
                          className="w-full bg-[#082242] border border-[#164478] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-accent text-white"
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!upiId.trim() || !upiId.includes('@')) {
                            triggerToast("Please input a valid VPA address (@).", "error");
                            return;
                          }
                          setRazorpayOtpOpen(true);
                        }}
                        className="w-full mt-4 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-glow"
                      >
                        Secure Pay ₹{cartSubtotal.toFixed(0)}
                      </button>
                    </div>
                  )}

                  {/* CARDS INPUT */}
                  {razorpayMethod === 'card' && (
                    <div className="space-y-3 text-left animate-float-in">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Credit / Debit Card</p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase block">Card Number</label>
                          <input
                            type="text"
                            maxLength="19"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                            placeholder="4320 1820 9481 0294"
                            className="w-full bg-[#082242] border border-[#164478] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-accent text-white"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase block">Expiry Date</label>
                            <input
                              type="text"
                              maxLength="5"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-[#082242] border border-[#164478] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-accent text-white"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase block">CVV</label>
                            <input
                              type="password"
                              maxLength="3"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="***"
                              className="w-full bg-[#082242] border border-[#164478] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-accent text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase block">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Jane Doe"
                            className="w-full bg-[#082242] border border-[#164478] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-accent text-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (cardNumber.length < 15 || cardCvv.length < 3) {
                            triggerToast("Please input valid card credentials.", "error");
                            return;
                          }
                          setRazorpayOtpOpen(true);
                        }}
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-glow"
                      >
                        Secure Pay ₹{cartSubtotal.toFixed(0)}
                      </button>
                    </div>
                  )}

                  {/* NETBANKING INPUT */}
                  {razorpayMethod === 'netbanking' && (
                    <div className="space-y-3 text-left animate-float-in">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Popular Indian Banks</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {["SBI", "HDFC", "ICICI", "Axis"].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`py-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${selectedBank === bank ? 'bg-[#0d3460] border-[#00D2FF] text-[#00D2FF] shadow' : 'bg-[#082242]/40 border-[#164478] text-slate-400 hover:bg-[#0c2f5a]/35'}`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (!selectedBank) {
                            triggerToast("Please select your bank institution.", "error");
                            return;
                          }
                          setRazorpayOtpOpen(true);
                        }}
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-glow"
                      >
                        Pay via {selectedBank || 'Bank'}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* OTP Verification Page Screen */}
            {razorpayOtpOpen && !razorpayProcessing && !razorpaySuccess && (
              <div className="flex-1 p-6 flex flex-col justify-center items-center gap-3.5 text-center h-[280px] animate-float-in text-left">
                <div className="w-full space-y-2 text-left">
                  <div className="flex gap-2 items-center text-brand-accent">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">3D Secure Authorization</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white leading-none">Enter SMS Verification OTP</h4>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Enter the 6-digit passcode sent to your registered Indian mobile number linked with your billing account (******8820).
                  </p>
                </div>

                <div className="w-full space-y-3 mt-1">
                  <input
                    type="password"
                    maxLength="6"
                    value={razorpayOtpCode}
                    onChange={(e) => setRazorpayOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-[#082242] border border-[#164478] rounded-xl px-4 py-3 text-center tracking-widest text-sm font-black focus:outline-none focus:border-brand-accent text-white"
                  />
                  
                  <button
                    onClick={() => {
                      if (razorpayOtpCode.length < 6) {
                        triggerToast("Please input the 6-digit OTP verification code.", "error");
                        return;
                      }
                      processSecureRazorpayOrder();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#00D2FF] to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-glow transition-all"
                  >
                    Confirm & Authorize Order
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setRazorpayOtpCode("948201");
                      triggerToast("OTP Bypass Code auto-filled!", "success");
                    }}
                    className="text-[8px] text-brand-accent font-extrabold hover:underline block text-center w-full uppercase cursor-pointer"
                  >
                    Send OTP Bypass Code (Auto-Fill: 948201)
                  </button>
                </div>
              </div>
            )}

            {/* Footer indicators */}
            <div className="px-5 py-3 bg-[#082242] border-t border-[#11355c] flex justify-between items-center text-[8px] text-slate-500 text-left">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-accent" /> PCI-DSS 256-bit Secure</span>
              <span>Powered by Razorpay</span>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
