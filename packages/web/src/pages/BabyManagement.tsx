import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BabyModal } from '../components/forms';
import { useBabyStore } from '../stores';

const BabyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { babies, loadBabies, selectBaby, selectedBabyId } = useBabyStore();

  useEffect(() => {
    loadBabies();
  }, [loadBabies]);

  return (
    <div className="baby-management">
      <header className="page-header">
        <h1>{t('navigation.babies')}</h1>
      </header>

      <div className="page-content">
        <div className="baby-list">
          {babies.length === 0 ? (
            <>
              <p>{t('baby.noBabies')}</p>
              <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                {t('baby.addBaby')}
              </button>
            </>
          ) : (
            <>
              <div className="babies-grid">
                {babies.map((baby) => (
                  <div
                    key={baby.id}
                    className={`baby-card ${selectedBabyId === baby.id ? 'baby-card--selected' : ''}`}
                    onClick={() => selectBaby(baby.id)}
                  >
                    <h3>{baby.name}</h3>
                    <p>
                      {t('baby.birthDate')}: {baby.birthDate.toLocaleDateString()}
                    </p>
                    <p>
                      {t('baby.preferredUnits')}: {baby.preferredUnits}
                    </p>
                  </div>
                ))}
              </div>
              <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                {t('baby.addBaby')}
              </button>
            </>
          )}
        </div>

        <BabyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default BabyManagement;
