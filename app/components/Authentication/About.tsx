import React from 'react';

import SsoImg from '~/public/images/sso/SsoImg.svg';

const About: React.FC = () => {
  return (
    <div className="hidden px-20 xl:block">
      <span className="mt-30 inline-block">
        <img src={SsoImg} alt="SSO Authentication" className="w-full h-auto" />
      </span>
    </div>
  );
};

export default About;
