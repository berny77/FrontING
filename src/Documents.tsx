import React, { useRef, useState } from 'react';
import './documents.css';

const Documents: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string>("");

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('archivo', file);

      try {
        const response = await fetch('http://localhost:5000/subir', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setMensaje(`✅ ${data.mensaje}`);
        } else {
          setMensaje(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        setMensaje(`❌ Error de red: ${error}`);
      }
    }
  };

  return (
    <div className="full-screen-container">
      <div className="upload-content">
        <button className="upload-button" onClick={handleFileButtonClick}>
          Cargar documento
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.png,.jpg,.txt"
        />
        {mensaje && <p className="upload-message">{mensaje}</p>}
      </div>
    </div>
  );
};

export default Documents;
