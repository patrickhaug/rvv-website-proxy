import { Default } from '../default';
import { AnyProps } from '../types';

const RocheFormEmail = ({ blok, ...rest }: AnyProps): JSX.Element => Default({
  blok: {
    ...blok,
    component: 'roche-form',
    type: 'email',
  },
  ...rest,
});

export const forms = {
  'roche-form-email': RocheFormEmail,
  'roche-form': Default,
};
