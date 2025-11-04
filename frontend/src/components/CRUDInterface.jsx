import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import './CRUDInterface.css';

const CRUDInterface = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/crud/read?limit=50');
      const data = await response.json();
      setQueries(data.data || []);
    } catch (err) {
      setError('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/crud/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create query');
      }

      await fetchQueries();
      setShowCreateForm(false);
      setFormData({ location: '', start_date: '', end_date: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/crud/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update query');
      }

      await fetchQueries();
      setEditingId(null);
      setFormData({ location: '', start_date: '', end_date: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/crud/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete query');
      }

      await fetchQueries();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(`http://localhost:3001/api/export/${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather_data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to export ${format}`);
    }
  };

  const startEdit = (query) => {
    setEditingId(query.id);
    setFormData({
      location: query.location_name,
      start_date: query.start_date.split('T')[0],
      end_date: query.end_date.split('T')[0],
    });
    setShowCreateForm(true);
  };

  return (
    <div className="crud-interface">
      <div className="crud-header">
        <h2>Weather Queries Database</h2>
        <div className="crud-actions">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingId(null);
              setFormData({ location: '', start_date: '', end_date: '' });
            }}
            className="btn btn-primary"
          >
            <FaPlus /> {showCreateForm ? 'Cancel' : 'Create Query'}
          </button>
          
          <div className="export-buttons">
            <button onClick={() => handleExport('json')} className="btn btn-export" title="Export JSON">
              <FaDownload /> JSON
            </button>
            <button onClick={() => handleExport('csv')} className="btn btn-export" title="Export CSV">
              <FaDownload /> CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="btn btn-export" title="Export PDF">
              <FaDownload /> PDF
            </button>
            <button onClick={() => handleExport('markdown')} className="btn btn-export" title="Export Markdown">
              <FaDownload /> MD
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleCreate} className="crud-form">
          <h3>{editingId ? 'Update Query' : 'Create New Query'}</h3>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Zip Code, Coordinates..."
              required
            />
          </div>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setEditingId(null);
                setFormData({ location: '', start_date: '', end_date: '' });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && !showCreateForm && <div className="loading">Loading...</div>}

      <div className="queries-list">
        {queries.length === 0 ? (
          <p className="no-data">No queries found. Create one to get started!</p>
        ) : (
          queries.map((query) => (
            <div key={query.id} className="query-card">
              <div className="query-info">
                <h4>{query.location_name}</h4>
                <p>
                  <strong>Date Range:</strong> {new Date(query.start_date).toLocaleDateString()} - {new Date(query.end_date).toLocaleDateString()}
                </p>
                <p><strong>Temperature:</strong> {query.temperature}°C</p>
                <p><strong>Description:</strong> {query.description}</p>
                <p><strong>Humidity:</strong> {query.humidity}% | <strong>Wind:</strong> {query.wind_speed} m/s</p>
                <p className="query-meta">
                  Created: {new Date(query.created_at).toLocaleString()} | 
                  Updated: {new Date(query.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="query-actions">
                <button onClick={() => startEdit(query)} className="btn btn-edit" title="Edit">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(query.id)} className="btn btn-delete" title="Delete">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CRUDInterface;
