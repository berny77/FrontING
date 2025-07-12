import React, { useEffect, useRef, useState } from 'react';
import './documents.css';

interface Documento {
  nombre: string;
  contenido: string;
}

const Documents: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [infoGeneralVisible, setInfoGeneralVisible] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [contenidoModal, setContenidoModal] = useState<string>("");

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
          fetchDocumentos(); // Recarga lista
        } else {
          setMensaje(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        setMensaje(`❌ Error de red: ${error}`);
      }
    }
  };

  const fetchDocumentos = async () => {
    try {
      const response = await fetch('http://localhost:5000/documentos');
      const data = await response.json();
      if (response.ok) {
        setDocumentos(data);
      } else {
        setMensaje(`❌ Error al cargar documentos: ${data.error}`);
      }
    } catch (error) {
      setMensaje(`❌ Error de red: ${error}`);
    }
  };

  const verInformacionDocumento = async (nombre: string) => {
    try {
      const response = await fetch(`http://localhost:5000/documento/${encodeURIComponent(nombre)}`);
      const data = await response.json();
      if (response.ok) {
        setContenidoModal(data.contenido);
        setModalVisible(true);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error de red: ${error}`);
    }
  };

  const eliminarDocumento = async (nombre: string) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar el documento "${nombre}"?`);
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:5000/documento/${encodeURIComponent(nombre)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.mensaje}`);
        fetchDocumentos(); //act  lista
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error de red: ${error}`);
    }
  };

  const verTodaLaInformacion = () => {
    setInfoGeneralVisible(!infoGeneralVisible);
  };

  const handleBusquedaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(event.target.value);
  };

  const documentosFiltrados = documentos.filter((doc) =>
    doc.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    fetchDocumentos();
  }, []);

  return (
    <div className="full-screen-container">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Buscar documento..."
          value={busqueda}
          onChange={handleBusquedaChange}
          className="search-bar"
        />
      </div>

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

        <h2>📂 Documentos almacenados:</h2>
        <ul>
          {documentosFiltrados.map((doc) => (
            <li key={doc.nombre}>
              <strong>{doc.nombre}</strong>
              <button className="view-button" onClick={() => verInformacionDocumento(doc.nombre)}>
                Ver info
              </button>
              <button className="delete-button" onClick={() => eliminarDocumento(doc.nombre)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        {documentosFiltrados.length > 0 && (
          <div>
            <button onClick={verTodaLaInformacion}>
              {infoGeneralVisible ? 'Ocultar toda la información' : 'Ver toda la información'}
            </button>
            {infoGeneralVisible && (
              <div className="info-general">
                {documentosFiltrados.map((doc) => (
                  <div key={doc.nombre}>
                    <h4>{doc.nombre}</h4>
                    <pre>{doc.contenido}</pre>
                    <hr />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setModalVisible(false)}>Cerrar</button>
            <pre className="modal-text">{contenidoModal}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
