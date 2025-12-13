import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Sweet } from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  useEffect(() => {
    loadSweets();
  }, []);

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

  const handleOpenForm = (sweet?: Sweet) => {
    if (sweet) {
      setEditingSweet(sweet);
      setFormData({
        name: sweet.name,
        category: sweet.category,
        price: sweet.price.toString(),
        quantity: sweet.quantity.toString(),
      });
    } else {
      setEditingSweet(null);
      setFormData({ name: "", category: "", price: "", quantity: "" });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSweet(null);
    setFormData({ name: "", category: "", price: "", quantity: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingSweet) {
        await api.updateSweet(editingSweet._id, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        });
      } else {
        await api.createSweet({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        });
      }
      handleCloseForm();
      await loadSweets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;

    try {
      await api.deleteSweet(id);
      await loadSweets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleRestock = async (id: string, quantity: number) => {
    try {
      await api.restockSweet(id, quantity);
      await loadSweets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Restock failed");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard </h1>
        <p>Manage your sweet inventory</p>
        <button
          onClick={() => handleOpenForm()}
          className="btn btn-primary add-btn"
        >
          + Add New Sweet
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading sweets...</p>
        </div>
      ) : (
        <div className="admin-grid">
          {sweets.map((sweet) => (
            <div key={sweet._id} className="admin-card">
              <div className="card-header">
                <span className="sweet-emoji">🍬</span>
                <div className="card-actions">
                  <button
                    onClick={() => handleOpenForm(sweet)}
                    className="icon-btn edit-btn"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(sweet._id)}
                    className="icon-btn delete-btn"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3>{sweet.name}</h3>
              <p className="sweet-category">{sweet.category}</p>
              <div className="sweet-details">
                <div className="detail-item">
                  <span className="label">Price:</span>
                  <span className="value">{sweet.price.toFixed(2)} INR</span>
                </div>
                <div className="detail-item">
                  <span className="label">Stock:</span>
                  <span
                    className={`value ${
                      sweet.quantity === 0 ? "low-stock" : ""
                    }`}
                  >
                    {sweet.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const qty = prompt("Enter restock quantity:");
                  if (qty && !isNaN(parseInt(qty))) {
                    handleRestock(sweet._id, parseInt(qty));
                  }
                }}
                className="btn btn-success restock-btn"
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSweet ? "Edit Sweet" : "Add New Sweet"}</h2>
              <button onClick={handleCloseForm} className="close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSweet ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
