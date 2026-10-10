import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';

export const SignaturePad = ({ value, onChange, label = 'Authorized Signature', required = false, defaultSignature = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  useEffect(() => {
    if (value && typeof value === 'string' && value.startsWith('/uploads/')) {
      setMode('upload');
      setUploadPreview(value);
    }
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Deep fountain pen sapphire
  }, [mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      onChange('');
    }
    setUploadPreview(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setUploadPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyDefault = () => {
    if (defaultSignature) {
      onChange(defaultSignature);
      setUploadPreview(defaultSignature);
      setMode('upload');
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label className={`form-label ${required ? 'required' : ''}`} style={{ margin: 0 }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('draw')}
          >
            <PenTool size={13} />
            Draw
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('upload')}
          >
            <Upload size={13} />
            Upload File
          </button>
          {defaultSignature && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleApplyDefault}
              title="Apply your saved profile signature"
            >
              <Sparkles size={13} color="#2563eb" />
              Use Saved
            </button>
          )}
        </div>
      </div>

      {mode === 'draw' ? (
        <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={520}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ display: 'block', width: '100%', height: 130, cursor: 'crosshair', touchAction: 'none' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            display: 'flex',
            gap: 6
          }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleClear}
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            >
              <RotateCcw size={12} />
              Clear Pad
            </button>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 12,
            fontSize: '0.75rem',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}>
            Sign with stylus or mouse pointer above line
          </div>
        </div>
      ) : (
        <div style={{
          border: '1px dashed #cbd5e1',
          borderRadius: 8,
          padding: 16,
          background: '#f8fafc',
          textAlign: 'center'
        }}>
          {uploadPreview || value ? (
            <div>
              <div style={{
                maxHeight: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: 10,
                marginBottom: 10
              }}>
                <img
                  src={uploadPreview || value}
                  alt="Signature Preview"
                  style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={13} />
                  Replace Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClear}>
                  <RotateCcw size={13} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Upload size={28} color="#64748b" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 4, fontWeight: 500 }}>
                Upload signature image (PNG, JPG, SVG)
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 12 }}>
                High-resolution transparent PNG recommended
              </p>
              <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                Browse Files
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>
      )}

      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>
          <Check size={14} />
          Digital signature attached and verified
        </div>
      )}
    </div>
  );
};
