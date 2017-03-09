import React from 'react';
import fetchTags from '../fetch-tags';
import tagStore from '../tag-store';

const login = () => {
  const fbEmail = document.getElementById('fb-email').value;
  const fbPass = document.getElementById('fb-password').value;

  if (!fbEmail || !fbPass) {
    return;
  }

  fetchTags({fbEmail, fbPass})
    .then(tags => tagStore.setTags(tags));
};

const LoginButton = () => (
  <div className="login-button-wrapper">
    <div>
      <label htmlFor="fb-email">
        FB Username
      </label>
      <input type="text" id="fb-email" />

      <br />

      <label htmlFor="fb-password">
        FB Password
      </label>
      <input type="password" id="fb-password" />

      <br />

      <button onClick={login}>
        Login
      </button>
    </div>
  </div>
);

export default LoginButton;
