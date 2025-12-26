import axios from 'axios';

const JELLYFIN_URL = process.env.JELLYFIN_URL || 'http://localhost:8096';

export const getJellyfinUrl = (path: string) => {
  const base = JELLYFIN_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
};

const AUTH_HEADERS = {
  'X-Emby-Authorization': `MediaBrowser Client="Swiparr", Device="Web", DeviceId="swiparr-web", Version="1.0.0"`,
};

export const authenticateJellyfin = async (username: string, pw: string) => {
  const url = getJellyfinUrl('Users/AuthenticateByName');
  const response = await axios.post(
    url,
    { Username: username, Pw: pw },
    { headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const getQuickConnectEnabled = async () => {
  const url = getJellyfinUrl('QuickConnect/Enabled');
  const res = await axios.get(url);
  return res.data;
};

export const initiateQuickConnect = async () => {
  const url = getJellyfinUrl('QuickConnect/Initiate');
  const res = await axios.post(url, null, { headers: AUTH_HEADERS });
  return res.data; // { Code, Secret, ... }
};

export const checkQuickConnect = async (secret: string) => {
  const url = getJellyfinUrl('Users/AuthenticateWithQuickConnect');
  const res = await axios.post(url, { Secret: secret }, { headers: AUTH_HEADERS });
  return res.data; // { User, AccessToken, ... } when authenticated
};