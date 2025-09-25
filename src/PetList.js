import React, { useState, useEffect } from 'react';

function PetList() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/api/pets')
      .then(response => response.json())
      .then(data => setPets(data))
      .catch(err => console.error(err));
  }, []);

  return (
      <div className="pet-list">
        {pets.map(pet => (
          <div key={pet.id} className="pet-card">
            <img src={pet.imageUrl} alt={pet.name} className="pet-image" />
            <h3>{pet.name}</h3>
            <div className="pet-details">
              <div><strong>Age:</strong> {pet.age} years</div>
              <div><strong>Type:</strong> {pet.type}</div>
              <div><strong>Breed:</strong> {pet.breed}</div>
              <div><strong>Medical History:</strong> {pet.medicalHistory}</div>
              <div><strong>Microchip ID:</strong> {pet.microchipId}</div>
              <div><strong>Status:</strong> {pet.status}</div>
            </div>
          </div>
        ))}
      </div>
    );
}

export default PetList;
