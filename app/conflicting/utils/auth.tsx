import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = 'https://along-backend.onrender.com';

export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1/24 }); // 1 hour
  Cookies.set('refreshToken', refreshToken, { expires: 1 }); // 24 hours
};

export const getTokens = () => ({
  accessToken: Cookies.get('accessToken'),
  refreshToken: Cookies.get('refreshToken'),
});

export const clearTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('userID');
  localStorage.removeItem('name');
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axios.post(`${API_URL}/refresh-token`, {
      refreshToken,
    });

    const { accessToken, newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
};