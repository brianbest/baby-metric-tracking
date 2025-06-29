import React from 'react';
import { useTranslation } from 'react-i18next';

const BabyManagement: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="baby-management">
      <header className="page-header">
        <h1>{t('navigation.babies')}</h1>
      </header>

      <div className="page-content">
        <div className="baby-list">
          <p>{t('baby.noBabies')}</p>
          <button className="btn btn--primary">{t('baby.addBaby')}</button>
        </div>
      </div>
    </div>
  );
};

export default BabyManagement;
