import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalContent } from '../../services';

// build time (node context) does not have document defined.
const modal = typeof document !== 'undefined' ? document.getElementById('global-modal') : null;

const Modal = 'rvv-ie-modal' as React.ElementType;

export const rvvIEModal = ({
  globalContent,
  show,
}: {
  globalContent: GlobalContent;
  show: boolean;
}): JSX.Element => <>
  { modal && ReactDOM.createPortal(<Modal
    show={show}
    headline={globalContent?.ieModal?.headline}
    intro-text={globalContent?.ieModal?.introText}
  >
  </Modal>, modal)}
</>;
