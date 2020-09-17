import React from 'react';
import { Default } from '../default';
import { AnyProps } from '../types';

const RocheFormContact = ({ blok }: AnyProps): JSX.Element => {
  const subjectOptions = [
    {
      label: blok.subject_diagnostics,
      value: 'diagnostics',
    },
    {
      label: blok.subject_security,
      value: 'security',
    },
    {
      label: blok.subject_general,
      value: 'general',
    },
    {
      label: blok.subject_investor,
      value: 'investor',
    },
    {
      label: blok.subject_it,
      value: 'it',
    },
    {
      label: blok.subject_media,
      value: 'media',
    },
    {
      label: blok.subject_pharmaceuticals,
      value: 'pharmaceuticals',
    },
  ];
  return (
    // eslint-disable-next-line no-underscore-dangle
    <roche-form uid={blok._uid} submit={blok.submit} submit-icon={'email'} success={blok.success} error={blok.error}>
      <roche-select
        name="subject"
        label={blok.subject_label}
        options={JSON.stringify(subjectOptions)}
        required
      ></roche-select>
      <roche-input
        name="firstname"
        label={blok.firstname_label}
        placeholder={blok.placeholder_text}
        required
      ></roche-input>
      <roche-input
        name="lastname"
        label={blok.lastname_label}
        placeholder={blok.placeholder_text}
        required
      ></roche-input>
      <roche-dropdown
        name="occupation"
        label={blok.occupation_label}
        placeholder={blok.placeholder_dropdown}
        options={JSON.stringify([{ label: 'TODO', value: 'todo' }/* TODO */])}
        required
      ></roche-dropdown>
      <roche-dropdown
        name="city"
        label={blok.city_label}
        placeholder={blok.placeholder_dropdown}
        options={JSON.stringify([{ label: 'TODO', value: 'todo' }/* TODO */])}
        required
      ></roche-dropdown>
      <roche-dropdown
        name="location"
        label={blok.location_label}
        placeholder={blok.placeholder_dropdown}
        options={JSON.stringify([{ label: 'TODO', value: 'todo' }/* TODO */])}
        required
      ></roche-dropdown>
      <roche-input
        name="email"
        label={blok.email_label}
        placeholder={blok.placeholder_text}
        type='email'
        required
      ></roche-input>
      <roche-input
        name="message"
        label={blok.message_label}
        placeholder={blok.placeholder_text}
        type='textarea'
        max-length={blok.message_maximum_length}
        hint={blok.message_hint}
        required
      ></roche-input>
    </roche-form>
  );
};

export const forms = {
  'roche-form-contact': RocheFormContact,
  'roche-form': Default,
};
