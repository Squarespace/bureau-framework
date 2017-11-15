import { UserAccounts } from '@squarespace/core';

function UserAccountsSetup (element) {
  const handleClick = (e) => {
    e.preventDefault();
    UserAccounts.openAccountScreen();
  };

  const initUserAccounts = () => {
    const signInLink = element.querySelector('.sign-in');
    const myAccountLink = element.querySelector('.my-account');
    const isUserAuthenticated = UserAccounts.isUserAuthenticated();

    if (signInLink && isUserAuthenticated) {
      signInLink.parentNode.removeChild(signInLink);
    } else if (myAccountLink && !isUserAuthenticated) {
      signInLink.parentNode.removeChild(myAccountLink);
    }

    element.classList.add('loaded');
    element.addEventListener('click', handleClick);
  };

  initUserAccounts();
}

export default UserAccountsSetup;
