import { Default } from '../default';
import { AnyProps } from '../types';

const RcmFormEmail = ({ blok, ...rest }: AnyProps): JSX.Element => Default({
  blok: {
    ...blok,
    component: 'rcm-form',
    type: 'email',
  },
  ...rest,
});

export const forms = {
  'rcm-form-email': RcmFormEmail,
  'rcm-form': Default,
};
