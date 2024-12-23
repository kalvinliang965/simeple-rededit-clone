import { act, createContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, jest, describe, beforeAll, beforeEach, it } from '@jest/globals';

import { LoginContext } from './src/App.js'; // Adjust path if necessary
import Login from './src/components/pages/login/login.jsx';
import Register from './src/components/pages/register/register.jsx';
import Welcome from './src/components/pages/welcome/welcome.jsx';
import Banner from './src/components/Banner';
import MainSectionBtnEnum from './src/components/MainSectionBtnEnum.js';
import { useNavigation } from './src/utils/navigation.js';
import { MainSectionBtnContext } from './src/components/phreddit';

jest.mock('./src/utils/navigation.js');

let renderWithLoggedInContext;
let renderWithLoggedOutContext;
let renderBannerLoggedIn;
let renderBannerLoggedOut;

const mockNavigation = {
  navigateToWelcomePage: jest.fn(),
  navigateToSearchPage: jest.fn(),
  navigateToNewPostFormPage: jest.fn(),
  navigateToProfilePage: jest.fn(),
  navigateToErrorPage: jest.fn(),
};

const loggedInContextValue = {
  currentUser: {
    displayName: 'Tommy',
  },
  isGuest: false,
  userDataVersion: 1,
  incrementUserDataVersion: jest.fn(),
  manageUserSession: jest.fn(),
};

const loggedOutContextValue = {
  currentUser: null,
  isGuest: true,
  userDataVersion: 1,
  incrementUserDataVersion: jest.fn(),
  manageUserSession: jest.fn(),
};

beforeAll(() => {
  renderWithLoggedInContext = (ui) => {
    render(
      <LoginContext.Provider value={loggedInContextValue}>
        <MemoryRouter>{ui}</MemoryRouter>
      </LoginContext.Provider>
    );
  };

  renderWithLoggedOutContext = (ui) => {
    render(
      <LoginContext.Provider value={loggedOutContextValue}>
        <MemoryRouter>{ui}</MemoryRouter>
      </LoginContext.Provider>
    );
  };

  renderBannerLoggedIn = () => {
    render(
      <MainSectionBtnContext.Provider
        value={{
          activeMainSectionBtn: MainSectionBtnEnum.HOME,
          setActiveMainSectionBtn: jest.fn(),
        }}
      >
        <LoginContext.Provider value={loggedInContextValue}>
          <MemoryRouter>
            <Banner />
          </MemoryRouter>
        </LoginContext.Provider>
      </MainSectionBtnContext.Provider>
    );
  };

  renderBannerLoggedOut = () => {
    render(
      <MainSectionBtnContext.Provider
        value={{
          activeMainSectionBtn: MainSectionBtnEnum.HOME,
          setActiveMainSectionBtn: jest.fn(),
        }}
      >
        <LoginContext.Provider value={loggedOutContextValue}>
          <MemoryRouter>
            <Banner />
          </MemoryRouter>
        </LoginContext.Provider>
      </MainSectionBtnContext.Provider>
    );
  };
});

beforeEach(() => {
  useNavigation.mockReturnValue(mockNavigation);
});


describe('Welcome Pages', () => {
    it('renders login page', () => {
        renderWithLoggedOutContext(<Login />);
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
        expect(screen.getByText(/Signup/i)).toBeInTheDocument();
    });

    it('renders register page', () => {
        renderWithLoggedOutContext(<Register />);

        expect(screen.getByRole('heading', { name: /signup/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
        expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
        expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
        expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    it('renders welcome page', () => {
        renderWithLoggedOutContext(<Welcome />);

        expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });
});


describe('Logged in cases', () => {
  

  it('renders Logout button in Banner for logged-in user', () => {
    renderBannerLoggedIn();
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  it("Should have a create-post btn and we should be able to click on it", () => {
    renderBannerLoggedIn();
    const createPostBtn = screen.getByText(/create post/i);
    expect(createPostBtn).toBeInTheDocument();  
    expect(createPostBtn).not.toBeDisabled();
   });
  
});

describe('Logged out cases', ()=>{
    it('renders Banner for logged-out user without Logout button', () => {
        renderBannerLoggedOut();
        const logoutButton = screen.queryByText('Logout');
        expect(logoutButton).not.toBeInTheDocument();
    });

    it("Should have a create-post btn and we should not be able to click on it", () => {
        renderBannerLoggedOut();
        const createPostBtn = screen.getByText(/create post/i);
        expect(createPostBtn).toBeInTheDocument();
        expect(createPostBtn).toBeDisabled();
    });
});

// Additional tests for logged out cases or other scenarios can be added here.
