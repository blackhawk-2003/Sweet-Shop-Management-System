import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Sweet } from "../services/api";
import Notification from "../components/Notification";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    if (sweets.length > 0) {
      const uniqueCategories = Array.from(
        new Set(sweets.map((s) => s.category))
      );
      setCategories(uniqueCategories);
    }
  }, [sweets]);

  const loadSweets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getSweets();
      setSweets(response.sweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sweets");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      const params: {
        name?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {};
      if (searchTerm) params.name = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const response =
        Object.keys(params).length > 0
          ? await api.searchSweets(params)
          : await api.getSweets();

      setSweets(response.sweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (sweetId: string) => {
    try {
      setPurchasing(sweetId);
      const response = await api.purchaseSweet(sweetId, 1);

      // Show success notification with the sweet name from response
      setNotification({
        message: `🎉 Successfully purchased ${response.sweet.name}! Enjoy your treat!`,
        type: "success",
      });

      await loadSweets(); // Reload to get updated quantities
    } catch (err) {
      setNotification({
        message:
          err instanceof Error
            ? err.message
            : "Purchase failed. Please try again.",
        type: "error",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch =
      searchTerm === "" ||
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "" || sweet.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}! 🎉</h1>
        <p className="dashboard-subtitle">
          Discover our delightful collection of sweets
        </p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="btn btn-primary search-btn">
            Search
          </button>
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${categoryFilter === "" ? "active" : ""}`}
            onClick={() => setCategoryFilter("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                categoryFilter === cat ? "active" : ""
              }`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading sweets...</p>
        </div>
      ) : (
        <>
          {filteredSweets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍭</div>
              <h3>No sweets found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="sweets-grid">
              {filteredSweets.map((sweet) => (
                <div key={sweet._id} className="sweet-card">
                  <div className="sweet-emoji">🍬</div>
                  <h3 className="sweet-name">{sweet.name}</h3>
                  <p className="sweet-category">{sweet.category}</p>
                  <div className="sweet-price">{sweet.price.toFixed(2)} Rs</div>
                  <div className="sweet-quantity">
                    {sweet.quantity > 0 ? (
                      <span className="in-stock">
                        In Stock: {sweet.quantity}
                      </span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  <button
                    className={`btn purchase-btn ${
                      sweet.quantity === 0 ? "disabled" : ""
                    }`}
                    onClick={() => handlePurchase(sweet._id)}
                    disabled={sweet.quantity === 0 || purchasing === sweet._id}
                  >
                    {purchasing === sweet._id ? "Purchasing..." : "Purchase"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
