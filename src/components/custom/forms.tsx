import { Default } from '../default';
import { AnyProps } from '../types';

const rvvFormEmail = ({ blok, ...rest }: AnyProps): JSX.Element => Default({
  blok: {
    ...blok,
    component: 'rvv-form',
    type: 'email',
  },
  ...rest,
});

export const forms = {
  'rvv-form-email': rvvFormEmail,
  'rvv-form': Default,
};
