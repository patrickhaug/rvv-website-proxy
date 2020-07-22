import React from 'react';

const PocHeadline = props => {
  const { level, text } = props.blok;
  return <poc-headline level={level} headline={text}></poc-headline>
}

export default PocHeadline;