import React, { useState } from 'react';
import { Baby } from '@baby-tracker/shared';
import { useTranslation } from 'react-i18next';

type CreateBabyData = Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>;

interface BabyFormProps {
  onSubmit: (baby: CreateBabyData) => void;
  onCancel: () => void;
}

const BabyForm: React.FC<BabyFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>('metric');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, birthDate: new Date(birthDate), preferredUnits });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>{t('baby.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>{t('baby.birthDate')}</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>{t('baby.preferredUnits')}</label>
        <select
          value={preferredUnits}
          onChange={(e) => setPreferredUnits(e.target.value as 'metric' | 'imperial')}
        >
          <option value="metric">{t('units.metric')}</option>
          <option value="imperial">{t('units.imperial')}</option>
        </select>
      </div>

      <button type="submit">{t('common.submit')}</button>
      <button type="button" onClick={onCancel}>{t('common.cancel')}</button>
    </form>
  );
};

export default BabyForm;

